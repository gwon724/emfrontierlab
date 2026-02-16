# EMFRONTIER LAB - 정책자금 AI 진단 시스템

정책자금 신청을 위한 AI 기반 진단 및 관리 시스템입니다.

## 🎯 주요 기능

### 클라이언트 사이트
- ✅ 회원가입 (이름, 나이, 성별, 연매출액, 부채, KCB/NICE 점수, 기술력 보유 정보 입력)
- ✅ 필수 동의 항목 (신용정보조회, 개인정보보호, 비밀유지서약서)
- ✅ AI 기반 SOHO 등급 자동 산정
- ✅ 정책자금 자동 추천
  - 소상공인진흥공단 (NICE 859점 이하)
  - 중소벤처진흥공단
  - 신용보증재단
  - 신용보증기금
  - 기술보증기금 (기술력 보유시)
- ✅ 진행상황 실시간 확인 (접수대기, 접수완료, 진행중, 진행완료, 집행완료, 보완, 반려)
- ✅ QR 코드 생성 (관리자 스캔용)

### 어드민 사이트
- ✅ 관리자 로그인
- ✅ 전체 클라이언트 목록 조회
- ✅ 상태별 통계 대시보드
- ✅ 진행상황 업데이트
- ✅ QR 코드 스캔 (비밀번호: 0504)
- ✅ 회원 검색 및 필터링

## 🛠 기술 스택

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite (better-sqlite3)
- **Authentication**: JWT (jsonwebtoken)
- **QR Code**: qrcode, html5-qrcode
- **Password Hashing**: bcryptjs

## 📦 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
```

서버가 http://localhost:3000 에서 실행됩니다.

### 3. 빌드
```bash
npm run build
npm start
```

## 🔑 기본 계정 정보

### 관리자 계정
- 이메일: `admin@emfrontier.com`
- 비밀번호: `admin123`

### QR 코드 스캔 비밀번호
- 비밀번호: `0504`

## 📁 프로젝트 구조

```
emfrontier-lab/
├── app/
│   ├── client/           # 클라이언트 페이지
│   │   ├── login/        # 로그인
│   │   ├── register/     # 회원가입
│   │   └── dashboard/    # 대시보드
│   ├── admin/            # 어드민 페이지
│   │   ├── login/        # 로그인
│   │   └── dashboard/    # 관리자 대시보드
│   └── api/              # API 엔드포인트
│       ├── client/       # 클라이언트 API
│       ├── admin/        # 어드민 API
│       └── qr/           # QR 코드 API
├── lib/
│   ├── db.ts            # 데이터베이스 설정
│   ├── ai-diagnosis.ts  # AI 진단 로직
│   └── auth.ts          # 인증 로직
└── components/          # 재사용 컴포넌트

```

## 🤖 AI 진단 로직

### SOHO 등급 산정 기준
- **신용점수 (40점)**: NICE 점수 기반
- **매출액 (30점)**: 연매출액 기반
- **부채비율 (20점)**: 부채/매출액 비율
- **기술력 (10점)**: 기술력 보유 여부

### 등급 분류
- S등급: 85점 이상
- A등급: 70-84점
- B등급: 55-69점
- C등급: 40-54점
- D등급: 40점 미만

## 📝 API 엔드포인트

### 클라이언트 API
- `POST /api/client/register` - 회원가입
- `POST /api/client/login` - 로그인
- `GET /api/client/dashboard` - 대시보드 데이터

### 어드민 API
- `POST /api/admin/login` - 관리자 로그인
- `GET /api/admin/dashboard` - 관리자 대시보드
- `PUT /api/admin/update-status` - 진행상황 업데이트

### QR 코드 API
- `GET /api/qr/generate` - QR 코드 생성
- `POST /api/qr/scan` - QR 코드 스캔 및 검증

## 📱 사용 방법

### 클라이언트
1. 회원가입 페이지에서 정보 입력
2. 필수 동의 항목 체크
3. 회원가입 완료 후 자동으로 SOHO 등급 산정
4. 대시보드에서 진행상황 및 추천 정책자금 확인
5. QR 코드 생성하여 관리자에게 제공

### 관리자
1. 관리자 계정으로 로그인
2. 대시보드에서 전체 신청 현황 확인
3. 클라이언트 진행상황 업데이트
4. QR 코드 스캔하여 클라이언트 정보 확인

## 🔒 보안

- 비밀번호는 bcrypt로 해시화하여 저장
- JWT 토큰 기반 인증
- QR 코드 스캔 시 비밀번호 추가 검증
- CSRF 방지를 위한 토큰 검증

## 📄 라이선스

Copyright © 2026 EMFRONTIER Operating Company, LLC. All Rights Reserved

## 👥 문의

관리자: admin@emfrontier.com
