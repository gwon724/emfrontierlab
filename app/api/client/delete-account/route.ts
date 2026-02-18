import { NextRequest, NextResponse } from 'next/server';
import { initDatabase, getDatabase } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function DELETE(request: NextRequest) {
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

    const client: any = db.prepare('SELECT id, name, email FROM clients WHERE id = ?').get(payload.id);
    if (!client) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 관련 데이터 삭제 (외래키 제약 비활성화)
    db.pragma('foreign_keys = OFF');
    const deleteAll = db.transaction(() => {
      db.prepare('DELETE FROM ai_diagnosis WHERE client_id = ?').run(client.id);
      db.prepare('DELETE FROM applications WHERE client_id = ?').run(client.id);
      db.prepare('DELETE FROM fund_statuses WHERE client_id = ?').run(client.id);
      try { db.prepare('DELETE FROM financial_statements WHERE client_id = ?').run(client.id); } catch (_) {}
      try { db.prepare('DELETE FROM financial_analysis WHERE client_id = ?').run(client.id); } catch (_) {}
      try { db.prepare('DELETE FROM client_documents WHERE client_id = ?').run(client.id); } catch (_) {}
      db.prepare('DELETE FROM clients WHERE id = ?').run(client.id);
    });
    deleteAll();
    db.pragma('foreign_keys = ON');

    console.log(`✅ 클라이언트 계정 삭제: ${client.name} (${client.email})`);
    return NextResponse.json({ success: true, message: `${client.name}님의 계정이 삭제되었습니다.` });
  } catch (error: any) {
    console.error('delete-account error:', error);
    return NextResponse.json({ error: '계정 삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
