import { NextRequest, NextResponse } from 'next/server';
import { initDatabase, getDatabase } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
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

    // 클라이언트 정보 조회
    const client: any = db.prepare('SELECT * FROM clients WHERE id = ?').get(payload.id);
    
    if (!client) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 진행 상황 조회
    const application: any = db.prepare('SELECT * FROM applications WHERE client_id = ? ORDER BY created_at DESC LIMIT 1').get(client.id);
    
    // AI 진단 결과 조회
    const diagnosis: any = db.prepare('SELECT * FROM ai_diagnosis WHERE client_id = ? ORDER BY created_at DESC LIMIT 1').get(client.id);

    return NextResponse.json({
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        soho_grade: client.soho_grade,
        nice_score: client.nice_score,
        has_technology: client.has_technology === 1,
      },
      application: application ? {
        id: application.id,
        status: application.status,
        policy_funds: application.policy_funds ? JSON.parse(application.policy_funds) : [],
        notes: application.notes,
        updated_at: application.updated_at,
      } : null,
      diagnosis: diagnosis ? {
        soho_grade: diagnosis.soho_grade,
        recommended_funds: JSON.parse(diagnosis.recommended_funds),
        diagnosis_details: diagnosis.diagnosis_details,
      } : null,
    });

  } catch (error: any) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: '데이터를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
