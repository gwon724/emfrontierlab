import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), '..', 'shared-emfrontier.db');

// 인증 코드 생성 (6자리 숫자)
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 인증 코드 저장 (메모리 저장소 - 실제로는 Redis나 DB 사용 권장)
const verificationCodes = new Map<string, { code: string; expires: number }>();

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: '이메일을 입력해주세요.' },
        { status: 400 }
      );
    }

    // 데이터베이스에서 사용자 확인
    const db = new Database(dbPath);
    const client = db.prepare('SELECT * FROM clients WHERE email = ?').get(email);
    db.close();

    if (!client) {
      return NextResponse.json(
        { error: '등록되지 않은 이메일입니다.' },
        { status: 404 }
      );
    }

    // 인증 코드 생성
    const code = generateVerificationCode();
    
    // 인증 코드 저장 (10분 유효)
    const expires = Date.now() + 10 * 60 * 1000;
    verificationCodes.set(email, { code, expires });

    // 실제로는 이메일 발송 서비스를 사용해야 합니다
    // 여기서는 콘솔에 출력 (개발 환경)
    console.log('='.repeat(50));
    console.log('📧 비밀번호 재설정 인증 코드');
    console.log('='.repeat(50));
    console.log(`이메일: ${email}`);
    console.log(`인증 코드: ${code}`);
    console.log(`유효 시간: 10분`);
    console.log('='.repeat(50));

    // 개발 환경에서는 응답에 코드를 포함 (실제 환경에서는 제거해야 함)
    return NextResponse.json({
      message: '인증 코드가 이메일로 발송되었습니다.',
      // 개발용: 실제로는 이 부분 제거
      devCode: process.env.NODE_ENV === 'development' ? code : undefined,
    });

  } catch (error: any) {
    console.error('인증 코드 발송 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 인증 코드 검증 함수 (다른 API에서 사용)
export function verifyCode(email: string, code: string): boolean {
  const stored = verificationCodes.get(email);
  
  if (!stored) {
    return false;
  }

  // 만료 확인
  if (Date.now() > stored.expires) {
    verificationCodes.delete(email);
    return false;
  }

  // 코드 일치 확인
  if (stored.code !== code) {
    return false;
  }

  return true;
}

// 인증 코드 삭제 함수
export function deleteCode(email: string): void {
  verificationCodes.delete(email);
}
