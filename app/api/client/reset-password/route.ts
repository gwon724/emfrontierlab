import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { initDatabase, getDatabase } from '@/lib/db';
import { verifyCode, deleteCode } from '@/lib/verification';

function validatePassword(password: string): string | null {
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
}

export async function POST(request: Request) {
  try {
    const { email, code, newPassword } = await request.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { error: '모든 필드를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 인증 코드 확인
    if (!verifyCode(email, code)) {
      return NextResponse.json(
        { error: '인증 코드가 올바르지 않거나 만료되었습니다.' },
        { status: 400 }
      );
    }

    // 비밀번호 유효성 검사
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return NextResponse.json(
        { error: passwordError },
        { status: 400 }
      );
    }

    // 데이터베이스에서 사용자 확인
    initDatabase();
    const db = getDatabase();
    const client = db.prepare('SELECT * FROM clients WHERE email = ?').get(email);

    if (!client) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 비밀번호 해싱 및 업데이트
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    db.prepare('UPDATE clients SET password = ? WHERE email = ?').run(hashedPassword, email);

    // 사용된 인증 코드 삭제
    deleteCode(email);

    console.log(`✅ 비밀번호 재설정 완료: ${email}`);

    return NextResponse.json({
      message: '비밀번호가 성공적으로 재설정되었습니다.',
    });

  } catch (error: any) {
    console.error('비밀번호 재설정 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
