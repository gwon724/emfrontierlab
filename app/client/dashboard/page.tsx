'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'qrcode';
import ClientInfoReport from '../../../client_info_report';

export default function ClientDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [qrCode, setQrCode] = useState('');
  const [showQR, setShowQR] = useState(false);
  
  // 전화번호 수정 관련 state
  const [editingPhone, setEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  
  // AI 진단 관련 state
  const [showDiagnosis, setShowDiagnosis] = useState(false);
  const [diagnosisStep, setDiagnosisStep] = useState<'start' | 'select' | 'complete'>('start');
  const [availableFunds, setAvailableFunds] = useState<any[]>([]);
  const [selectedFunds, setSelectedFunds] = useState<string[]>([]);
  const [fundDetails, setFundDetails] = useState<{[key: string]: any}>({});

  // AI 분석 보고서 관련 state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  // 고객정보 보고서 관련 state
  const [showClientInfoReport, setShowClientInfoReport] = useState(false);

  // AI 재심사 결과 모달 관련 state
  const [showReviewResultModal, setShowReviewResultModal] = useState(false);
  const [reviewResultData, setReviewResultData] = useState<any>(null);
  const [loadingReview, setLoadingReview] = useState(false);

  // 재무제표 AI 분석 관련 state
  const [showFinancialAnalysis, setShowFinancialAnalysis] = useState(false);
  const [financialData, setFinancialData] = useState([
    { year: '2023', revenue: 0, operatingProfit: 0, netProfit: 0, totalAssets: 0, totalLiabilities: 0, equity: 0 },
    { year: '2022', revenue: 0, operatingProfit: 0, netProfit: 0, totalAssets: 0, totalLiabilities: 0, equity: 0 },
    { year: '2021', revenue: 0, operatingProfit: 0, netProfit: 0, totalAssets: 0, totalLiabilities: 0, equity: 0 },
  ]);
  const [showFinancialResult, setShowFinancialResult] = useState(false);
  const [financialResult, setFinancialResult] = useState<any>(null);
  const [loadingFinancialAnalysis, setLoadingFinancialAnalysis] = useState(false);

  // AI 정책자금 평가 관련 state
  const [showFundEval, setShowFundEval] = useState(false);
  const [fundEvalData, setFundEvalData] = useState<any>(null);
  const [loadingFundEval, setLoadingFundEval] = useState(false);
  const [fundEvalFilter, setFundEvalFilter] = useState<'all' | 'eligible' | 'ineligible'>('all');

  // AI 기업집중분석 관련 state
  const [showCompanyAnalysis, setShowCompanyAnalysis] = useState(false);
  const [companyAnalysisData, setCompanyAnalysisData] = useState<any>(null);
  const [loadingCompanyAnalysis, setLoadingCompanyAnalysis] = useState(false);

  // 계정 삭제 관련 state
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  // 자동 로그아웃 타이머 (10분)
  const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10분 = 600,000ms
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchData();
    // 5초마다 자동 새로고침 (실시간 반영)
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [router]);

  // 자동 로그아웃 기능 (10분 무활동)
  useEffect(() => {
    // 로그아웃 함수
    const handleAutoLogout = () => {
      alert('보안상 로그아웃 됩니다.');
      localStorage.removeItem('clientToken');
      localStorage.removeItem('clientData');
      router.push('/client/login');
    };

    // 타이머 재설정 함수
    const resetTimer = () => {
      // 기존 타이머가 있으면 클리어
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }

      // 새로운 타이머 설정 (10분)
      const timer = setTimeout(() => {
        handleAutoLogout();
      }, INACTIVITY_TIMEOUT);

      setInactivityTimer(timer);
    };

    // 사용자 활동 감지 이벤트들
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // 모든 이벤트에 리스너 추가
    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    // 초기 타이머 설정
    resetTimer();

    // 클린업: 컴포넌트 언마운트 시 이벤트 리스너 및 타이머 제거
    return () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [inactivityTimer, router]);

  const fetchData = async () => {
    const token = localStorage.getItem('clientToken');
    if (!token) {
      router.push('/client/login');
      return;
    }

    try {
      const res = await fetch('/api/client/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setData(data);
      } else {
        localStorage.removeItem('clientToken');
        router.push('/client/login');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = async () => {
    const token = localStorage.getItem('clientToken');
    try {
      const res = await fetch('/api/qr/generate', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setQrCode(data.qrCode);
        setShowQR(true);
      }
    } catch (error) {
      console.error('Error generating QR:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('clientToken');
    localStorage.removeItem('clientData');
    router.push('/client/login');
  };

  // AI 분석 보고서 생성
  const handleGenerateReport = async () => {
    setLoadingReport(true);
    setShowReportModal(true);

    const token = localStorage.getItem('clientToken');
    try {
      const res = await fetch('/api/client/generate-report', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await res.json();
      
      if (res.ok) {
        setReportData(result.report);
      } else {
        alert(`보고서 생성 실패: ${result.error || '알 수 없는 오류'}`);
        setShowReportModal(false);
      }
    } catch (error) {
      console.error('보고서 생성 오류:', error);
      alert('보고서 생성 중 오류가 발생했습니다.');
      setShowReportModal(false);
    } finally {
      setLoadingReport(false);
    }
  };

  // QR 코드 생성 (보고서용 - 화면 및 프린트)
  useEffect(() => {
    if (showReportModal && data && !loadingReport) {
      const shareUrl = `${window.location.origin}/app/share/${data.client.id}`;
      
      // 화면용 QR 코드 (헤더)
      const canvas = document.getElementById(`qr-canvas-${data.client.id}`) as HTMLCanvasElement;
      if (canvas) {
        QRCode.toCanvas(canvas, shareUrl, {
          width: 96,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        }).catch(err => console.error('QR 생성 오류:', err));
      }
      
      // 프린트용 QR 코드 (각 페이지 헤더)
      const printCanvas = document.getElementById(`qr-canvas-print-${data.client.id}`) as HTMLCanvasElement;
      if (printCanvas) {
        QRCode.toCanvas(printCanvas, shareUrl, {
          width: 60,  // 프린트용 작은 크기
          margin: 0,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        }).catch(err => console.error('프린트 QR 생성 오류:', err));
      }
    }
  }, [showReportModal, data, loadingReport]);

  // PDF 다운로드 핸들러
  const handleDownloadPDF = () => {
    window.print();
  };

  // 전화번호 수정 핸들러
  const handleUpdatePhone = async () => {
    const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
    if (!newPhone || !phoneRegex.test(newPhone.replace(/-/g, ''))) {
      alert('올바른 전화번호 형식으로 입력해주세요. (예: 010-1234-5678)');
      return;
    }

    const token = localStorage.getItem('clientToken');
    try {
      const res = await fetch('/api/client/update-phone', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone: newPhone })
      });

      if (res.ok) {
        alert('전화번호가 변경되었습니다.');
        setEditingPhone(false);
        fetchData(); // 데이터 새로고침
      } else {
        const data = await res.json();
        alert(data.error || '전화번호 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error updating phone:', error);
      alert('서버와 통신 중 오류가 발생했습니다.');
    }
  };

  // AI 진단 시작
  const handleStartDiagnosis = async () => {
    console.log('🔵 AI 진단 시작 버튼 클릭됨');
    
    if (!confirm('AI 진단을 시작하시겠습니까? 즉시 진단 결과를 확인하실 수 있습니다.')) {
      return;
    }

    setLoadingReview(true);
    const token = localStorage.getItem('clientToken');
    console.log('🔵 토큰:', token ? '존재함' : '없음');
    
    try {
      console.log('🔵 API 호출 시작: /api/client/ai-diagnosis');
      const res = await fetch('/api/client/ai-diagnosis', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('🔵 API 응답 상태:', res.status);
      
      if (res.ok) {
        const result = await res.json();
        console.log('🔵 AI 진단 결과:', result);
        
        // 재심사와 동일하게 모달에 결과 표시
        setReviewResultData({
          sohoGrade: result.soho_grade,
          maxLoanLimit: result.max_loan_limit,
          recommendedFunds: result.recommended_funds,
          details: result.details
        });
        setShowReviewResultModal(true);
        fetchData(); // 데이터 새로고침
      } else {
        const errorData = await res.json();
        console.error('🔴 AI 진단 API 오류:', errorData);
        alert(`AI 진단에 실패했습니다: ${errorData.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('🔴 Error starting diagnosis:', error);
      alert('AI 진단 중 오류가 발생했습니다.');
    } finally {
      setLoadingReview(false);
    }
  };

  // 정책자금 선택/해제
  const toggleFund = (fundName: string) => {
    setSelectedFunds(prev => 
      prev.includes(fundName) 
        ? prev.filter(f => f !== fundName)
        : [...prev, fundName]
    );
  };

  // 정책자금 신청 제출
  const handleSubmitApplication = async () => {
    if (selectedFunds.length === 0) {
      alert('최소 1개 이상의 정책자금을 선택해주세요.');
      return;
    }

    const token = localStorage.getItem('clientToken');
    try {
      const res = await fetch('/api/client/submit-application', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ selected_funds: selectedFunds })
      });

      if (res.ok) {
        setDiagnosisStep('complete');
        alert('정책자금 신청이 완료되었습니다!');
        setShowDiagnosis(false);
        fetchData(); // 데이터 새로고침
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('신청 제출 중 오류가 발생했습니다.');
    }
  };

  // 모달에서 정책자금 신청 제출
  const handleSubmitApplicationFromModal = async () => {
    if (selectedFunds.length === 0) {
      alert('최소 1개 이상의 정책자금을 선택해주세요.');
      return;
    }

    const token = localStorage.getItem('clientToken');
    try {
      const res = await fetch('/api/client/submit-application', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ selected_funds: selectedFunds })
      });

      if (res.ok) {
        alert('정책자금 신청이 완료되었습니다!');
        setShowReviewResultModal(false);
        setReviewResultData(null);
        setSelectedFunds([]);
        fetchData(); // 데이터 새로고침
      } else {
        const errorData = await res.json();
        alert(errorData.error || '신청 제출에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('신청 제출 중 오류가 발생했습니다.');
    }
  };

  // 정책자금 삭제
  const handleDeleteFund = async (fundName: string) => {
    if (!confirm(`"${fundName}"을(를) 삭제하시겠습니까?`)) {
      return;
    }

    const token = localStorage.getItem('clientToken');
    try {
      const res = await fetch('/api/client/delete-fund', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fund_name: fundName })
      });

      const result = await res.json();
      
      if (res.ok) {
        alert(result.message);
        fetchData(); // 데이터 새로고침
      } else {
        alert(result.error || '삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error deleting fund:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  // AI 정책자금 평가 실행
  const handleOpenFundEval = async () => {
    setShowFundEval(true);
    setFundEvalData(null);
    setLoadingFundEval(true);
    setFundEvalFilter('all');
    const token = localStorage.getItem('clientToken');
    try {
      const res = await fetch('/api/client/evaluate-funds', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const d = await res.json();
      if (res.ok) setFundEvalData(d);
      else alert(d.error || '분석 실패');
    } catch { alert('오류가 발생했습니다.'); }
    finally { setLoadingFundEval(false); }
  };

  // AI 기업집중분석 실행
  const handleOpenCompanyAnalysis = async () => {
    setShowCompanyAnalysis(true);
    setCompanyAnalysisData(null);
    setLoadingCompanyAnalysis(true);
    const token = localStorage.getItem('clientToken');
    try {
      const res = await fetch('/api/client/company-analysis', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const d = await res.json();
      if (res.ok) setCompanyAnalysisData(d);
      else alert(d.error || '분석 실패');
    } catch { alert('오류가 발생했습니다.'); }
    finally { setLoadingCompanyAnalysis(false); }
  };

  // 계정 삭제
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== '탈퇴합니다') {
      alert('확인 문구를 정확히 입력해주세요.');
      return;
    }
    setDeletingAccount(true);
    const token = localStorage.getItem('clientToken');
    try {
      const res = await fetch('/api/client/delete-account', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const d = await res.json();
      if (res.ok) {
        alert('계정이 삭제되었습니다. 이용해주셔서 감사합니다.');
        localStorage.removeItem('clientToken');
        localStorage.removeItem('clientData');
        router.push('/client/login');
      } else {
        alert(d.error || '계정 삭제에 실패했습니다.');
      }
    } catch { alert('오류가 발생했습니다.'); }
    finally { setDeletingAccount(false); }
  };

  // 재심사 요청
  const handleRequestReview = async () => {
    if (!confirm('AI 재심사를 진행하시겠습니까? 즉시 새로운 진단 결과를 확인하실 수 있습니다.')) {
      return;
    }

    setLoadingReview(true);
    const token = localStorage.getItem('clientToken');
    try {
      const res = await fetch('/api/client/request-review', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await res.json();
      
      if (res.ok) {
        // 모달에 결과 표시
        setReviewResultData(result.diagnosis);
        setShowReviewResultModal(true);
        fetchData(); // 데이터 새로고침
      } else {
        alert(result.error || '재심사 요청에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error requesting review:', error);
      alert('재심사 요청 중 오류가 발생했습니다.');
    } finally {
      setLoadingReview(false);
    }
  };

  // 재무제표 데이터 변경 핸들러
  const handleFinancialDataChange = (yearIndex: number, field: string, value: string) => {
    const newData = [...financialData];
    newData[yearIndex] = {
      ...newData[yearIndex],
      [field]: parseInt(value) || 0
    };
    setFinancialData(newData);
  };

  // 재무제표 AI 분석 실행
  const handleFinancialAnalysis = async () => {
    // 데이터 검증
    const hasData = financialData.some(year => 
      year.revenue > 0 || year.operatingProfit > 0 || year.netProfit > 0
    );
    
    if (!hasData) {
      alert('최소 한 개년의 재무 데이터를 입력해주세요.');
      return;
    }

    if (!confirm('입력하신 재무제표를 기반으로 AI 분석을 진행하시겠습니까?')) {
      return;
    }

    setLoadingFinancialAnalysis(true);
    const token = localStorage.getItem('clientToken');
    
    try {
      const res = await fetch('/api/client/financial-analysis', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ financialData })
      });

      const result = await res.json();
      
      if (res.ok && result.success) {
        setFinancialResult(result.analysis);
        setShowFinancialResult(true);
        setShowFinancialAnalysis(false);
        fetchData(); // 데이터 새로고침
      } else {
        alert(result.error || '재무제표 분석에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error analyzing financial statements:', error);
      alert('재무제표 분석 중 오류가 발생했습니다.');
    } finally {
      setLoadingFinancialAnalysis(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-xl text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const getStatusColor = (status: string) => {
    const colors: any = {
      '접수대기': 'bg-gray-100 text-gray-800 border-gray-300',
      '접수완료': 'bg-blue-100 text-blue-800 border-blue-300',
      '진행중': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      '진행완료': 'bg-green-100 text-green-800 border-green-300',
      '집행완료': 'bg-purple-100 text-purple-800 border-purple-300',
      '보완': 'bg-orange-100 text-orange-800 border-orange-300',
      '반려': 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <><div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-gray-800 text-white py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* 로고 */}
          <div className="flex-shrink-0">
            <h1 className="text-base font-bold leading-tight">EMFRONTIER LAB</h1>
            <p className="text-xs text-blue-200 whitespace-nowrap">{data.client?.name}님 환영합니다</p>
          </div>
          {/* 기능 버튼들 — 한 줄 고정 */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide min-w-0 flex-1">
            <button
              onClick={handleGenerateQR}
              className="flex-shrink-0 px-3 py-1.5 text-xs bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors font-medium whitespace-nowrap"
            >
              🔲 내 QR 코드
            </button>
            <button
              onClick={handleGenerateReport}
              className="flex-shrink-0 px-3 py-1.5 text-xs bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors font-medium whitespace-nowrap"
            >
              📊 AI 분석 보고서
            </button>
            <button
              onClick={() => setShowClientInfoReport(true)}
              className="flex-shrink-0 px-3 py-1.5 text-xs bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors font-medium whitespace-nowrap"
            >
              📄 고객정보 보고서
            </button>
            <button
              onClick={() => setShowFinancialAnalysis(true)}
              className="flex-shrink-0 px-3 py-1.5 text-xs bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors font-medium whitespace-nowrap"
            >
              📈 재무제표 AI 분석
            </button>
            <button
              onClick={handleOpenFundEval}
              className="flex-shrink-0 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap"
            >
              🏦 AI 정책자금
            </button>
            <button
              onClick={handleOpenCompanyAnalysis}
              className="flex-shrink-0 px-3 py-1.5 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium whitespace-nowrap"
            >
              🚀 AI 사업계획서
            </button>
            {data.application && (
              <button
                onClick={handleRequestReview}
                className="flex-shrink-0 px-3 py-1.5 text-xs bg-green-700 text-white rounded-lg hover:bg-green-600 transition-colors font-medium whitespace-nowrap"
              >
                🔄 AI 재심사
              </button>
            )}
          </div>
          {/* 로그아웃 */}
          <button
            onClick={handleLogout}
            className="flex-shrink-0 px-3 py-1.5 text-xs bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors whitespace-nowrap"
          >
            로그아웃
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* AI 진단 시작 버튼 - 신청 전일 때만 표시 */}
        {!data.application && (
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg shadow-lg p-8 mb-6 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">🤖 AI 정책자금 진단</h2>
            <p className="text-lg mb-6">
              AI가 회원님의 정보를 분석하여 최적의 정책자금을 추천해드립니다
            </p>
            <button
              onClick={handleStartDiagnosis}
              className="px-8 py-4 bg-black text-white rounded-lg font-bold text-lg hover:bg-gray-700 transition-colors shadow-lg"
            >
              AI 진단 시작하기
            </button>
          </div>
        )}

        {/* 진행 상황 카드 - 신청 후에만 표시 */}
        {data.application && (() => {
          // 전체 상태 스텝 정의 (정상 흐름 + 특수 상태)
          const NORMAL_STEPS = ['접수대기', '접수완료', '진행중', '진행완료', '집행완료'];
          const SPECIAL_STATUS = ['보완', '반려'];
          const STATUS_ICONS: Record<string,string> = {
            '접수대기':'⏳','접수완료':'✅','진행중':'🔄','진행완료':'🏁','집행완료':'🎉','보완':'📋','반려':'❌'
          };
          const currentStatus = data.application.status;
          const currentStepIdx = NORMAL_STEPS.indexOf(currentStatus); // -1이면 보완/반려
          const isSpecial = SPECIAL_STATUS.includes(currentStatus);
          const progressPct = isSpecial ? 0 : Math.round(((currentStepIdx + 1) / NORMAL_STEPS.length) * 100);

          return (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold text-gray-800">📊 신청 진행 상황</h2>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border-2 ${getStatusColor(currentStatus)}`}>
                <span>{STATUS_ICONS[currentStatus]}</span>
                <span>{currentStatus}</span>
              </div>
            </div>

            {/* 진행도 바 (보완/반려 아닐 때) */}
            {!isSpecial && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-500 font-medium">전체 진행률</span>
                  <span className="text-sm font-bold text-gray-800">{progressPct}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div
                    className={`h-3 rounded-full transition-all duration-700 ${
                      currentStatus === '집행완료' ? 'bg-purple-500' :
                      currentStatus === '진행완료' ? 'bg-green-500' :
                      currentStatus === '진행중' ? 'bg-yellow-500' :
                      currentStatus === '접수완료' ? 'bg-blue-500' : 'bg-gray-400'
                    }`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                {/* 스텝 표시 */}
                <div className="flex justify-between relative">
                  {/* 연결선 */}
                  <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200" style={{zIndex:0}} />
                  <div
                    className="absolute top-4 left-0 h-0.5 bg-blue-500 transition-all duration-700"
                    style={{ width: currentStepIdx >= 0 ? `${(currentStepIdx / (NORMAL_STEPS.length - 1)) * 100}%` : '0%', zIndex:1 }}
                  />
                  {NORMAL_STEPS.map((step, idx) => {
                    const isDone = idx < currentStepIdx;
                    const isCurrent = idx === currentStepIdx;
                    return (
                      <div key={step} className="flex flex-col items-center" style={{zIndex:2}}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                          isCurrent ? 'bg-blue-600 text-white border-blue-600 scale-110 shadow-md' :
                          isDone ? 'bg-blue-100 text-blue-600 border-blue-400' :
                          'bg-white text-gray-400 border-gray-300'
                        }`}>
                          {isDone ? '✓' : idx + 1}
                        </div>
                        <span className={`mt-1.5 text-xs font-medium text-center leading-tight ${
                          isCurrent ? 'text-blue-700 font-bold' :
                          isDone ? 'text-blue-500' : 'text-gray-400'
                        }`} style={{maxWidth:'56px'}}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 보완/반려 특수 상태 표시 */}
            {isSpecial && (
              <div className={`mb-6 p-4 rounded-xl border-2 ${
                currentStatus === '반려' ? 'bg-red-50 border-red-300' : 'bg-orange-50 border-orange-300'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{STATUS_ICONS[currentStatus]}</span>
                  <div>
                    <p className={`font-bold text-lg ${currentStatus === '반려' ? 'text-red-700' : 'text-orange-700'}`}>
                      {currentStatus === '반려' ? '신청이 반려되었습니다' : '서류 보완이 필요합니다'}
                    </p>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {currentStatus === '반려'
                        ? 'AI 재심사를 요청하거나 담당자에게 문의해 주세요.'
                        : '담당자 안내에 따라 필요 서류를 제출해 주세요.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 상태 통계 카드 (7개 전체) */}
            <div className="grid grid-cols-4 md:grid-cols-7 gap-2 mb-4">
              {['접수대기','접수완료','진행중','진행완료','집행완료','보완','반려'].map((status, index) => {
                const isActive = currentStatus === status;
                const stepNum = NORMAL_STEPS.indexOf(status);
                return (
                  <div key={status} className={`rounded-xl p-3 text-center border-2 transition-all ${
                    isActive ? `${getStatusColor(status)} shadow-lg scale-105` : 'border-gray-100 bg-gray-50'
                  }`}>
                    <div className={`text-2xl font-black ${isActive ? '' : 'text-gray-300'}`}>
                      {stepNum >= 0 ? stepNum + 1 : (status === '보완' ? '!' : '✕')}
                    </div>
                    <div className={`text-xs font-semibold mt-0.5 ${isActive ? '' : 'text-gray-400'}`}>{STATUS_ICONS[status]}</div>
                    <div className={`text-xs font-medium mt-0.5 leading-tight ${isActive ? '' : 'text-gray-400'}`}>{status}</div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900">
                현재 상태: <span className="font-bold text-lg">{data.application.status}</span>
                {!isSpecial && currentStepIdx >= 0 && (
                  <span className="ml-2 text-blue-600 text-sm">({currentStepIdx + 1}/{NORMAL_STEPS.length} 단계)</span>
                )}
              </p>
              {data.application.notes && (
                <p className="text-sm text-blue-800 mt-2">
                  📝 메모: {data.application.notes}
                </p>
              )}
              {data.application.policy_funds && data.application.policy_funds.length > 0 && (
                <div className="mt-4 p-4 bg-white border-2 border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-blue-900">
                      💼 진행 중인 정책자금
                    </p>
                    <span className="px-3 py-1 bg-gray-800 text-white rounded-full font-bold text-sm">
                      {data.application.policy_funds.length}개
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {data.application.policy_funds.map((fund: string, idx: number) => {
                      const amount = data.application.fund_amounts?.[fund] || 0;
                      const fundStatus = data.application.fund_statuses?.[fund];
                      const status = fundStatus?.status || '접수대기';
                      const statusNotes = fundStatus?.notes || '';
                      const statusUpdatedAt = fundStatus?.updated_at || '';
                      // 정책자금별 미니 스텝바
                      const FUND_STEPS = ['접수대기','접수완료','진행중','진행완료','집행완료'];
                      const FUND_ICONS: Record<string,string> = {'접수대기':'1','접수완료':'2','진행중':'3','진행완료':'4','집행완료':'5','보완':'!','반려':'✕'};
                      const fundStepIdx = FUND_STEPS.indexOf(status);
                      const isFundSpecial = status === '보완' || status === '반려';
                      return (
                        <div key={idx} className={`bg-white px-4 py-3 rounded-lg border-2 shadow-md hover:shadow-lg transition-shadow ${
                          status === '반려' ? 'border-red-300' :
                          status === '보완' ? 'border-orange-300' :
                          status === '집행완료' ? 'border-purple-300' :
                          status === '진행완료' ? 'border-green-300' :
                          status === '진행중' ? 'border-yellow-300' :
                          status === '접수완료' ? 'border-blue-300' :
                          'border-gray-300'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-gray-800 text-sm">• {fund}</span>
                            <span className={`text-xs px-2 py-1 rounded-full font-bold border ${getStatusColor(status)}`}>
                              {status === '접수대기' && '⏳ '}
                              {status === '접수완료' && '✅ '}
                              {status === '진행중' && '🔄 '}
                              {status === '진행완료' && '🏁 '}
                              {status === '집행완료' && '🎉 '}
                              {status === '보완' && '📋 '}
                              {status === '반려' && '❌ '}
                              {status}
                            </span>
                          </div>
                          {/* 미니 스텝바 */}
                          {!isFundSpecial && (
                            <div className="flex items-center gap-1 mb-2">
                              {FUND_STEPS.map((s, i) => (
                                <div key={s} className="flex items-center gap-1 flex-1">
                                  <div className={`flex-1 flex flex-col items-center`}>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                                      i < fundStepIdx ? 'bg-blue-500 text-white border-blue-500' :
                                      i === fundStepIdx ? 'bg-blue-600 text-white border-blue-600 scale-110' :
                                      'bg-gray-100 text-gray-400 border-gray-300'
                                    }`}>{i < fundStepIdx ? '✓' : i + 1}</div>
                                    <span className={`text-xs mt-0.5 leading-tight text-center ${i === fundStepIdx ? 'text-blue-700 font-bold' : 'text-gray-400'}`} style={{fontSize:'9px'}}>{s}</span>
                                  </div>
                                  {i < FUND_STEPS.length - 1 && (
                                    <div className={`h-0.5 w-3 flex-shrink-0 rounded ${i < fundStepIdx ? 'bg-blue-500' : 'bg-gray-200'}`} />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          {statusNotes && (
                            <div className="mb-2 px-2 py-1.5 bg-gray-50 rounded border border-gray-200">
                              <p className="text-xs text-gray-600">📝 {statusNotes}</p>
                            </div>
                          )}
                          {statusUpdatedAt && (
                            <p className="text-xs text-gray-400 mb-1">
                              업데이트: {new Date(statusUpdatedAt).toLocaleDateString('ko-KR')}
                            </p>
                          )}
                          {amount > 0 && (
                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                              <span className="text-xs text-gray-600">신청금액</span>
                              <span className="text-base font-bold text-green-600">
                                {amount.toLocaleString()}원
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {data.application.fund_amounts && Object.keys(data.application.fund_amounts).length > 0 && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-800">💰 총 신청 금액</span>
                        <span className="text-2xl font-bold text-orange-600">
                          {Object.values(data.application.fund_amounts)
                            .reduce((sum: number, val: any) => sum + (val || 0), 0)
                            .toLocaleString()}원
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* 재심사 버튼 - 항상 표시 */}
            <div className="mt-4">
              <button
                onClick={handleRequestReview}
                className="w-full py-3 px-4 bg-black text-white rounded-lg font-semibold hover:bg-gray-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                AI 재심사 요청하기
              </button>
              <p className="text-xs text-gray-500 text-center mt-2">
                {data.application.status === '반려' || data.application.status === '보완' 
                  ? '재심사를 요청하면 상태가 "접수대기"로 변경되어 다시 검토됩니다.' 
                  : '현재 진행 중인 심사를 재검토 요청합니다.'}
              </p>
            </div>
          </div>
          );
        })()}

        {/* 클라이언트 정보 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">내 정보</h2>
          
          {/* 기본 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium text-gray-600">이름</label>
              <p className="text-lg font-semibold text-gray-800">{data.client?.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">이메일</label>
              <p className="text-lg font-semibold text-gray-800">{data.client?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">전화번호</label>
              {editingPhone ? (
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="010-1234-5678"
                  />
                  <button
                    onClick={handleUpdatePhone}
                    className="px-4 py-2 bg-black text-white hover:bg-gray-700 transition-all"
                  >
                    저장
                  </button>
                  <button
                    onClick={() => {
                      setEditingPhone(false);
                      setNewPhone('');
                    }}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-700 transition-all"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold text-gray-800">{data.client?.phone || '미등록'}</p>
                  <button
                    onClick={() => {
                      setEditingPhone(true);
                      setNewPhone(data.client?.phone || '');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    수정
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 신용 등급 및 점수 (한 줄로 표시) */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-600 mb-3 block">신용 등급 및 점수</label>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">SOHO 등급</span>
                <span className="px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg font-bold text-lg shadow-md">
                  {data.client?.soho_grade}등급
                </span>
              </div>
              <div className="w-px h-8 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">KCB</span>
                <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-bold text-lg shadow-md">
                  {data.client?.kcb_score || '-'}점
                </span>
              </div>
              <div className="w-px h-8 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">NICE</span>
                <span className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-bold text-lg shadow-md">
                  {data.client?.nice_score}점
                </span>
              </div>
            </div>
          </div>

          {/* 기타 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">연매출</label>
              <p className="text-lg font-semibold text-gray-800">
                {data.client?.annual_revenue?.toLocaleString()}원
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">총 부채</label>
              <p className="text-lg font-semibold text-gray-800">
                {((data.client?.debt_policy_fund || 0) + 
                  (data.client?.debt_credit_loan || 0) + 
                  (data.client?.debt_secondary_loan || 0) + 
                  (data.client?.debt_card_loan || 0)).toLocaleString()}원
              </p>
              <p className="text-xs text-gray-500 mt-1">
                정책자금 {(data.client?.debt_policy_fund || 0).toLocaleString()} + 
                신용대출 {(data.client?.debt_credit_loan || 0).toLocaleString()} + 
                2금융권 {(data.client?.debt_secondary_loan || 0).toLocaleString()} + 
                카드론 {(data.client?.debt_card_loan || 0).toLocaleString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">업력</label>
              <p className="text-lg font-semibold text-gray-800">
                {data.client?.business_years || 0}년
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">연매출</label>
              <p className="text-lg font-semibold text-green-600">
                {data.client?.annual_revenue?.toLocaleString()}원
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">총부채 (자동 합산)</label>
              <p className="text-lg font-semibold text-red-600">
                {((data.client?.debt_policy_fund || 0) + 
                  (data.client?.debt_credit_loan || 0) + 
                  (data.client?.debt_secondary_loan || 0) + 
                  (data.client?.debt_card_loan || 0)).toLocaleString()}원
              </p>
              <p className="text-xs text-gray-500 mt-1">
                정책자금 {(data.client?.debt_policy_fund || 0).toLocaleString()} + 
                신용 {(data.client?.debt_credit_loan || 0).toLocaleString()} + 
                2금융 {(data.client?.debt_secondary_loan || 0).toLocaleString()} + 
                카드 {(data.client?.debt_card_loan || 0).toLocaleString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">기술력 보유</label>
              <p className="text-lg font-semibold text-gray-800">
                {data.client?.has_technology ? '✅ 예' : '❌ 아니오'}
              </p>
            </div>
          </div>

          {/* 계정 관리 */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => setShowDeleteAccount(true)}
              className="px-4 py-2 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors font-medium"
            >
              🗑️ 계정 삭제
            </button>
            <p className="text-xs text-gray-400 mt-1">계정 삭제 시 모든 데이터가 영구 삭제됩니다.</p>
          </div>
        </div>
      </div>

      {/* AI 진단 모달 - 노션 스타일 */}
      {showDiagnosis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* 헤더 */}
            <div className="mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">AI 진단 결과</h3>
                    <p className="text-sm text-gray-500">맞춤형 정책자금 추천</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDiagnosis(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {diagnosisStep === 'select' && (
              <>
                {/* 등급 및 한도 정보 카드 - 노션 스타일 */}
                <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">🎯</span>
                        <span className="text-sm font-medium text-gray-600">SOHO 등급</span>
                      </div>
                      <div className="text-3xl font-bold text-blue-600">
                        {data.client?.soho_grade || 'C'}등급
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">💰</span>
                        <span className="text-sm font-medium text-gray-600">최대 대출 한도</span>
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {(data.client?.max_loan_limit || 0).toLocaleString()}원
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-start gap-2 bg-white rounded-lg p-3">
                    <span className="text-lg">💡</span>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      회원님의 신용점수, 매출액, 부채비율, 기술력을 종합 분석하여 <strong className="text-blue-600">{availableFunds.length}개의 정책자금</strong>을 추천해드립니다.
                    </p>
                  </div>
                </div>

                {/* 정책자금 목록 - 노션 스타일 카드 */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">📋</span>
                    <h4 className="text-lg font-bold text-gray-900">
                      추천 정책자금
                    </h4>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                      {availableFunds.length}개
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4 pl-7">
                    원하시는 정책자금을 선택해주세요 (복수 선택 가능)
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  {availableFunds.map((fund, index) => {
                    const fundName = fund.name || fund;
                    const fundCategory = fund.category || '';
                    const fundMaxAmount = fund.max_amount || 0;
                    const fundInterestRate = fund.interest_rate || '';
                    const fundRequirements = fund.requirements || '';
                    const isSelected = selectedFunds.includes(fundName);
                    return (
                      <div
                        key={index}
                        onClick={() => toggleFund(fundName)}
                        className={`group relative rounded-xl border-2 transition-all duration-200 cursor-pointer
                          ${isSelected 
                            ? 'border-blue-500 bg-blue-50 shadow-lg scale-[1.02]' 
                            : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                          }`}
                      >
                        <div className="p-5">
                          {/* 헤더 */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">
                                  {fundCategory?.includes('중진공') ? '🏢' : 
                                   fundCategory?.includes('소진공') ? '🏪' : 
                                   fundCategory?.includes('신용보증') ? '🛡️' : 
                                   fundCategory?.includes('기술보증') ? '🔬' : '💼'}
                                </span>
                                <h5 className="font-bold text-gray-900 text-base">{fundName}</h5>
                              </div>
                              {fundCategory && (
                                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md">
                                  {fundCategory}
                                </span>
                              )}
                            </div>
                            <div className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all
                              ${isSelected 
                                ? 'border-blue-500 bg-blue-500 scale-110' 
                                : 'border-gray-300 group-hover:border-blue-400'
                              }`}>
                              {isSelected && (
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </div>

                          {/* 상세 정보 */}
                          <div className="space-y-3">
                            <p className="text-sm text-gray-600 leading-relaxed pl-7">
                              {fundRequirements ? `대상: ${fundRequirements}` : '자격 요건을 확인해주세요.'}
                            </p>
                            
                            {/* 핵심 정보 그리드 - 노션 스타일 */}
                            <div className="grid grid-cols-2 gap-3 pl-7">
                              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                                <div className="flex items-center gap-1 mb-1">
                                  <span className="text-sm">💵</span>
                                  <span className="text-xs font-medium text-gray-600">최대 한도</span>
                                </div>
                                <p className="text-lg font-bold text-blue-700">
                                  {fundMaxAmount ? `${(fundMaxAmount / 100000000).toFixed(1)}억원` : '미정'}
                                </p>
                              </div>
                                
                              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                                <div className="flex items-center gap-1 mb-1">
                                  <span className="text-sm">📊</span>
                                  <span className="text-xs font-medium text-gray-600">금리</span>
                                </div>
                                <p className="text-lg font-bold text-green-700">
                                  {fundInterestRate || '미정'}
                                </p>
                              </div>
                            </div>
                            
                            {/* 자격 요건 */}
                            {fundRequirements && (
                              <div className="pl-7">
                                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-3 border border-amber-200">
                                  <div className="flex items-center gap-1 mb-1">
                                    <span className="text-sm">✅</span>
                                    <span className="text-xs font-medium text-gray-600">자격 요건</span>
                                  </div>
                                  <p className="text-sm font-medium text-amber-800">
                                    {fundRequirements}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 액션 버튼 - 노션 스타일 */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowDiagnosis(false)}
                    className="flex-1 py-3 px-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      취소
                    </span>
                  </button>
                  <button
                    onClick={handleSubmitApplication}
                    disabled={selectedFunds.length === 0}
                    className="flex-1 py-3 px-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-700 transition-all shadow-md hover:shadow-lg disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      신청하기 ({selectedFunds.length}개 선택)
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-5 max-w-xs w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-2 text-center">
              내 QR 코드
            </h3>
            <p className="text-xs text-gray-500 mb-3 text-center">
              관리자가 스캔하여 내 정보를 확인할 수 있습니다
            </p>
            <div className="flex justify-center mb-4">
              {qrCode && <img src={qrCode} alt="QR Code" className="w-44 h-44" />}
            </div>
            <button
              onClick={() => setShowQR(false)}
              className="w-full py-2 bg-black text-white rounded-lg font-semibold text-sm hover:bg-gray-700 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      )}


      {/* 📊 AI 분석 보고서 모달 */}
{showReportModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto print:bg-white print:block print:p-0" id="report-modal-overlay">
    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[88vh] overflow-y-auto shadow-2xl print:max-w-full print:shadow-none print:rounded-none report-page" id="report-modal-container">
      
      {/* 헤더 - Only show on screen, not in print */}
      <div className="sticky top-0 bg-gradient-to-r from-gray-800 to-gray-900 p-4 rounded-t-2xl z-10 print:hidden" id="report-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div>
              <h2 className="text-lg font-bold text-white">AI 종합 분석 보고서</h2>
              <p className="text-sm text-gray-300 mt-1">
                {data && data.client && `${data?.client.name}님의 상세 신용 및 정책자금 분석`}
              </p>
            </div>
          </div>

          {/* Action buttons - screen only */}
          <div className="flex gap-2 ml-4">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors font-medium flex items-center gap-2"
              title="프린트"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              인쇄
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors font-medium flex items-center gap-2"
              title="PDF 저장"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              PDF
            </button>
            <button
              onClick={() => setShowReportModal(false)}
              className="text-white hover:text-gray-300 text-3xl font-bold"
            >
              ×
            </button>
          </div>
        </div>
      </div>

      {/* Print Header - Shows on every printed page */}
      <div className="hidden print:block print-page-header" style={{position: 'relative', marginBottom: '20pt'}}>
        <div>
          <h1 style={{fontSize: '18pt', fontWeight: 'bold', margin: 0}}>EMFRONTIER AI 분석 보고서</h1>
          <p style={{fontSize: '10pt', color: '#666', marginTop: '4pt'}}>
            {data && data.client && `${data?.client.name}님 | 생성일: ${new Date().toLocaleDateString('ko-KR')}`}
          </p>
        </div>
        {/* QR Code in header - shows on every page */}
        {data && data.client && (
          <div style={{position: 'absolute', top: 0, right: 0}}>
            <canvas id={`qr-canvas-print-${data?.client.id}`} style={{width: '60pt', height: '60pt'}}></canvas>
          </div>
        )}
      </div>

      {/* 로딩 */}
      {loadingReport && (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-black mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">AI가 상세 분석 보고서를 생성하고 있습니다...</p>
          <p className="text-gray-500 text-sm mt-2">잠시만 기다려주세요 (약 5-10초 소요)</p>
        </div>
      )}

      {/* 보고서 내용 - A4 페이지 최적화 */}
      {!loadingReport && reportData && (
        <div className="p-6 print:p-0" id="report-content">
          
          {/* PAGE 1: 고객 정보 + 종합 평가 */}
          <div className="avoid-break mb-6">
            {/* 클라이언트 기본 정보 */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-gray-300 mb-6 avoid-break">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">👤</span>
                고객 기본 정보
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">이름</p>
                  <p className="text-sm font-bold text-gray-900">{reportData.clientInfo.name}</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">나이/성별</p>
                  <p className="text-sm font-bold text-gray-900">{reportData.clientInfo.age}세 / {reportData.clientInfo.gender}</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">업력</p>
                  <p className="text-sm font-bold text-gray-900">{reportData.clientInfo.businessYears}년</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">연매출</p>
                  <p className="text-sm font-bold text-blue-900">{(reportData.clientInfo.annualRevenue / 100000000).toFixed(1)}억원</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">총부채</p>
                  <p className="text-sm font-bold text-red-900">{(reportData.clientInfo.totalDebt / 100000000).toFixed(2)}억원</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">부채비율</p>
                  <p className="text-sm font-bold text-orange-900">{reportData.clientInfo.debtRatio}%</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">소호등급</p>
                  <p className="text-sm font-bold text-purple-900">{reportData.clientInfo.sohoGrade}</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">기술기업</p>
                  <p className="text-sm font-bold text-green-900">{reportData.clientInfo.hasTechnology ? '인증 ✓' : '미인증'}</p>
                </div>
              </div>
            </div>

            {/* 종합 평가 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border-2 border-indigo-200 avoid-break">
              <h3 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">⭐</span>
                종합 평가
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white rounded-lg p-4 shadow">
                  <p className="text-sm text-gray-600 mb-1">종합 점수</p>
                  <p className="text-3xl font-bold text-indigo-600">{reportData.overallAssessment.score}점</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow">
                  <p className="text-sm text-gray-600 mb-1">등급</p>
                  <p className="text-3xl font-bold text-purple-600">{reportData.overallAssessment.level}</p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 mb-3">
                <p className="text-sm font-semibold text-gray-800 mb-2">📋 기본 요약</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {reportData.overallAssessment.summary}
                </p>
              </div>
              {reportData.overallAssessment.detailedSummary && (
                <div className="bg-indigo-50 rounded-lg p-4">
                  <p className="text-sm font-semibold text-indigo-900 mb-2">📊 상세 분석</p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {reportData.overallAssessment.detailedSummary}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* PAGE BREAK */}
          <div className="page-break"></div>

          {/* PAGE 2: 신용 분석 */}
          <div className="avoid-break mb-6">
            <div className="bg-white rounded-xl p-6 border-2 border-blue-200 shadow-sm">
              <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">💳</span>
                신용 분석
              </h3>
              
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-blue-700 mb-1">KCB 점수</p>
                  <p className="text-2xl font-bold text-blue-900">{reportData.clientInfo.kcbScore || 'N/A'}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-purple-700 mb-1">NICE 점수</p>
                  <p className="text-2xl font-bold text-purple-900">{reportData.clientInfo.niceScore || 'N/A'}</p>
                </div>
                <div className="bg-indigo-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-indigo-700 mb-1">평균</p>
                  <p className="text-2xl font-bold text-indigo-900">{reportData.clientInfo.avgCreditScore}</p>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-3">
                <p className="text-sm font-semibold text-blue-900 mb-2">
                  신용등급: <span className="text-blue-600">{reportData.creditAnalysis.level}</span>
                </p>
                <p className="text-sm text-gray-700">{reportData.creditAnalysis.summary}</p>
              </div>

              {reportData.creditAnalysis.detailedAnalysis && (
                <div className="bg-gray-50 rounded-lg p-4 mb-3">
                  <p className="text-sm font-semibold text-gray-800 mb-2">🔍 상세 신용 분석</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{reportData.creditAnalysis.detailedAnalysis}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-green-800 mb-2">✅ 강점</p>
                  <ul className="text-xs text-gray-700 space-y-1">
                    {reportData.creditAnalysis.strengths.map((item: string, idx: number) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-orange-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-orange-800 mb-2">⚠️ 약점</p>
                  <ul className="text-xs text-gray-700 space-y-1">
                    {reportData.creditAnalysis.weaknesses.map((item: string, idx: number) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {reportData.creditAnalysis.improvements && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                  <p className="text-sm font-semibold text-blue-900 mb-2">💡 개선 방안</p>
                  <ul className="text-sm text-gray-700 space-y-1.5">
                    {reportData.creditAnalysis.improvements.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* PAGE BREAK */}
          <div className="page-break"></div>

          {/* PAGE 3: 부채 분석 + 사업 분석 */}
          {reportData.debtAnalysis && (
            <div className="avoid-break mb-6">
              <div className="bg-white rounded-xl p-6 border-2 border-red-200 shadow-sm mb-6">
                <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">💰</span>
                  부채 구조 분석
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-700 mb-1">정책자금</p>
                    <p className="text-lg font-bold text-blue-900">
                      {(reportData.debtAnalysis.debtBreakdown.policyFund / 100000000).toFixed(2)}억
                    </p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-3">
                    <p className="text-xs text-yellow-700 mb-1">신용대출</p>
                    <p className="text-lg font-bold text-yellow-900">
                      {(reportData.debtAnalysis.debtBreakdown.creditLoan / 100000000).toFixed(2)}억
                    </p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <p className="text-xs text-orange-700 mb-1">제2금융</p>
                    <p className="text-lg font-bold text-orange-900">
                      {(reportData.debtAnalysis.debtBreakdown.secondaryLoan / 100000000).toFixed(2)}억
                    </p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3">
                    <p className="text-xs text-red-700 mb-1">카드론</p>
                    <p className="text-lg font-bold text-red-900">
                      {(reportData.debtAnalysis.debtBreakdown.cardLoan / 100000000).toFixed(2)}억
                    </p>
                  </div>
                </div>

                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-sm font-semibold text-red-900 mb-2">📊 부채 관리 조언</p>
                  <ul className="text-sm text-gray-700 space-y-1.5">
                    {reportData.debtAnalysis.debtManagementAdvice.slice(0, 3).map((advice: string, idx: number) => (
                      <li key={idx}>{advice}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 사업 분석 */}
              {reportData.businessAnalysis && (
                <div className="bg-white rounded-xl p-6 border-2 border-green-200 shadow-sm avoid-break">
                  <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">📈</span>
                    사업 분석
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-green-700 mb-1">안정성 점수</p>
                      <p className="text-2xl font-bold text-green-900">{reportData.businessAnalysis.stabilityScore}점</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-blue-700 mb-1">성장 잠재력</p>
                      <p className="text-xs font-bold text-blue-900 mt-2">{reportData.businessAnalysis.growthPotential}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-xs text-purple-700 mb-1">업계 위치</p>
                      <p className="text-xs font-bold text-purple-900 mt-2">{reportData.businessAnalysis.industryComparison.substring(0, 50)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PAGE BREAK */}
          <div className="page-break"></div>

          {/* PAGE 4: 소호등급 분석 */}
          <div className="avoid-break mb-6">
            <div className="bg-white rounded-xl p-6 border-2 border-yellow-200 shadow-sm">
              <h3 className="text-xl font-bold text-yellow-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                소호등급 분석
              </h3>
              
              <div className="bg-gradient-to-r from-gray-600 to-gray-700 rounded-xl p-6 text-white text-center mb-4">
                <p className="text-sm font-semibold mb-2 opacity-90">현재 등급</p>
                <p className="text-5xl font-bold">{reportData.sohoAnalysis.grade}</p>
              </div>

              <p className="text-gray-700 mb-4 bg-yellow-50 rounded-lg p-3">
                {reportData.sohoAnalysis.description}
              </p>

              {reportData.sohoAnalysis.detailedAssessment && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 mb-4">
                  <p className="text-sm font-semibold text-yellow-900 mb-2">📋 상세 평가</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{reportData.sohoAnalysis.detailedAssessment}</p>
                </div>
              )}

              <div className="space-y-3">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm font-semibold text-blue-900 mb-2">📌 특성</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {reportData.sohoAnalysis.characteristics.map((item: string, idx: number) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-sm font-semibold text-green-900 mb-2">💡 권장사항</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {reportData.sohoAnalysis.recommendations.map((item: string, idx: number) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* PAGE BREAK */}
          <div className="page-break"></div>

          {/* PAGE 5: 정책자금 분석 */}
          <div className="avoid-break mb-6">
            <div className="bg-white rounded-xl p-6 border-2 border-green-200 shadow-sm">
              <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">💰</span>
                추천 정책자금 상세 분석
              </h3>

              <div className="mb-4 flex gap-3">
                <div className="flex-1 bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-green-700 mb-1">총 추천</p>
                  <p className="text-2xl font-bold text-green-900">{reportData.fundAnalysis.totalRecommendations}개</p>
                </div>
                <div className="flex-1 bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-blue-700 mb-1">신청 중</p>
                  <p className="text-2xl font-bold text-blue-900">{reportData.fundAnalysis.appliedFunds}개</p>
                </div>
              </div>

              {reportData.fundAnalysis.detailedRecommendations && (
                <div className="bg-green-50 rounded-lg p-4 mb-4">
                  <p className="text-sm font-semibold text-green-900 mb-2">🤖 AI 종합 추천 의견</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{reportData.fundAnalysis.detailedRecommendations}</p>
                </div>
              )}

              {reportData.fundAnalysis.recommendedFunds.length > 0 ? (
                <div className="space-y-4">
                  {reportData.fundAnalysis.recommendedFunds.slice(0, 2).map((fund: any, idx: number) => (
                    <div key={idx} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border-l-4 border-green-500 shadow avoid-break">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 text-lg mb-1">{fund.name}</h4>
                          <p className="text-sm text-gray-600">{fund.category}</p>
                        </div>
                        <div className="text-right">
                          <div className="bg-white rounded-lg px-3 py-1 shadow">
                            <p className="text-xs text-gray-600">적합도</p>
                            <p className="text-2xl font-bold text-green-600">{fund.suitabilityScore}점</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-white rounded-lg p-2">
                          <p className="text-xs text-gray-600">최대한도</p>
                          <p className="text-sm font-bold text-blue-900">{fund.maxAmount}</p>
                        </div>
                        <div className="bg-white rounded-lg p-2">
                          <p className="text-xs text-gray-600">금리</p>
                          <p className="text-sm font-bold text-purple-900">{fund.interestRate}</p>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-3 mb-2">
                        <p className="text-xs font-semibold text-green-800 mb-2">🤖 AI 추천 이유</p>
                        <ul className="text-xs text-gray-700 space-y-1">
                          {fund.recommendationReasons.slice(0, 3).map((reason: string, ridx: number) => (
                            <li key={ridx}>{reason}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-600">승인 가능성</span>
                        <span className={`text-sm font-bold ${
                          fund.approvalProbability.includes('높음') ? 'text-green-600' :
                          fund.approvalProbability.includes('보통') ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {fund.approvalProbability}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                  추천 가능한 정책자금이 없습니다. AI 진단을 먼저 실시해주세요.
                </div>
              )}
            </div>
          </div>

          {/* Continue with more funds on next page if needed */}
          {reportData.fundAnalysis.recommendedFunds.length > 2 && (
            <>
              <div className="page-break"></div>
              <div className="avoid-break mb-6">
                <div className="space-y-4">
                  {reportData.fundAnalysis.recommendedFunds.slice(2).map((fund: any, idx: number) => (
                    <div key={idx} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border-l-4 border-green-500 shadow avoid-break">
                      {/* Same fund card structure as above */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 text-lg mb-1">{fund.name}</h4>
                          <p className="text-sm text-gray-600">{fund.category}</p>
                        </div>
                        <div className="text-right">
                          <div className="bg-white rounded-lg px-3 py-1 shadow">
                            <p className="text-xs text-gray-600">적합도</p>
                            <p className="text-2xl font-bold text-green-600">{fund.suitabilityScore}점</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-white rounded-lg p-2">
                          <p className="text-xs text-gray-600">최대한도</p>
                          <p className="text-sm font-bold text-blue-900">{fund.maxAmount}</p>
                        </div>
                        <div className="bg-white rounded-lg p-2">
                          <p className="text-xs text-gray-600">금리</p>
                          <p className="text-sm font-bold text-purple-900">{fund.interestRate}</p>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-3 mb-2">
                        <p className="text-xs font-semibold text-green-800 mb-2">🤖 AI 추천 이유</p>
                        <ul className="text-xs text-gray-700 space-y-1">
                          {fund.recommendationReasons.slice(0, 3).map((reason: string, ridx: number) => (
                            <li key={ridx}>{reason}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-600">승인 가능성</span>
                        <span className={`text-sm font-bold ${
                          fund.approvalProbability.includes('높음') ? 'text-green-600' :
                          fund.approvalProbability.includes('보통') ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {fund.approvalProbability}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* PAGE BREAK */}
          <div className="page-break"></div>

          {/* PAGE 6: 리스크 평가 */}
          {reportData.riskAssessment && (
            <div className="avoid-break mb-6">
              <div className="bg-white rounded-xl p-6 border-2 border-orange-200 shadow-sm">
                <h3 className="text-xl font-bold text-orange-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">⚠️</span>
                  리스크 평가 및 완화 전략
                </h3>
                
                <div className="bg-orange-50 rounded-lg p-4 mb-4 text-center">
                  <p className="text-sm text-orange-700 mb-1">전체 리스크 수준</p>
                  <p className="text-2xl font-bold text-orange-900">{reportData.riskAssessment.overallRisk}</p>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-semibold text-orange-900 mb-2">🔍 리스크 요인</p>
                  <ul className="text-sm text-gray-700 space-y-1.5 bg-orange-50 rounded-lg p-3">
                    {reportData.riskAssessment.riskFactors.map((risk: string, idx: number) => (
                      <li key={idx}>{risk}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-sm font-semibold text-green-900 mb-2">💡 완화 전략</p>
                  <ul className="text-sm text-gray-700 space-y-1.5 bg-green-50 rounded-lg p-3">
                    {reportData.riskAssessment.mitigationStrategies.map((strategy: string, idx: number) => (
                      <li key={idx}>{strategy}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* PAGE BREAK */}
          <div className="page-break"></div>

          {/* FINAL PAGE: 다음 단계 & 타임라인 */}
          <div className="avoid-break mb-6">
            <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl p-6 border-2 border-purple-200">
              <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                실행 계획 및 다음 단계
              </h3>
              
              <div className="space-y-2 mb-4">
                <p className="text-sm font-semibold text-purple-800 mb-2">📋 즉시 실행 항목</p>
                {reportData.overallAssessment.nextSteps.map((step: string, idx: number) => (
                  <div key={idx} className="bg-white rounded-lg p-3 flex items-start gap-3 shadow-sm">
                    <span className="text-purple-600 font-bold">{idx + 1}.</span>
                    <p className="text-sm text-gray-700 flex-1">{step}</p>
                  </div>
                ))}
              </div>

              {reportData.overallAssessment.timelineRecommendations && (
                <div>
                  <p className="text-sm font-semibold text-purple-800 mb-2">📅 타임라인 계획</p>
                  <div className="space-y-2">
                    {reportData.overallAssessment.timelineRecommendations.map((timeline: string, idx: number) => (
                      <div key={idx} className="bg-white rounded-lg p-3 shadow-sm">
                        <p className="text-sm text-gray-700">{timeline}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 생성 정보 */}
            <div className="text-center text-xs text-gray-500 pt-4 border-t mt-6">
              <p className="font-semibold mb-1">📄 보고서 생성 정보</p>
              <p>생성 시간: {new Date(reportData.generatedAt).toLocaleString('ko-KR')}</p>
              <p className="mt-2 bg-yellow-50 inline-block px-4 py-2 rounded-lg">
                ⚠️ 본 보고서는 AI 기반 자동 분석 결과이며, 참고 자료로만 활용하시기 바랍니다.
              </p>
              <p className="mt-1">최종 의사결정 시에는 전문가 상담을 권장드립니다.</p>
            </div>
          </div>
        </div>
      )}

      {/* 닫기 버튼 - Screen only */}
      <div className="sticky bottom-0 bg-white p-4 border-t print:hidden">
        <button
          onClick={() => setShowReportModal(false)}
          className="w-full py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
        >
          닫기
        </button>
      </div>
    </div>
  </div>
)}

      {/* 📄 고객정보 보고서 */}
      {showClientInfoReport && data && (
        <ClientInfoReport
          client={data}
          onClose={() => setShowClientInfoReport(false)}
        />
      )}

      {/* 🔄 AI 재심사 결과 모달 */}
      {showReviewResultModal && reviewResultData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-5 max-w-2xl w-full max-h-[88vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-800 mb-3">
              💰 최대 대출 한도 조회
            </h3>
            
            {loadingReview ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
                <div className="text-lg text-gray-600">한도 계산 중...</div>
              </div>
            ) : (
              <div>
                {/* 기본 정보 */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-lg mb-3">기본 정보</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">고객명:</span>
                      <span className="ml-2 font-medium">{data?.client?.name || data?.name || 'test'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">SOHO 등급:</span>
                      <span className="ml-2 font-bold text-blue-600">{reviewResultData.sohoGrade}등급</span>
                    </div>
                    <div>
                      <span className="text-gray-600">신용점수(NICE):</span>
                      <span className="ml-2 font-medium">{data?.client?.nice_score || data?.nice_score || 0}점</span>
                    </div>
                    <div>
                      <span className="text-gray-600">연매출:</span>
                      <span className="ml-2 font-medium">{(data?.client?.annual_revenue || data?.annual_revenue || 0).toLocaleString()}원</span>
                    </div>
                    <div>
                      <span className="text-gray-600">총부채:</span>
                      <span className="ml-2 font-medium">{(data?.client?.total_debt || data?.client?.debt || data?.debt || 0).toLocaleString()}원</span>
                    </div>
                    <div>
                      <span className="text-gray-600">기술력:</span>
                      <span className="ml-2 font-medium">{(data?.client?.has_technology || data?.has_technology) ? '보유' : '미보유'}</span>
                    </div>
                  </div>
                </div>

                {/* 전체 최대 한도 */}
                <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-green-300">
                  <h4 className="font-bold text-xl mb-2 text-green-800">전체 최대 대출 가능 한도</h4>
                  <div className="text-3xl font-bold text-green-600">
                    {(reviewResultData.maxLoanLimit || 0).toLocaleString()}원
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    신용점수, 매출, 부채비율, 기술력을 종합 분석한 결과입니다.
                  </p>
                </div>

                {/* 정책자금별 세부 한도 */}
                <div className="mb-6">
                  <h4 className="font-semibold text-lg mb-3">
                    정책자금별 세부 한도
                    <span className="text-sm text-gray-500 ml-2">(신청할 자금을 선택하세요)</span>
                  </h4>
                  <div className="space-y-3">
                    {reviewResultData.recommendedFunds && reviewResultData.recommendedFunds.length > 0 ? (
                      reviewResultData.recommendedFunds.map((fund: any, index: number) => {
                        const fundName = fund.name || fund;
                        const isSelected = selectedFunds.includes(fundName);
                        
                        return (
                          <div 
                            key={index} 
                            onClick={() => {
                              setSelectedFunds(prev => 
                                prev.includes(fundName) 
                                  ? prev.filter(f => f !== fundName)
                                  : [...prev, fundName]
                              );
                            }}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              isSelected 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-start mb-2">
                              <div className="flex-shrink-0 mt-1 mr-3">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {}}
                                  className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                                />
                              </div>
                              <div className="flex-grow">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h5 className="font-semibold text-gray-800">{fundName}</h5>
                                    <p className="text-xs text-gray-500">{fund.category || '중진공'}</p>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-lg font-bold text-blue-600">
                                      최대 {(fund.max_amount || 80000000).toLocaleString()}원
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      금리 {fund.interest_rate || '2.5%'} | 60개월
                                    </div>
                                  </div>
                                </div>
                                {fund.requirements && (
                                  <p className="text-xs text-gray-600 mt-2">
                                    <span className="font-medium">대상:</span> {fund.requirements}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                        <p className="text-yellow-800">
                          현재 신청 가능한 정책자금이 없습니다. 신용점수 또는 자격 요건을 확인해주세요.
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* 선택된 자금 개수 표시 */}
                  {reviewResultData.recommendedFunds && reviewResultData.recommendedFunds.length > 0 && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">선택된 자금: {selectedFunds.length}개</span>
                        {selectedFunds.length > 0 && (
                          <span className="text-gray-500 ml-2">
                            ({selectedFunds.join(', ')})
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 버튼 영역 */}
            <div className="flex gap-3">
              {reviewResultData.recommendedFunds && reviewResultData.recommendedFunds.length > 0 && (
                <button
                  onClick={handleSubmitApplicationFromModal}
                  disabled={selectedFunds.length === 0}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                    selectedFunds.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {selectedFunds.length === 0 ? '자금을 선택해주세요' : `선택한 ${selectedFunds.length}개 자금 신청하기`}
                </button>
              )}
              <button
                onClick={() => {
                  setShowReviewResultModal(false);
                  setReviewResultData(null);
                  setSelectedFunds([]);
                }}
                className="flex-1 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}


      {/* 재무제표 AI 분석 입력 모달 */}
      {showFinancialAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[88vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-800 text-white p-4 rounded-t-lg z-10">
              <h3 className="text-lg font-bold">📈 재무제표 AI 분석</h3>
              <p className="text-gray-300 text-xs mt-0.5">3개년 재무제표 입력 → AI 정밀 분석</p>
            </div>

            <div className="p-4">
              {loadingFinancialAnalysis ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mb-4"></div>
                  <p className="text-lg text-gray-600">AI가 재무제표를 분석하고 있습니다...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {financialData.map((yearData, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                        <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-1">
                          📅 {yearData.year}년
                        </h4>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">매출액 (원)</label>
                            <input
                              type="number"
                              value={yearData.revenue || ''}
                              onChange={(e) => handleFinancialDataChange(index, 'revenue', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none text-sm"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">영업이익 (원)</label>
                            <input
                              type="number"
                              value={yearData.operatingProfit || ''}
                              onChange={(e) => handleFinancialDataChange(index, 'operatingProfit', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none text-sm"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">순이익 (원)</label>
                            <input
                              type="number"
                              value={yearData.netProfit || ''}
                              onChange={(e) => handleFinancialDataChange(index, 'netProfit', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none text-sm"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">총자산 (원)</label>
                            <input
                              type="number"
                              value={yearData.totalAssets || ''}
                              onChange={(e) => handleFinancialDataChange(index, 'totalAssets', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none text-sm"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">총부채 (원)</label>
                            <input
                              type="number"
                              value={yearData.totalLiabilities || ''}
                              onChange={(e) => handleFinancialDataChange(index, 'totalLiabilities', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none text-sm"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">자본금 (원)</label>
                            <input
                              type="number"
                              value={yearData.equity || ''}
                              onChange={(e) => handleFinancialDataChange(index, 'equity', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none text-sm"
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-800">
                      <strong>💡</strong> 정확한 수치 입력 시 더 정밀한 AI 진단을 받으실 수 있습니다.
                    </p>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleFinancialAnalysis}
                      className="flex-1 py-2.5 bg-black text-white rounded-lg font-semibold text-sm hover:bg-gray-700 transition-colors"
                    >
                      🤖 AI 분석 시작
                    </button>
                    <button
                      onClick={() => {
                        setShowFinancialAnalysis(false);
                        setFinancialData([
                          { year: '2023', revenue: 0, operatingProfit: 0, netProfit: 0, totalAssets: 0, totalLiabilities: 0, equity: 0 },
                          { year: '2022', revenue: 0, operatingProfit: 0, netProfit: 0, totalAssets: 0, totalLiabilities: 0, equity: 0 },
                          { year: '2021', revenue: 0, operatingProfit: 0, netProfit: 0, totalAssets: 0, totalLiabilities: 0, equity: 0 },
                        ]);
                      }}
                      className="px-5 py-2.5 bg-gray-500 text-white rounded-lg font-semibold text-sm hover:bg-gray-600 transition-colors"
                    >
                      취소
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 재무제표 AI 분석 결과 모달 */}
      {showFinancialResult && financialResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[88vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-800 text-white p-4 rounded-t-lg z-10">
              <h3 className="text-lg font-bold flex items-center gap-2">
                ✅ 재무제표 AI 분석 결과
              </h3>
              <p className="text-gray-300 text-xs mt-0.5">3개년 재무제표 기반 정밀 분석 완료</p>
            </div>

            <div className="p-4">
              {/* 핵심 지표 요약 */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-2 border-blue-200">
                  <p className="text-sm text-blue-600 font-medium mb-1">SOHO 등급</p>
                  <p className="text-3xl font-bold text-blue-800">{financialResult.sohoGrade}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border-2 border-green-200">
                  <p className="text-sm text-green-600 font-medium mb-1">최대 대출 한도</p>
                  <p className="text-2xl font-bold text-green-800">{financialResult.maxLoanLimit?.toLocaleString()}원</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border-2 border-purple-200">
                  <p className="text-sm text-purple-600 font-medium mb-1">재무건전성 점수</p>
                  <p className="text-3xl font-bold text-purple-800">{financialResult.financialHealthScore?.toFixed(1)}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border-2 border-orange-200">
                  <p className="text-sm text-orange-600 font-medium mb-1">성장률</p>
                  <p className="text-3xl font-bold text-orange-800">{(financialResult.growthRate * 100).toFixed(1)}%</p>
                </div>
              </div>

              {/* 재무 비율 상세 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    수익성 지표
                  </h4>
                  <p className="text-sm text-gray-700">수익성 비율: <span className="font-semibold">{(financialResult.profitabilityRatio * 100).toFixed(2)}%</span></p>
                </div>
                <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    안정성 지표
                  </h4>
                  <p className="text-sm text-gray-700">안정성 비율: <span className="font-semibold">{(financialResult.stabilityRatio * 100).toFixed(2)}%</span></p>
                </div>
              </div>

              {/* 추천 정책자금 */}
              {financialResult.recommendedFunds && financialResult.recommendedFunds.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-xl font-bold text-gray-800 mb-4">💼 추천 정책자금</h4>
                  <div className="space-y-3">
                    {financialResult.recommendedFunds.map((fundName: string, idx: number) => (
                      <div key={idx} className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50 hover:bg-blue-100 transition-colors">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-gray-800">{idx + 1}. {fundName}</p>
                            <p className="text-xs text-gray-600 mt-1">재무제표 기반 추천 자금</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-blue-600 font-medium">최대 1억원</p>
                            <p className="text-xs text-gray-500">금리 2.5% | 60개월</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 상세 분석 내용 */}
              {financialResult.details && (
                <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50 mb-6">
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    상세 분석 내용
                  </h4>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">{financialResult.details}</pre>
                </div>
              )}

              {/* 버튼 영역 */}
              <button
                onClick={() => {
                  setShowFinancialResult(false);
                  setFinancialResult(null);
                }}
                className="w-full py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}


            <footer className="text-center text-gray-500 text-sm py-6">
        Copyright © 2026 EMFRONTIER Operating Company, LLC. All Rights Reserved
      </footer>
    </div>

      {/* ===== AI 정책자금 평가 모달 ===== */}
      {showFundEval && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[88vh] overflow-y-auto">
            {/* 헤더 */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🏦</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">AI 정책자금 평가</h3>
                  <p className="text-xs text-gray-500">매출 · 기대출 · 업력 · 신용점수 조건별 분석</p>
                </div>
              </div>
              <button onClick={() => setShowFundEval(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {loadingFundEval ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-gray-600 font-medium">AI가 정책자금 조건을 분석 중...</p>
                  <p className="text-sm text-gray-400 mt-2">매출 · 기대출 · 업력 · 신용점수를 하나씩 검토합니다</p>
                </div>
              ) : fundEvalData ? (
                <>
                  {/* 요약 카드 */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border border-blue-200">
                      <p className="text-xs text-blue-600 font-semibold mb-1">SOHO 등급</p>
                      <p className="text-3xl font-black text-blue-700">{fundEvalData.sohoGrade}</p>
                      <p className="text-xs text-blue-500 mt-1">등급</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center border border-green-200">
                      <p className="text-xs text-green-600 font-semibold mb-1">최대 한도</p>
                      <p className="text-lg font-black text-green-700">{(fundEvalData.maxLoanLimit / 100000000).toFixed(1)}억</p>
                      <p className="text-xs text-green-500 mt-1">{fundEvalData.maxLoanLimit?.toLocaleString()}원</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center border border-purple-200">
                      <p className="text-xs text-purple-600 font-semibold mb-1">조건 충족</p>
                      <p className="text-3xl font-black text-purple-700">{fundEvalData.funds?.filter((f: any) => f.eligible).length}</p>
                      <p className="text-xs text-purple-500 mt-1">/ {fundEvalData.funds?.length}개 자금</p>
                    </div>
                  </div>

                  {/* 필터 탭 */}
                  <div className="flex gap-2 mb-4">
                    {(['all', 'eligible', 'ineligible'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFundEvalFilter(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                          fundEvalFilter === f ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {f === 'all' ? `전체 (${fundEvalData.funds?.length})` :
                         f === 'eligible' ? `✅ 충족 (${fundEvalData.funds?.filter((x: any) => x.eligible).length})` :
                         `❌ 미충족 (${fundEvalData.funds?.filter((x: any) => !x.eligible).length})`}
                      </button>
                    ))}
                  </div>

                  {/* 자금별 카드 - 노션 스타일 */}
                  <div className="space-y-3">
                    {fundEvalData.funds
                      ?.filter((fund: any) =>
                        fundEvalFilter === 'all' ? true :
                        fundEvalFilter === 'eligible' ? fund.eligible :
                        !fund.eligible
                      )
                      .map((fund: any, idx: number) => (
                        <div key={idx} className={`border-2 rounded-xl overflow-hidden ${fund.eligible ? 'border-green-300 shadow-sm' : 'border-gray-200'}`}>
                          {/* 자금 헤더 */}
                          <div className={`flex items-center justify-between px-4 py-3 ${fund.eligible ? 'bg-green-50' : 'bg-gray-50'}`}>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">
                                {fund.category?.includes('중진공') ? '🏢' :
                                 fund.category?.includes('소진공') ? '🏪' :
                                 fund.category?.includes('신용보증') ? '🛡️' :
                                 fund.category?.includes('기술보증') ? '🔬' : '💼'}
                              </span>
                              <div>
                                <p className="font-bold text-gray-900 text-sm">{fund.name}</p>
                                <span className="text-xs text-gray-500 bg-white px-1.5 py-0.5 rounded border border-gray-200">{fund.category}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-right">
                              <div>
                                <p className="text-xs text-gray-500">최대 한도</p>
                                <p className={`font-bold text-sm ${fund.eligible ? 'text-green-700' : 'text-gray-500'}`}>
                                  {fund.max_amount >= 100000000
                                    ? (fund.max_amount / 100000000).toFixed(1) + '억'
                                    : (fund.max_amount / 10000000).toFixed(0) + '천만'}원
                                </p>
                              </div>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                fund.eligible ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                              }`}>
                                {fund.passCount}/{fund.totalCount}
                              </div>
                            </div>
                          </div>

                          {/* 조건 체크 목록 - 노션 테이블 스타일 */}
                          <div className="px-4 py-3 bg-white">
                            <div className="divide-y divide-gray-100">
                              {fund.conditions?.map((cond: any, ci: number) => (
                                <div key={ci} className="flex items-center justify-between py-2.5">
                                  <div className="flex items-center gap-2 flex-1">
                                    <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                      cond.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
                                    }`}>
                                      {cond.passed ? '✓' : '✗'}
                                    </span>
                                    <span className="text-sm text-gray-700 font-medium">{cond.label}</span>
                                  </div>
                                  <div className="flex items-center gap-6 text-right">
                                    <div>
                                      <p className="text-xs text-gray-400">기준</p>
                                      <p className="text-xs font-semibold text-gray-600">{cond.required}</p>
                                    </div>
                                    <div className="w-20">
                                      <p className="text-xs text-gray-400">내 실제값</p>
                                      <p className={`text-xs font-bold ${cond.passed ? 'text-green-600' : 'text-red-500'}`}>{cond.actual}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            {fund.eligible && (
                              <div className="mt-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                                <p className="text-xs text-green-700 font-semibold">✅ 모든 조건 충족 — 신청 가능</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </>
              ) : (
                <p className="text-center text-gray-400 py-8">데이터를 불러오지 못했습니다.</p>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl">
              <div className="flex gap-3">
                <button
                  onClick={handleOpenFundEval}
                  disabled={loadingFundEval}
                  className={`flex-1 py-3 rounded-xl font-bold transition-colors ${loadingFundEval ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  {loadingFundEval ? '⏳ 분석 중...' : '🔄 재분석'}
                </button>
                <button
                  onClick={() => setShowFundEval(false)}
                  className="flex-1 py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-900 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== AI 기업집중분석 모달 ===== */}
      {showCompanyAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[88vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-xl">📊</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">AI 기업집중분석</h3>
                  <p className="text-xs text-gray-500">매출 · 기대출 · 직원수 · 업력 종합 분석</p>
                </div>
              </div>
              <button onClick={() => setShowCompanyAnalysis(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {loadingCompanyAnalysis ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-gray-600 font-medium">기업 데이터를 종합 분석 중...</p>
                  <p className="text-sm text-gray-400 mt-2">매출 · 기대출 · 직원수 · 업력을 평가합니다</p>
                </div>
              ) : companyAnalysisData?.analysis ? (
                (() => {
                  const a = companyAnalysisData.analysis;
                  const gradeColor = (g: string) => {
                    if (g === 'S') return 'text-purple-700 bg-purple-100 border-purple-200';
                    if (g === 'A') return 'text-green-700 bg-green-100 border-green-200';
                    if (g === 'B') return 'text-blue-700 bg-blue-100 border-blue-200';
                    if (g === 'C') return 'text-yellow-700 bg-yellow-100 border-yellow-200';
                    return 'text-red-700 bg-red-100 border-red-200';
                  };
                  return (
                    <>
                      {/* 종합 등급 배너 */}
                      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white text-center mb-6 shadow-lg">
                        <p className="text-sm font-medium opacity-80 mb-1">종합 기업 등급</p>
                        <p className="text-6xl font-black mb-2">{a.overallGrade}</p>
                        <p className="text-2xl font-bold opacity-90">{a.overallScore}점 / 100점</p>
                        <p className="text-sm opacity-75 mt-3 leading-relaxed">{a.summary}</p>
                      </div>

                      {/* 4개 항목별 분석 */}
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        {[
                          { label: '💰 매출 분석', data: a.revenueLevel },
                          { label: '📉 부채 분석', data: a.debtLevel },
                          { label: '👥 직원수 분석', data: a.employeeLevel },
                          { label: '📅 업력 분석', data: a.businessAgeLevel },
                        ].map(({ label, data }) => (
                          <div key={label} className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-bold text-gray-700">{label}</span>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${gradeColor(data.grade)}`}>
                                {data.grade}등급
                              </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
                              <div
                                className="h-2.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                                style={{ width: `${data.score}%` }}
                              />
                            </div>
                            <div className="flex justify-between items-center">
                              <p className="text-xs text-gray-500 flex-1">{data.comment}</p>
                              <span className="text-xs font-bold text-gray-700 ml-2">{data.score}점</span>
                            </div>
                            {data.ratio !== undefined && data.ratio > 0 && (
                              <p className="text-xs text-orange-500 mt-1 font-medium">부채비율: {data.ratio.toFixed(0)}%</p>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* 강점 */}
                      {a.strengths?.length > 0 && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                          <p className="text-sm font-bold text-green-800 mb-2 flex items-center gap-1">✅ 강점</p>
                          <ul className="space-y-1.5">
                            {a.strengths.map((s: string, i: number) => (
                              <li key={i} className="text-sm text-green-700 flex items-start gap-2">
                                <span className="text-green-500 mt-0.5 flex-shrink-0 font-bold">•</span>{s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* 약점 */}
                      {a.weaknesses?.length > 0 && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                          <p className="text-sm font-bold text-red-800 mb-2 flex items-center gap-1">⚠️ 개선 필요</p>
                          <ul className="space-y-1.5">
                            {a.weaknesses.map((w: string, i: number) => (
                              <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                                <span className="text-red-500 mt-0.5 flex-shrink-0 font-bold">•</span>{w}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* 제안 */}
                      {a.suggestions?.length > 0 && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                          <p className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-1">💡 전략 제안</p>
                          <ul className="space-y-1.5">
                            {a.suggestions.map((s: string, i: number) => (
                              <li key={i} className="text-sm text-blue-700 flex items-start gap-2">
                                <span className="text-blue-600 mt-0.5 flex-shrink-0 font-bold">{i + 1}.</span>{s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  );
                })()
              ) : (
                <p className="text-center text-gray-400 py-8">데이터를 불러오지 못했습니다.</p>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl">
              <div className="flex gap-3">
                <button
                  onClick={handleOpenCompanyAnalysis}
                  disabled={loadingCompanyAnalysis}
                  className={`flex-1 py-3 rounded-xl font-bold transition-colors ${loadingCompanyAnalysis ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
                >
                  {loadingCompanyAnalysis ? '⏳ 분석 중...' : '🔄 재분석'}
                </button>
                <button
                  onClick={() => setShowCompanyAnalysis(false)}
                  className="flex-1 py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-900 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== 계정 삭제 모달 ===== */}
      {showDeleteAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-red-600 px-6 py-5 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-xl">🗑️</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">계정 삭제</h3>
                  <p className="text-red-100 text-sm">삭제 후 복구할 수 없습니다</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-5">
                <p className="text-sm text-red-800 font-semibold mb-2">⚠️ 주의사항</p>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• 모든 신청 내역이 영구 삭제됩니다</li>
                  <li>• AI 진단 결과가 삭제됩니다</li>
                  <li>• 이 작업은 되돌릴 수 없습니다</li>
                </ul>
              </div>
              <p className="text-sm text-gray-700 mb-3">
                계정을 삭제하려면 아래에 <strong className="text-red-600">탈퇴합니다</strong>를 입력하세요:
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="탈퇴합니다"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowDeleteAccount(false); setDeleteConfirmText(''); }}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deletingAccount || deleteConfirmText !== '탈퇴합니다'}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                    deleteConfirmText === '탈퇴합니다' && !deletingAccount
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {deletingAccount ? '삭제 중...' : '계정 삭제'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
