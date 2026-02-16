import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { initDatabase, getDatabase } from '@/lib/db';
import { generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    initDatabase();
    const db = getDatabase();
    
    const body = await request.json();
    const { email, password } = body;

    // 사용자 조회
    const client: any = db.prepare('SELECT * FROM clients WHERE email = ?').get(email);
    
    if (!client) {
      return NextResponse.json(
        { error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    // 비밀번호 확인
    const isValidPassword = await bcrypt.compare(password, client.password);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    // JWT 토큰 생성
    const token = generateToken({
      id: client.id,
      email: client.email,
      type: 'client'
    });

    return NextResponse.json({
      success: true,
      token,
      client: {
        id: client.id,
        email: client.email,
        name: client.name,
        soho_grade: client.soho_grade
      }
    });

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: '로그인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
