import type { Metadata } from 'next'
import '../globals.css'

export const metadata: Metadata = {
  title: 'EMFRONTIER LAB - 클라이언트',
  description: '정책자금 신청 및 조회',
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="client-site">
      {children}
    </div>
  )
}
