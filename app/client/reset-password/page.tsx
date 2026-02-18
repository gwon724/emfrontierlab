'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  const validatePassword = (password: string) => {
    if (password.length < 8 || password.length > 20) {
      return '비밀번호는 8-20자여야 합니다.';
    }
    if (!/[a-zA-Z]/.test(password)) {
      return '영문자를 포함해야 합니다.';
    }
    if (!/[0-9]/.test(password)) {
      return '숫자를 포함해야 합니다.';
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return '특수문자(!@#$%^&*)를 포함해야 합니다.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 비밀번호 확인
    if (newPassword !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 비밀번호 유효성 검사
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/client/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        // 3초 후 로그인 페이지로 이동
        setTimeout(() => {
          router.push('/client/login');
        }, 3000);
      } else {
        setError(data.error || '비밀번호 재설정에 실패했습니다.');
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
          <p className="text-lg text-gray-600 font-semibold">비밀번호 재설정</p>
          <p className="text-sm text-gray-500 mt-1">인증 코드와 새 비밀번호를 입력하세요</p>
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
                <h3 className="text-xl font-bold text-gray-800 mb-2">비밀번호 재설정 완료!</h3>
                <p className="text-gray-600 mb-2">
                  비밀번호가 성공적으로 변경되었습니다.
                </p>
                <p className="text-sm text-gray-500">
                  새 비밀번호로 로그인해주세요.
                </p>
              </div>
              <div className="mt-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-3">로그인 페이지로 이동 중...</p>
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
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">이메일:</span> {email}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  이메일로 발송된 6자리 인증 코드를 입력하세요
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    인증 코드
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-center text-2xl tracking-widest font-mono"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    이메일로 발송된 6자리 숫자를 입력하세요
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    새 비밀번호
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="새 비밀번호"
                    required
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    영문, 숫자, 특수문자 포함 8-20자
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    비밀번호 확인
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="비밀번호 확인"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed mt-6"
                >
                  {loading ? '처리 중...' : '비밀번호 재설정'}
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
