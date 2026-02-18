'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function EditFinancialPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.clientId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [client, setClient] = useState<any>(null);
  const [formData, setFormData] = useState({
    annual_revenue: 0,
    business_years: 0,
    debt_policy_fund: 0,
    debt_credit_loan: 0,
    debt_secondary_loan: 0,
    debt_card_loan: 0
  });

  // 클라이언트 정보 조회
  useEffect(() => {
    fetchClientData();
  }, [clientId]);

  const fetchClientData = async () => {
    try {
      const res = await fetch(`/api/client/get-financial/${clientId}`);
      if (res.ok) {
        const data = await res.json();
        setClient(data.client);
        setFormData({
          annual_revenue: data.client.annual_revenue || 0,
          business_years: data.client.business_years || 0,
          debt_policy_fund: data.client.debt_policy_fund || 0,
          debt_credit_loan: data.client.debt_credit_loan || 0,
          debt_secondary_loan: data.client.debt_secondary_loan || 0,
          debt_card_loan: data.client.debt_card_loan || 0
        });
      } else {
        alert('고객 정보를 불러올 수 없습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.annual_revenue <= 0) {
      alert('연매출을 입력해주세요.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/client/update-financial/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        alert('재무 정보가 성공적으로 업데이트되었습니다!');
        router.push('/client/dashboard');
      } else {
        const data = await res.json();
        alert(data.error || '업데이트에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const totalDebt = formData.debt_policy_fund + formData.debt_credit_loan + 
                    formData.debt_secondary_loan + formData.debt_card_loan;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">정보를 찾을 수 없습니다</h2>
          <p className="text-gray-600">유효하지 않은 링크입니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-t-2xl shadow-xl p-8 border-b-4 border-blue-600">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">재무정보 수정</h1>
              <p className="text-gray-600 mt-1">정확한 정보를 입력해주세요</p>
            </div>
          </div>

          {/* 고객 정보 */}
          <div className="bg-blue-50 rounded-lg p-4 flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-lg">{client.name?.[0]}</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">{client.name}</p>
              <p className="text-sm text-gray-600">{client.email}</p>
            </div>
          </div>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="bg-white rounded-b-2xl shadow-xl p-8">
          <div className="space-y-6">
            {/* 연매출 & 업력 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  연매출 (원) *
                </label>
                <input
                  type="number"
                  value={formData.annual_revenue}
                  onChange={(e) => setFormData({...formData, annual_revenue: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="예: 100000000"
                  required
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">1억 = 100,000,000</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  업력 (년) *
                </label>
                <input
                  type="number"
                  value={formData.business_years}
                  onChange={(e) => setFormData({...formData, business_years: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="사업 연수"
                  required
                  min="0"
                  max="50"
                />
                <p className="text-xs text-gray-500 mt-1">사업 시작 후 경과 년수</p>
              </div>
            </div>

            {/* 총 부채 표시 */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-lg p-4">
              <label className="block text-sm font-semibold text-red-900 mb-2">
                총 부채 (자동 합산)
              </label>
              <p className="text-3xl font-bold text-red-600">{totalDebt.toLocaleString()}원</p>
              <p className="text-xs text-red-700 mt-2">
                💡 아래 4개 항목의 합산값입니다
              </p>
            </div>

            {/* 부채 항목들 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  정책자금 대출 (원)
                </label>
                <input
                  type="number"
                  value={formData.debt_policy_fund}
                  onChange={(e) => setFormData({...formData, debt_policy_fund: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  신용 대출 (원)
                </label>
                <input
                  type="number"
                  value={formData.debt_credit_loan}
                  onChange={(e) => setFormData({...formData, debt_credit_loan: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  2금융권 대출 (원)
                </label>
                <input
                  type="number"
                  value={formData.debt_secondary_loan}
                  onChange={(e) => setFormData({...formData, debt_secondary_loan: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  카드론 (원)
                </label>
                <input
                  type="number"
                  value={formData.debt_card_loan}
                  onChange={(e) => setFormData({...formData, debt_card_loan: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            {/* 안내 메시지 */}
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-yellow-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="font-semibold text-yellow-900">정확한 정보를 입력해주세요</p>
                  <p className="text-sm text-yellow-800 mt-1">
                    입력하신 정보는 대출 한도 산정에 사용됩니다. 정확한 정보를 입력해야 적절한 한도를 받으실 수 있습니다.
                  </p>
                </div>
              </div>
            </div>

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-bold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  저장 중...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  재무정보 업데이트
                </>
              )}
            </button>
          </div>
        </form>

        {/* 푸터 */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>© 2026 EMFRONTIER Operating Company, LLC. All Rights Reserved</p>
        </div>
      </div>
    </div>
  );
}
