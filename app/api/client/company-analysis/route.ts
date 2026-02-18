import { NextRequest, NextResponse } from 'next/server';
import { initDatabase, getDatabase } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { performCompanyAnalysis } from '@/lib/ai-diagnosis';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: '인증 토큰이 없습니다.' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || payload.type !== 'client') {
      return NextResponse.json({ error: '유효하지 않은 토큰입니다.' }, { status: 401 });
    }

    initDatabase();
    const db = getDatabase();
    const client: any = db.prepare('SELECT * FROM clients WHERE id = ?').get(payload.id);
    if (!client) return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });

    const clientData = {
      niceScore: client.nice_score || 0,
      kcb_score: client.kcb_score || 0,
      annualRevenue: client.annual_revenue || 0,
      debt: client.debt || 0,
      hasTechnology: client.has_technology === 1,
      businessYears: client.business_years || 0,
      employeeCount: client.employee_count || 0,
    };

    const analysis = performCompanyAnalysis(clientData);
    return NextResponse.json({ success: true, analysis });
  } catch (error: any) {
    console.error('company-analysis error:', error);
    return NextResponse.json({ error: '분석 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
