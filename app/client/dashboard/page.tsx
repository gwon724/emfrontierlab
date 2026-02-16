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
  const [availableFunds, setAvailableFunds] = useState<string[]>([]);
  const [selectedFunds, setSelectedFunds] = useState<string[]>([]);

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
        setAvailableFunds(result.recommended_funds);
        setDiagnosisStep('select');
        setShowDiagnosis(true);
        console.log('🔵 모달 표시됨');
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
  const toggleFund = (fund: string) => {
    setSelectedFunds(prev => 
      prev.includes(fund) 
        ? prev.filter(f => f !== fund)
        : [...prev, fund]
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {data.application.policy_funds.map((fund: string, idx: number) => (
                      <div key={idx} className="text-sm text-blue-900 bg-white px-3 py-2 rounded-lg border border-blue-300 flex items-center justify-between shadow-sm">
                        <span className="font-medium">• {fund}</span>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded font-semibold">진행중</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

      {/* AI 진단 모달 */}
      {showDiagnosis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-3xl font-bold text-gray-800 mb-4 text-center">
              🤖 AI 진단 결과
            </h3>
            
            {diagnosisStep === 'select' && (
              <>
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-lg font-bold text-green-900 text-center">
                    SOHO 등급: {data.client?.soho_grade || 'C'}등급
                  </p>
                  <p className="text-sm text-gray-600 text-center mt-2">
                    회원님의 정보를 분석하여 추천 정책자금을 선정했습니다
                  </p>
                </div>

                <h4 className="text-xl font-bold text-gray-800 mb-4">
                  📋 추천 정책자금 ({availableFunds.length}개)
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  원하시는 정책자금을 선택해주세요 (복수 선택 가능)
                </p>

                <div className="space-y-3 mb-6">
                  {availableFunds.map((fund, index) => (
                    <div
                      key={index}
                      onClick={() => toggleFund(fund)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedFunds.includes(fund)
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-300 bg-white hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-800">{fund}</span>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedFunds.includes(fund)
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedFunds.includes(fund) && (
                            <span className="text-white text-sm">✓</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDiagnosis(false)}
                    className="flex-1 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSubmitApplication}
                    disabled={selectedFunds.length === 0}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    신청하기 ({selectedFunds.length}개 선택)
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
