'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function FindEmail() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [foundEmail, setFoundEmail] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/client/find-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      });

      const data = await res.json();

      if (res.ok) {
        setFoundEmail(data.email);
      } else {
        setError(data.error || '일치하는 회원 정보를 찾을 수 없습니다.');
      }
    } catch (err) {
      setError('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const maskEmail = (email: string) => {
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 2) {
      return `${localPart[0]}***@${domain}`;
    }
    const visiblePart = localPart.slice(0, 3);
    const maskedPart = '*'.repeat(localPart.length - 3);
    return `${visiblePart}${maskedPart}@${domain}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">EMFRONTIER LAB</h1>
          <p className="text-lg text-gray-600 font-semibold">아이디 찾기</p>
          <p className="text-sm text-gray-500 mt-1">가입 시 입력한 정보로 이메일을 찾습니다</p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          {foundEmail ? (
            <div className="text-center">
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">아이디를 찾았습니다!</h3>
                
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
                  <p className="text-sm text-gray-600 mb-2">회원님의 이메일</p>
                  <p className="text-2xl font-bold text-blue-600 mb-2">{maskEmail(foundEmail)}</p>
                  <p className="text-xs text-gray-500">보안을 위해 일부가 가려져 있습니다</p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="text-sm text-yellow-800">
                      <p className="font-semibold mb-1">완전한 이메일 주소 확인</p>
                      <p>이메일 전체 주소를 확인하려면 고객센터(admin@emfrontier.com)로 문의해주세요.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Link 
                  href="/client/login"
                  className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  로그인하기
                </Link>
                <Link
                  href="/client/forgot-password"
                  className="block w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                  비밀번호 찾기
                </Link>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                  {error}
                </div>
              )}

              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">아이디 찾기 안내:</p>
                    <p>회원가입 시 입력한 이름과 전화번호를 입력하시면 가입하신 이메일 주소를 확인하실 수 있습니다.</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이름
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="홍길동"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    전화번호
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9-]/g, ''))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="010-1234-5678"
                    required
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    가입 시 입력한 전화번호를 입력하세요
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed mt-6"
                >
                  {loading ? '검색 중...' : '아이디 찾기'}
                </button>
              </form>

              <div className="mt-6 flex justify-center gap-4 text-sm">
                <Link href="/client/forgot-password" className="text-blue-600 hover:text-blue-700">
                  비밀번호 찾기
                </Link>
                <span className="text-gray-400">|</span>
                <Link href="/client/login" className="text-blue-600 hover:text-blue-700">
                  로그인
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      <footer className="absolute bottom-4 text-center text-gray-500 text-sm px-4">
        Copyright © 2026 EMFRONTIER Operating Company, LLC. All Rights Reserved
      </footer>
    </div>
  );
}
