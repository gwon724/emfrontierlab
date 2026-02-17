'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ClientDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [qrCode, setQrCode] = useState('');
  const [showQR, setShowQR] = useState(false);
  
  // AI 진단 관련 state
  const [showDiagnosis, setShowDiagnosis] = useState(false);
  const [diagnosisStep, setDiagnosisStep] = useState<'start' | 'select' | 'complete'>('start');
  const [availableFunds, setAvailableFunds] = useState<any[]>([]);
  const [selectedFunds, setSelectedFunds] = useState<string[]>([]);
  const [fundDetails, setFundDetails] = useState<{[key: string]: any}>({});

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

  // AI 진단 시작
  const handleStartDiagnosis = async () => {
    console.log('🔵 AI 진단 시작 버튼 클릭됨');
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
        
        // recommended_funds가 이미 객체 배열로 들어옴 (name, category, max_amount, interest_rate, requirements)
        setAvailableFunds(result.recommended_funds || []);
        
        // fundDetails는 recommended_funds를 그대로 사용
        const detailsMap: {[key: string]: any} = {};
        if (result.recommended_funds && Array.isArray(result.recommended_funds)) {
          result.recommended_funds.forEach((fund: any) => {
            detailsMap[fund.name] = {
              category: fund.category,
              max_amount: fund.max_amount,
              interest_rate: fund.interest_rate,
              requirements: fund.requirements,
              description: `최대 ${(fund.max_amount / 100000000).toFixed(1)}억원까지 지원 가능합니다.`
            };
          });
        }
        setFundDetails(detailsMap);
        
        setDiagnosisStep('select');
        setShowDiagnosis(true);
        console.log('🔵 모달 표시됨, 추천 자금:', result.recommended_funds);
      } else {
        const errorData = await res.json();
        console.error('🔴 AI 진단 API 오류:', errorData);
        alert(`AI 진단에 실패했습니다: ${errorData.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('🔴 Error starting diagnosis:', error);
      alert('AI 진단 중 오류가 발생했습니다.');
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

  // 재심사 요청
  const handleRequestReview = async () => {
    if (!confirm('재심사를 요청하시겠습니까? 상태가 "접수대기"로 변경됩니다.')) {
      return;
    }

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
        alert(result.message);
        fetchData(); // 데이터 새로고침
      } else {
        alert(result.error || '재심사 요청에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error requesting review:', error);
      alert('재심사 요청 중 오류가 발생했습니다.');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-blue-600 text-white py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">EMFRONTIER LAB</h1>
            <p className="text-sm text-blue-100">{data.client?.name}님 환영합니다</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleGenerateQR}
              className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
            >
              내 QR 코드
            </button>
            {data.application && (
              <button
                onClick={handleRequestReview}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-md"
              >
                🔄 재심사 요청
              </button>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* AI 진단 시작 버튼 - 신청 전일 때만 표시 */}
        {!data.application && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-8 mb-6 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">🤖 AI 정책자금 진단</h2>
            <p className="text-lg mb-6">
              AI가 회원님의 정보를 분석하여 최적의 정책자금을 추천해드립니다
            </p>
            <button
              onClick={handleStartDiagnosis}
              className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg"
            >
              AI 진단 시작하기
            </button>
          </div>
        )}

        {/* 진행 상황 카드 - 신청 후에만 표시 */}
        {data.application && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 신청 진행 상황</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {['접수대기', '접수완료', '진행중', '진행완료', '집행완료', '보완', '반려'].map((status) => (
                <div
                  key={status}
                  className={`border-2 rounded-lg p-4 text-center transition-all ${
                    data.application?.status === status 
                      ? getStatusColor(status) + ' shadow-md scale-105' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="text-sm font-medium">{status}</div>
                  <div className="text-2xl font-bold mt-2">
                    {data.application?.status === status ? '✓' : ''}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900">
                현재 상태: <span className="font-bold text-lg">{data.application.status}</span>
              </p>
              {data.application.notes && (
                <p className="text-sm text-blue-800 mt-2">
                  📝 메모: {data.application.notes}
                </p>
              )}
              {data.application.policy_funds && data.application.policy_funds.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-blue-900">
                      💼 진행 중인 정책자금
                    </p>
                    <span className="px-3 py-1 bg-blue-600 text-white rounded-full font-bold text-sm">
                      {data.application.policy_funds.length}개
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {data.application.policy_funds.map((fund: string, idx: number) => {
                      const amount = data.application.fund_amounts?.[fund] || 0;
                      return (
                        <div key={idx} className="bg-white px-4 py-3 rounded-lg border-2 border-blue-300 shadow-md hover:shadow-lg transition-shadow">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-blue-900">• {fund}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded font-semibold">진행중</span>
                              <button
                                onClick={() => handleDeleteFund(fund)}
                                className="p-1 hover:bg-red-100 rounded-lg transition-colors group"
                                title="이 정책자금 삭제"
                              >
                                <svg className="w-5 h-5 text-gray-400 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          {amount > 0 && (
                            <div className="flex items-center justify-between pt-2 border-t border-blue-100">
                              <span className="text-xs text-gray-600">신청금액</span>
                              <span className="text-lg font-bold text-green-600">
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
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                재심사 요청하기
              </button>
              <p className="text-xs text-gray-500 text-center mt-2">
                {data.application.status === '반려' || data.application.status === '보완' 
                  ? '재심사를 요청하면 상태가 "접수대기"로 변경되어 다시 검토됩니다.' 
                  : '현재 진행 중인 심사를 재검토 요청합니다.'}
              </p>
            </div>
          </div>
        )}

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
          </div>

          {/* 신용 등급 및 점수 (한 줄로 표시) */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-600 mb-3 block">신용 등급 및 점수</label>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">SOHO 등급</span>
                <span className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-bold text-lg shadow-md">
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
              <label className="text-sm font-medium text-gray-600">기술력 보유</label>
              <p className="text-lg font-semibold text-gray-800">
                {data.client?.has_technology ? '✅ 예' : '❌ 아니오'}
              </p>
            </div>
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
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
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
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
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
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              내 QR 코드
            </h3>
            <p className="text-sm text-gray-600 mb-4 text-center">
              관리자가 스캔하여 내 정보를 확인할 수 있습니다
            </p>
            <div className="flex justify-center mb-6">
              {qrCode && <img src={qrCode} alt="QR Code" className="w-64 h-64" />}
            </div>
            <button
              onClick={() => setShowQR(false)}
              className="w-full py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      <footer className="text-center text-gray-500 text-sm py-6">
        Copyright © 2026 EMFRONTIER Operating Company, LLC. All Rights Reserved
      </footer>
    </div>
  );
}
