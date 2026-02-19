'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ClientRegister() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    birth_date: '',
    age: '',
    gender: '남성',
    industry: '',
    is_manufacturing: false,
    business_years: '',
    annual_revenue: '',
    debt: '',
    debt_policy_fund: '',
    debt_credit_loan: '',
    debt_secondary_loan: '',
    debt_card_loan: '',
    kcb_score: '',
    nice_score: '',
    has_technology: false,
    agree_credit_check: false,
    agree_privacy: false,
    agree_confidentiality: false,
  });

  // 생년월일 → 만 나이 자동 계산
  useEffect(() => {
    if (formData.birth_date) {
      const today = new Date();
      const birth = new Date(formData.birth_date);
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      setFormData(prev => ({ ...prev, age: String(age) }));
    }
  }, [formData.birth_date]);

  // 부채 자동 합산
  useEffect(() => {
    const totalDebt = (parseInt(formData.debt_policy_fund || '0') || 0) +
                      (parseInt(formData.debt_credit_loan || '0') || 0) +
                      (parseInt(formData.debt_secondary_loan || '0') || 0) +
                      (parseInt(formData.debt_card_loan || '0') || 0);
    
    if (totalDebt.toString() !== formData.debt) {
      setFormData(prev => ({ ...prev, debt: totalDebt.toString() }));
    }
  }, [formData.debt_policy_fund, formData.debt_credit_loan, formData.debt_secondary_loan, formData.debt_card_loan]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 전화번호 유효성 검사
    const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
    if (!formData.phone || !phoneRegex.test(formData.phone.replace(/-/g, ''))) {
      setError('올바른 전화번호 형식으로 입력해주세요. (예: 010-1234-5678)');
      return;
    }

    // 비밀번호 유효성 검사 (영어, 숫자, 특수문자 포함 8-20자)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('비밀번호는 영문, 숫자, 특수문자를 포함하여 8-20자로 입력해주세요.');
      return;
    }

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 필수 동의 항목 확인
    if (!formData.agree_credit_check || !formData.agree_privacy || !formData.agree_confidentiality) {
      setError('필수 동의 항목을 모두 체크해주세요.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/client/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`회원가입이 완료되었습니다!\nSOHO 등급: ${data.sohoGrade}`);
        localStorage.setItem('clientToken', data.token);
        router.push('/client/dashboard');
      } else {
        setError(data.error || '회원가입에 실패했습니다.');
      }
    } catch (err) {
      setError('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">EMFRONTIER LAB</h1>
          <p className="text-lg text-gray-600 font-semibold">클라이언트 회원가입</p>
          <p className="text-sm text-gray-500 mt-1">정책자금 신청을 위한 정보를 입력해주세요</p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 로그인 정보 */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">로그인 정보</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이메일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="example@email.com"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      비밀번호 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="비밀번호"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      영문, 숫자, 특수문자 포함 8-20자
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      비밀번호 확인 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="비밀번호 확인"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 기본 정보 */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">기본 정보</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="홍길동"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    전화번호 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="010-1234-5678"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    하이픈(-)을 포함하여 입력해주세요
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      생년월일 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="birth_date"
                      value={formData.birth_date}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      만 나이가 자동 계산됩니다
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      만 나이 (자동 계산)
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-blue-50 text-blue-800 font-semibold outline-none"
                      placeholder="생년월일 입력 시 자동 계산"
                      min="18"
                      max="100"
                      readOnly={!!formData.birth_date}
                    />
                    {formData.age && parseInt(formData.age) < 39 && (
                      <p className="text-xs text-blue-600 mt-1 font-medium">
                        🎉 만 39세 미만 — 중진공 청년창업자금 대상입니다!
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      성별 <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    >
                      <option value="남성">남성</option>
                      <option value="여성">여성</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      업력 (사업 연수) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="business_years"
                      value={formData.business_years}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="3"
                      min="0"
                      max="50"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      사업을 시작한 후 경과한 연수를 입력하세요
                    </p>
                  </div>
                </div>

                {/* 업종 정보 */}
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    업종 정보 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-start space-x-3 p-4 bg-orange-50 border border-orange-200 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors"
                    onClick={() => setFormData(prev => ({ ...prev, is_manufacturing: !prev.is_manufacturing }))}>
                    <input
                      type="checkbox"
                      name="is_manufacturing"
                      checked={formData.is_manufacturing}
                      onChange={handleChange}
                      className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500 mt-0.5 flex-shrink-0"
                      onClick={e => e.stopPropagation()}
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-800">
                        🏭 제조업 해당
                      </span>
                      <p className="text-xs text-gray-600 mt-1">
                        제조업·제조 관련 서비스업에 해당하는 경우 체크해주세요.
                        만 39세 미만 + 제조업 조건 충족 시 <strong className="text-orange-700">최대 2억 원, 금리 2.5%</strong> 혜택이 적용됩니다.
                      </p>
                    </div>
                  </div>

                  {/* 업종명 직접 입력 */}
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      업종명
                    </label>
                    <input
                      type="text"
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="예: 제조업, IT서비스, 음식점, 도·소매업 등"
                    />
                  </div>

                  {/* 청년/제조업 혜택 안내 배너 */}
                  {formData.age && parseInt(formData.age) < 39 && formData.is_manufacturing && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-300 rounded-lg">
                      <p className="text-sm font-semibold text-green-800">
                        ✅ 만 39세 미만 + 제조업 조건 충족 — 중진공 청년창업자금 <strong>최대 2억 원, 금리 2.5%</strong> 적용됩니다!
                      </p>
                    </div>
                  )}
                  {formData.age && parseInt(formData.age) < 39 && !formData.is_manufacturing && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-300 rounded-lg">
                      <p className="text-sm font-semibold text-blue-800">
                        ✅ 만 39세 미만 — 중진공 청년창업자금 <strong>최대 1억 원, 금리 2.5%</strong> 적용됩니다.
                        제조업 체크 시 <strong>최대 2억 원</strong>까지 확대됩니다!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 재무 정보 */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">재무 정보</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    연매출액 (원) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="annual_revenue"
                    value={formData.annual_revenue}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="100000000"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    기대출 내역 (원) <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-4">
                    ※ 각 항목을 모두 입력해주세요. 없으면 0을 입력하세요.
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        1. 정책자금 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="debt_policy_fund"
                        value={formData.debt_policy_fund}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="0"
                        min="0"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        2. 신용대출 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="debt_credit_loan"
                        value={formData.debt_credit_loan}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="0"
                        min="0"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        3. 2금융권 대출 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="debt_secondary_loan"
                        value={formData.debt_secondary_loan}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="0"
                        min="0"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        4. 카드론 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="debt_card_loan"
                        value={formData.debt_card_loan}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="0"
                        min="0"
                        required
                      />
                    </div>

                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-medium text-blue-800">
                        총 기대출: {(
                          parseInt(formData.debt_policy_fund || '0') +
                          parseInt(formData.debt_credit_loan || '0') +
                          parseInt(formData.debt_secondary_loan || '0') +
                          parseInt(formData.debt_card_loan || '0')
                        ).toLocaleString()}원
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 신용 정보 */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">신용 정보</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      KCB 점수
                    </label>
                    <input
                      type="number"
                      name="kcb_score"
                      value={formData.kcb_score}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="850"
                      min="300"
                      max="1000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      NICE 점수 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="nice_score"
                      value={formData.nice_score}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="800"
                      min="300"
                      max="1000"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="has_technology"
                      checked={formData.has_technology}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      기술력 보유 (특허, 기술인증 등)
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-7">
                    기술력 보유 시 기술보증기금 지원 대상이 됩니다.
                  </p>
                </div>
              </div>
            </div>

            {/* 필수 동의 항목 */}
            <div className="pb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">필수 동의 항목</h2>
              
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="agree_credit_check"
                    checked={formData.agree_credit_check}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    required
                  />
                  <span className="text-sm font-medium text-gray-700">
                    신용정보조회 동의 <span className="text-red-500">*</span>
                  </span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="agree_privacy"
                    checked={formData.agree_privacy}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    required
                  />
                  <span className="text-sm font-medium text-gray-700">
                    개인정보보호 동의 <span className="text-red-500">*</span>
                  </span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="agree_confidentiality"
                    checked={formData.agree_confidentiality}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    required
                  />
                  <span className="text-sm font-medium text-gray-700">
                    비밀유지서약서 동의 <span className="text-red-500">*</span>
                  </span>
                </label>

                <p className="text-xs text-red-600 mt-3">
                  * 필수 항목은 모두 동의해야 회원가입이 가능합니다.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Link
                href="/client/login"
                className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gray-800 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-900 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {loading ? '가입 중...' : '회원가입'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <footer className="text-center text-gray-500 text-sm mt-8 px-4">
        Copyright © 2026 EMFRONTIER Operating Company, LLC. All Rights Reserved
      </footer>
    </div>
  );
}
