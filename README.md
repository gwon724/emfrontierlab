# EMFRONTIER LAB - 클라이언트 사이트

정책자금 신청을 위한 클라이언트 전용 웹사이트입니다.

## 🚀 실행 방법

```bash
npm install
npm run dev
```

서버가 http://localhost:3000 에서 실행됩니다.

## 📱 주요 기능

- **회원가입 및 로그인**
  - 비밀번호: 영문, 숫자, 특수문자 포함 8-20자
  
- **AI 기반 SOHO 등급 진단**
  - NICE 점수, 연매출, 부채, 기술력 등을 종합 분석
  - S/A/B/C/D 5단계 등급 산정
  
- **정책자금 복수 선택**
  - AI가 추천한 정책자금 목록에서 원하는 자금 복수 선택 가능
  - 체크박스 UI로 직관적인 선택
  
- **진행상황 실시간 확인**
  - 5초마다 자동 새로고침
  - 7단계 진행 상태 시각화 (접수대기 → 집행완료)
  
- **QR 코드 생성**
  - 본인 인증용 QR 코드 생성
  - 관리자 스캔용

## 🔑 테스트 계정

회원가입 후 사용하세요.

예시:
- 이메일: test@example.com
- 비밀번호: Test1234!@#

## 🏗️ 기술 스택

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite (공유 DB 사용)
- **Authentication**: JWT
- **QR Code**: qrcode library

## 📂 프로젝트 구조

```
client-site/
├── app/
│   ├── api/
│   │   ├── client/
│   │   │   ├── register/      # 회원가입
│   │   │   ├── login/         # 로그인
│   │   │   ├── dashboard/     # 대시보드 데이터
│   │   │   ├── ai-diagnosis/  # AI 진단
│   │   │   └── submit-application/ # 정책자금 신청
│   │   └── qr/
│   │       └── generate/      # QR 코드 생성
│   └── client/
│       ├── register/          # 회원가입 페이지
│       ├── login/             # 로그인 페이지
│       └── dashboard/         # 대시보드 페이지
├── lib/
│   ├── db.ts                  # 데이터베이스 연결
│   ├── auth.ts                # JWT 인증
│   └── ai-diagnosis.ts        # AI 진단 로직
└── shared-emfrontier.db       # 공유 데이터베이스
```

## 🔗 관련 리포지토리

- **관리자 사이트**: [emfrontierlab-admin](https://github.com/gwon724/emfrontierlab-admin)
- **공유 데이터베이스**: `/home/user/shared-emfrontier.db`

---

Copyright © 2026 EMFRONTIER Operating Company, LLC. All Rights Reserved
