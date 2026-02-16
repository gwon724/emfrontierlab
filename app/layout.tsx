import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'EMFRONTIER LAB - 정책자금 AI 진단',
  description: '정책자금 신청을 위한 AI 진단 시스템',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
