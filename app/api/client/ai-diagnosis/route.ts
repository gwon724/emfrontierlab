import { NextRequest, NextResponse } from 'next/server';
import { initDatabase, getDatabase } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { performAIDiagnosis } from '@/lib/ai-diagnosis';

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

    // 클라이언트 정보 조회
    const client: any = db.prepare('SELECT * FROM clients WHERE id = ?').get(payload.id);
    
    if (!client) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // AI 진단 수행
    const clientData = {
      niceScore: client.nice_score,
      annualRevenue: client.annual_revenue,
      debt: client.debt,
      hasTechnology: client.has_technology === 1
    };

    const diagnosis = performAIDiagnosis(clientData);

    // AI 진단 결과 저장 (중복 방지)
    db.prepare(`
      INSERT OR REPLACE INTO ai_diagnosis 
      (client_id, soho_grade, recommended_funds, diagnosis_details)
      VALUES (?, ?, ?, ?)
    `).run(
      client.id,
      diagnosis.sohoGrade,
      JSON.stringify(diagnosis.recommendedFunds),
      diagnosis.details
    );

    return NextResponse.json({
      success: true,
      soho_grade: diagnosis.sohoGrade,
      recommended_funds: diagnosis.recommendedFunds,
      max_loan_limit: diagnosis.maxLoanLimit,
      details: diagnosis.details
    });

  } catch (error: any) {
    console.error('AI Diagnosis error:', error);
    return NextResponse.json(
      { error: 'AI 진단 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
