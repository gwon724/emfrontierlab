import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-8 p-8">
        <h1 className="text-5xl font-bold text-gray-800">EMFRONTIER LAB</h1>
        <p className="text-xl text-gray-600">정책자금 AI 진단 시스템</p>
        
        <div className="flex gap-6 justify-center mt-12">
          <Link 
            href="/client/login"
            className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
          >
            클라이언트 로그인
          </Link>
          <Link 
            href="/admin/login"
            className="px-8 py-4 bg-gray-800 text-white rounded-lg text-lg font-semibold hover:bg-gray-900 transition-colors shadow-lg"
          >
            관리자 로그인
          </Link>
        </div>
      </div>
      
      <footer className="absolute bottom-4 text-center text-gray-500 text-sm">
        Copyright © 2026 EMFRONTIER Operating Company, LLC. All Rights Reserved
      </footer>
    </div>
  );
}
