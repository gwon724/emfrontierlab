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

    // 정책자금별 개별 진행상태 조회
    let fundStatusMap: {[key: string]: {status: string; notes: string; updated_at: string}} = {};
    try {
      const fundStatuses: any[] = db.prepare('SELECT * FROM fund_statuses WHERE client_id = ?').all(client.id) as any[];
      fundStatuses.forEach((fs: any) => {
        fundStatusMap[fs.fund_name] = {
          status: fs.status,
          notes: fs.notes || '',
          updated_at: fs.updated_at,
        };
      });
    } catch (e) {
      // fund_statuses 테이블이 없으면 무시
    }

    return NextResponse.json({
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        soho_grade: client.soho_grade,
        nice_score: client.nice_score,
        kcb_score: client.kcb_score,
        has_technology: client.has_technology === 1,
        business_years: client.business_years || 0,
        annual_revenue: client.annual_revenue || 0,
        debt: client.debt || 0,
        total_debt: client.total_debt || 0,
        debt_policy_fund: client.debt_policy_fund || 0,
        debt_credit_loan: client.debt_credit_loan || 0,
        debt_secondary_loan: client.debt_secondary_loan || 0,
        debt_card_loan: client.debt_card_loan || 0,
      },
      application: application ? {
        id: application.id,
        status: application.status,
        policy_funds: application.policy_funds ? JSON.parse(application.policy_funds) : [],
        fund_amounts: application.fund_amounts ? JSON.parse(application.fund_amounts) : {},
        fund_statuses: fundStatusMap,
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
