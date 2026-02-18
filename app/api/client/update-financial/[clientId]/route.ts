import { NextRequest, NextResponse } from 'next/server';
import { initDatabase, getDatabase } from '@/lib/db';
import { calculateSOHOGrade, calculateMaxLoanLimit } from '@/lib/ai-diagnosis';

export async function PUT(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const clientId = params.clientId;
    const body = await request.json();

    const {
      annual_revenue,
      business_years,
      debt_policy_fund,
      debt_credit_loan,
      debt_secondary_loan,
      debt_card_loan
    } = body;

    // 총 부채 계산
    const total_debt = (debt_policy_fund || 0) + (debt_credit_loan || 0) + 
                       (debt_secondary_loan || 0) + (debt_card_loan || 0);

    initDatabase();
    const db = getDatabase();

    // 클라이언트 전체 정보 조회 (SOHO 등급 재계산용)
    const client: any = db.prepare('SELECT * FROM clients WHERE id = ?').get(clientId);
    if (!client) {
      return NextResponse.json({ error: '고객을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 재무 정보 업데이트
    db.prepare(`
      UPDATE clients 
      SET 
        annual_revenue = ?,
        business_years = ?,
        debt = ?,
        total_debt = ?,
        debt_policy_fund = ?,
        debt_credit_loan = ?,
        debt_secondary_loan = ?,
        debt_card_loan = ?
      WHERE id = ?
    `).run(
      annual_revenue || 0,
      business_years || 0,
      total_debt,
      total_debt,
      debt_policy_fund || 0,
      debt_credit_loan || 0,
      debt_secondary_loan || 0,
      debt_card_loan || 0,
      clientId
    );

    // SOHO 등급 및 점수 재계산
    const clientData = {
      niceScore: client.nice_score || 0,
      kcb_score: client.kcb_score || 0,
      annualRevenue: annual_revenue || 0,
      debt: total_debt,
      hasTechnology: client.has_technology === 1,
      businessYears: business_years || 0
    };

    const newSohoGrade = calculateSOHOGrade(clientData);
    const newMaxScore = calculateMaxLoanLimit(clientData, newSohoGrade);

    // SOHO 등급과 점수 업데이트
    db.prepare(`
      UPDATE clients 
      SET 
        soho_grade = ?,
        score = ?
      WHERE id = ?
    `).run(newSohoGrade, newMaxScore, clientId);

    return NextResponse.json({
      success: true,
      message: '재무 정보가 성공적으로 업데이트되었습니다.',
      soho_grade: newSohoGrade,
      score: newMaxScore
    });

  } catch (error: any) {
    console.error('Update financial error:', error);
    return NextResponse.json(
      { error: '업데이트 중 오류가 발생했습니다.', details: error.message },
      { status: 500 }
    );
  }
}
