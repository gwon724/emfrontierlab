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
    const totalDebt = client.total_debt || client.debt || 0;
    
    const clientData = {
      niceScore: client.nice_score || 0,
      kcb_score: client.kcb_score || 0,
      annualRevenue: client.annual_revenue || 0,
      debt: totalDebt,
      hasTechnology: client.has_technology === 1,
      businessYears: client.business_years || 0,
      age: client.age || 0,
      birth_date: client.birth_date || undefined,
      industry: client.industry || undefined,
      is_manufacturing: client.is_manufacturing || 0,
    };

    console.log('🤖 AI 진단 시작 (첫 진단):', client.name);
    console.log('📊 진단 데이터:', clientData);

    const diagnosis = performAIDiagnosis(clientData);

    console.log('✅ AI 진단 완료:', {
      grade: diagnosis.sohoGrade,
      limit: diagnosis.maxLoanLimit,
      funds: diagnosis.recommendedFunds.length
    });

    // AI 진단 결과 저장
    const existingDiagnosis: any = db.prepare(
      'SELECT id FROM ai_diagnosis WHERE client_id = ?'
    ).get(client.id);

    if (existingDiagnosis) {
      // 기존 진단 결과 업데이트
      db.prepare(`
        UPDATE ai_diagnosis 
        SET soho_grade = ?,
            recommended_funds = ?,
            max_loan_limit = ?,
            details = ?
        WHERE client_id = ?
      `).run(
        diagnosis.sohoGrade,
        JSON.stringify(diagnosis.recommendedFunds),
        diagnosis.maxLoanLimit,
        diagnosis.details,
        client.id
      );
    } else {
      // 새 진단 결과 생성
      db.prepare(`
        INSERT INTO ai_diagnosis (client_id, soho_grade, recommended_funds, max_loan_limit, details)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        client.id,
        diagnosis.sohoGrade,
        JSON.stringify(diagnosis.recommendedFunds),
        diagnosis.maxLoanLimit,
        diagnosis.details
      );
    }

    // 고객 정보에 SOHO 등급과 점수 업데이트
    db.prepare(`
      UPDATE clients 
      SET soho_grade = ?, score = ?
      WHERE id = ?
    `).run(
      diagnosis.sohoGrade,
      diagnosis.maxLoanLimit,
      client.id
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
