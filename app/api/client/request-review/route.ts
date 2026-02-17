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

    initDatabase();
    const db = getDatabase();

    // 현재 신청 정보 가져오기
    const application: any = db.prepare(
      'SELECT * FROM applications WHERE client_id = ?'
    ).get(payload.id);

    if (!application) {
      return NextResponse.json({ error: '신청 내역이 없습니다.' }, { status: 404 });
    }

    // 상태를 접수대기로 변경 (모든 상태에서 재심사 가능)
    db.prepare(`
      UPDATE applications 
      SET status = '접수대기', notes = '재심사 요청', updated_at = datetime('now')
      WHERE client_id = ?
    `).run(payload.id);

    return NextResponse.json({
      success: true,
      message: '재심사가 요청되었습니다. 관리자가 검토 후 진행합니다.'
    });

  } catch (error: any) {
    console.error('Request review error:', error);
    return NextResponse.json(
      { error: '재심사 요청 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
