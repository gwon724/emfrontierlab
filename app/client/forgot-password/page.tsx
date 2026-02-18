'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/client/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        // 3초 후 인증 코드 입력 페이지로 이동
        setTimeout(() => {
          router.push(`/client/reset-password?email=${encodeURIComponent(email)}`);
        }, 3000);
      } else {
        setError(data.error || '이메일 발송에 실패했습니다.');
      }
    } catch (err) {
      setError('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">EMFRONTIER LAB</h1>
          <p className="text-lg text-gray-600 font-semibold">비밀번호 찾기</p>
          <p className="text-sm text-gray-500 mt-1">등록된 이메일로 인증 코드를 발송합니다</p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          {success ? (
            <div className="text-center">
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">인증 코드 발송 완료!</h3>
                <p className="text-gray-600 mb-2">
                  {email}로 인증 코드를 발송했습니다.
                </p>
                <p className="text-sm text-gray-500">
                  이메일을 확인하고 6자리 인증 코드를 입력해주세요.
                </p>
              </div>
              <div className="mt-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-3">인증 페이지로 이동 중...</p>
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
                    <p className="font-semibold mb-1">비밀번호 재설정 절차:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>가입 시 사용한 이메일 주소 입력</li>
                      <li>이메일로 발송된 6자리 인증 코드 확인</li>
                      <li>인증 코드 입력 후 새 비밀번호 설정</li>
                    </ol>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이메일 주소
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="example@email.com"
                    required
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    가입 시 사용한 이메일 주소를 입력해주세요
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed mt-6"
                >
                  {loading ? '발송 중...' : '인증 코드 발송'}
                </button>
              </form>

              <div className="mt-6 text-center space-y-2">
                <div className="flex justify-center gap-4 text-sm">
                  <Link href="/client/find-email" className="text-blue-600 hover:text-blue-700">
                    아이디 찾기
                  </Link>
                  <span className="text-gray-400">|</span>
                  <Link href="/client/login" className="text-blue-600 hover:text-blue-700">
                    로그인
                  </Link>
                </div>
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
