import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), '..', 'shared-emfrontier.db');

export async function POST(request: Request) {
  try {
    const { name, phone } = await request.json();

    if (!name || !phone) {
      return NextResponse.json(
        { error: '이름과 전화번호를 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    // 데이터베이스에서 사용자 검색
    const db = new Database(dbPath);
    const client = db.prepare(
      'SELECT email FROM clients WHERE name = ? AND phone = ?'
    ).get(name, phone) as { email: string } | undefined;
    db.close();

    if (!client) {
      return NextResponse.json(
        { error: '일치하는 회원 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    console.log(`✅ 아이디 찾기 성공: ${name} (${phone})`);

    return NextResponse.json({
      message: '아이디를 찾았습니다.',
      email: client.email,
    });

  } catch (error: any) {
    console.error('아이디 찾기 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
