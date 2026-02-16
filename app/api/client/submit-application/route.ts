import { NextRequest, NextResponse } from 'next/server';
import { initDatabase, getDatabase } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: '인증 토큰이 없습니다.' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.type !== 'client') {
      return NextResponse.json({ error: '유효하지 않은 토큰입니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { selected_funds } = body;

    if (!selected_funds || selected_funds.length === 0) {
      return NextResponse.json({ error: '선택된 정책자금이 없습니다.' }, { status: 400 });
    }

    initDatabase();
    const db = getDatabase();

    // 기존 신청이 있는지 확인
    const existingApplication: any = db.prepare(
      'SELECT id FROM applications WHERE client_id = ?'
    ).get(payload.id);

    if (existingApplication) {
      // 기존 신청 업데이트
      db.prepare(`
        UPDATE applications 
        SET policy_funds = ?, status = '접수대기', updated_at = datetime('now')
        WHERE client_id = ?
      `).run(JSON.stringify(selected_funds), payload.id);
    } else {
      // 새 신청 생성
      db.prepare(`
        INSERT INTO applications 
        (client_id, policy_funds, status, created_at, updated_at)
        VALUES (?, ?, '접수대기', datetime('now'), datetime('now'))
      `).run(payload.id, JSON.stringify(selected_funds));
    }

    return NextResponse.json({
      success: true,
      message: '정책자금 신청이 완료되었습니다.'
    });

  } catch (error: any) {
    console.error('Submit application error:', error);
    return NextResponse.json(
      { error: '신청 제출 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
