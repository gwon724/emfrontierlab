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

    // 현재 고객 정보 가져오기
    const client: any = db.prepare(
      'SELECT * FROM clients WHERE id = ?'
    ).get(payload.id);

    if (!client) {
      return NextResponse.json({ error: '고객 정보를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 현재 신청 정보 가져오기
    const application: any = db.prepare(
      'SELECT * FROM applications WHERE client_id = ?'
    ).get(payload.id);

    if (!application) {
      return NextResponse.json({ error: '신청 내역이 없습니다.' }, { status: 404 });
    }

    // === AI 진단 즉시 실행 ===
    console.log('🤖 AI 재심사 시작:', client.name);
    
    const diagnosisResult = performAIDiagnosis({
      niceScore: client.nice_score || 0,
      kcb_score: client.kcb_score || 0,
      annualRevenue: client.annual_revenue || 0,
      debt: client.total_debt || 0,
      hasTechnology: client.has_technology === 1,
      businessYears: client.business_years || 0
    });

    console.log('✅ AI 진단 완료:', {
      grade: diagnosisResult.sohoGrade,
      limit: diagnosisResult.maxLoanLimit,
      funds: diagnosisResult.recommendedFunds.length
    });

    // AI 진단 결과를 DB에 저장
    const existingDiagnosis: any = db.prepare(
      'SELECT id FROM ai_diagnosis WHERE client_id = ?'
    ).get(payload.id);

    if (existingDiagnosis) {
      // 기존 진단 결과 업데이트
      db.prepare(`
        UPDATE ai_diagnosis 
        SET soho_grade = ?,
            recommended_funds = ?,
            max_loan_limit = ?,
            details = ?,
            updated_at = datetime('now')
        WHERE client_id = ?
      `).run(
        diagnosisResult.sohoGrade,
        JSON.stringify(diagnosisResult.recommendedFunds),
        diagnosisResult.maxLoanLimit,
        diagnosisResult.details,
        payload.id
      );
    } else {
      // 새 진단 결과 생성
      db.prepare(`
        INSERT INTO ai_diagnosis (client_id, soho_grade, recommended_funds, max_loan_limit, details)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        payload.id,
        diagnosisResult.sohoGrade,
        JSON.stringify(diagrosisResult.recommendedFunds),
        diagnosisResult.maxLoanLimit,
        diagnosisResult.details
      );
    }

    // 고객 정보에 SOHO 등급과 점수 업데이트
    db.prepare(`
      UPDATE clients 
      SET soho_grade = ?, score = ?
      WHERE id = ?
    `).run(
      diagnosisResult.sohoGrade,
      diagnosisResult.maxLoanLimit,
      payload.id
    );

    // 신청서 상태를 '승인'으로 변경 (즉시 처리)
    db.prepare(`
      UPDATE applications 
      SET status = '승인', 
          notes = 'AI 재심사 자동 승인', 
          updated_at = datetime('now')
      WHERE client_id = ?
    `).run(payload.id);

    return NextResponse.json({
      success: true,
      message: 'AI 재심사가 완료되었습니다!',
      diagnosis: {
        sohoGrade: diagnosisResult.sohoGrade,
        maxLoanLimit: diagnosisResult.maxLoanLimit,
        recommendedFunds: diagnosisResult.recommendedFunds,
        details: diagnosisResult.details
      }
    });

  } catch (error: any) {
    console.error('Request review error:', error);
    return NextResponse.json(
      { error: '재심사 요청 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
