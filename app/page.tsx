import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100">
      <div className="max-w-5xl mx-auto text-center space-y-12 p-8">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-800 mb-4">EMFRONTIER LAB</h1>
          <p className="text-2xl text-gray-700 font-semibold">정책자금 AI 진단 시스템</p>
          <p className="text-lg text-gray-600 mt-2">클라이언트와 관리자를 위한 통합 솔루션</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          {/* 클라이언트 카드 */}
          <Link 
            href="/client"
            className="group bg-white rounded-2xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2"
          >
            <div className="text-6xl mb-4">👤</div>
            <h2 className="text-3xl font-bold text-blue-600 mb-4 group-hover:text-blue-700">
              클라이언트
            </h2>
            <p className="text-gray-600 mb-6">
              정책자금 신청 및 진행상황 조회
            </p>
            <ul className="text-left space-y-2 mb-6 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                <span>AI 자동 진단 및 SOHO 등급 산정</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                <span>맞춤형 정책자금 추천</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                <span>실시간 진행상황 확인</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                <span>QR 코드 생성 및 공유</span>
              </li>
            </ul>
            <div className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold group-hover:bg-blue-700 transition-colors">
              클라이언트 사이트로 이동 →
            </div>
          </Link>

          {/* 관리자 카드 */}
          <Link 
            href="/admin"
            className="group bg-gray-900 rounded-2xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2"
          >
            <div className="text-6xl mb-4">👨‍💼</div>
            <h2 className="text-3xl font-bold text-white mb-4 group-hover:text-blue-400">
              관리자
            </h2>
            <p className="text-gray-300 mb-6">
              정책자금 신청 관리 및 심사
            </p>
            <ul className="text-left space-y-2 mb-6 text-sm text-gray-300">
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">✓</span>
                <span>전체 신청 현황 대시보드</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">✓</span>
                <span>회원 정보 및 신청 관리</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">✓</span>
                <span>진행상황 실시간 업데이트</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">✓</span>
                <span>QR 코드 스캔 및 검증</span>
              </li>
            </ul>
            <div className="inline-block px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold group-hover:bg-gray-100 transition-colors">
              관리자 사이트로 이동 →
            </div>
          </Link>
        </div>

        <div className="mt-12 p-6 bg-white bg-opacity-50 rounded-xl">
          <p className="text-sm text-gray-600">
            <strong className="text-gray-800">지원 정책자금:</strong> 소상공인진흥공단 · 중소벤처진흥공단 · 신용보증재단 · 신용보증기금 · 기술보증기금
          </p>
        </div>
      </div>
      
      <footer className="absolute bottom-4 text-center text-gray-600 text-sm px-4">
        Copyright © 2026 EMFRONTIER Operating Company, LLC. All Rights Reserved
      </footer>
    </div>
  );
}
