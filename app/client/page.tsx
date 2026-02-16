import Link from 'next/link';

export default function ClientHome() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto text-center space-y-8 p-8">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">EMFRONTIER LAB</h1>
          <p className="text-2xl text-blue-600 font-semibold">클라이언트 포털</p>
          <p className="text-lg text-gray-600 mt-2">정책자금 신청 및 조회 시스템</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">서비스 안내</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl mb-2">🤖</div>
              <h3 className="font-bold text-gray-800 mb-2">AI 자동 진단</h3>
              <p className="text-sm text-gray-600">
                신용점수, 매출액, 부채 등을 기반으로 SOHO 등급을 자동으로 산정합니다.
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-3xl mb-2">💰</div>
              <h3 className="font-bold text-gray-800 mb-2">정책자금 추천</h3>
              <p className="text-sm text-gray-600">
                고객님에게 맞는 정책자금을 자동으로 추천해드립니다.
              </p>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-bold text-gray-800 mb-2">진행상황 확인</h3>
              <p className="text-sm text-gray-600">
                실시간으로 신청 진행상황을 확인할 수 있습니다.
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl mb-2">📱</div>
              <h3 className="font-bold text-gray-800 mb-2">QR 코드 생성</h3>
              <p className="text-sm text-gray-600">
                관리자와 안전하게 정보를 공유할 수 있는 QR 코드를 생성합니다.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">지원 가능한 정책자금</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="flex items-start space-x-2">
              <span className="text-yellow-300 mt-1">✓</span>
              <span>소상공인진흥공단 - 취약소상공인상품</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-yellow-300 mt-1">✓</span>
              <span>중소벤처진흥공단</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-yellow-300 mt-1">✓</span>
              <span>신용보증재단</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-yellow-300 mt-1">✓</span>
              <span>신용보증기금</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-yellow-300 mt-1">✓</span>
              <span>기술보증기금</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-center mt-8">
          <Link 
            href="/client/login"
            className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
          >
            로그인
          </Link>
          <Link 
            href="/client/register"
            className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
          >
            회원가입
          </Link>
        </div>

        <div className="mt-8">
          <Link 
            href="/"
            className="text-gray-600 hover:text-gray-800 underline"
          >
            ← 메인으로 돌아가기
          </Link>
        </div>
      </div>
      
      <footer className="absolute bottom-4 text-center text-gray-500 text-sm px-4">
        Copyright © 2026 EMFRONTIER Operating Company, LLC. All Rights Reserved
      </footer>
    </div>
  );
}
