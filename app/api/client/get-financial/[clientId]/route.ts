import { NextRequest, NextResponse } from 'next/server';
import { initDatabase, getDatabase } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const clientId = params.clientId;

    initDatabase();
    const db = getDatabase();

    // 클라이언트 정보 조회
    const client: any = db.prepare(`
      SELECT id, name, email, annual_revenue, business_years, 
             debt, total_debt, debt_policy_fund, debt_credit_loan, 
             debt_secondary_loan, debt_card_loan
      FROM clients 
      WHERE id = ?
    `).get(clientId);

    if (!client) {
      return NextResponse.json({ error: '고객을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        annual_revenue: client.annual_revenue || 0,
        business_years: client.business_years || 0,
        debt: client.debt || 0,
        total_debt: client.total_debt || 0,
        debt_policy_fund: client.debt_policy_fund || 0,
        debt_credit_loan: client.debt_credit_loan || 0,
        debt_secondary_loan: client.debt_secondary_loan || 0,
        debt_card_loan: client.debt_card_loan || 0
      }
    });

  } catch (error: any) {
    console.error('Get financial error:', error);
    return NextResponse.json(
      { error: '정보를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
