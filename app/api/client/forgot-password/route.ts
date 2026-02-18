import { NextResponse } from 'next/server';
import { initDatabase, getDatabase } from '@/lib/db';
import { generateVerificationCode, storeCode } from '@/lib/verification';

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
    initDatabase();
    const db = getDatabase();
    const client = db.prepare('SELECT * FROM clients WHERE email = ?').get(email);

    if (!client) {
      return NextResponse.json(
        { error: '등록되지 않은 이메일입니다.' },
        { status: 404 }
      );
    }

    // 인증 코드 생성 및 저장 (10분 유효)
    const code = generateVerificationCode();
    storeCode(email, code);

    // 실제로는 이메일 발송 서비스를 사용해야 합니다
    console.log('='.repeat(50));
    console.log('📧 비밀번호 재설정 인증 코드');
    console.log('='.repeat(50));
    console.log(`이메일: ${email}`);
    console.log(`인증 코드: ${code}`);
    console.log(`유효 시간: 10분`);
    console.log('='.repeat(50));

    return NextResponse.json({
      message: '인증 코드가 이메일로 발송되었습니다.',
      // 개발용: 실제 배포 시 제거
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
