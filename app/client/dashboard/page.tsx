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

  useEffect(() => {
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

    fetchData();
  }, [router]);

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
        {/* 진행 상황 카드 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">진행 상황</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {['접수대기', '접수완료', '진행중', '진행완료', '집행완료', '보완', '반려'].map((status) => (
              <div
                key={status}
                className={`border-2 rounded-lg p-4 text-center ${
                  data.application?.status === status ? getStatusColor(status) : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="text-sm font-medium">{status}</div>
                <div className="text-2xl font-bold mt-2">
                  {data.application?.status === status ? '1' : '0'}
                </div>
              </div>
            ))}
          </div>

          {data.application?.status && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900">
                현재 상태: <span className="font-bold">{data.application.status}</span>
              </p>
              {data.application.notes && (
                <p className="text-sm text-blue-800 mt-2">
                  메모: {data.application.notes}
                </p>
              )}
            </div>
          )}
        </div>

        {/* 정책자금 추천 */}
        {data.diagnosis && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">AI 진단 결과</h2>
            
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-lg font-bold text-green-900">
                SOHO 등급: {data.diagnosis.soho_grade}등급
              </p>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">추천 정책자금</h3>
            <div className="space-y-2">
              {data.diagnosis.recommended_funds.map((fund: string, index: number) => (
                <div
                  key={index}
                  className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  <span className="font-medium text-gray-800">{fund}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 클라이언트 정보 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">내 정보</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">이름</label>
              <p className="text-lg font-semibold text-gray-800">{data.client?.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">이메일</label>
              <p className="text-lg font-semibold text-gray-800">{data.client?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">NICE 점수</label>
              <p className="text-lg font-semibold text-gray-800">{data.client?.nice_score}점</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">기술력 보유</label>
              <p className="text-lg font-semibold text-gray-800">
                {data.client?.has_technology ? '예' : '아니오'}
              </p>
            </div>
          </div>
        </div>
      </div>

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
