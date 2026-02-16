import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { initDatabase, getDatabase } from '@/lib/db';
import { performAIDiagnosis } from '@/lib/ai-diagnosis';
import { generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    initDatabase();
    const db = getDatabase();
    
    const body = await request.json();
    const {
      email,
      password,
      name,
      age,
      gender,
      annual_revenue,
      debt,
      kcb_score,
      nice_score,
      has_technology,
      agree_credit_check,
      agree_privacy,
      agree_confidentiality
    } = body;

    // 필수 동의 항목 확인
    if (!agree_credit_check || !agree_privacy || !agree_confidentiality) {
      return NextResponse.json(
        { error: '필수 동의 항목을 모두 체크해주세요.' },
        { status: 400 }
      );
    }

    // 이메일 중복 확인
    const existingClient = db.prepare('SELECT * FROM clients WHERE email = ?').get(email);
    if (existingClient) {
      return NextResponse.json(
        { error: '이미 가입된 이메일입니다.' },
        { status: 400 }
      );
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 10);

    // AI 진단 수행
    const diagnosis = performAIDiagnosis({
      name,
      age: parseInt(age),
      gender,
      annual_revenue: parseInt(annual_revenue),
      debt: parseInt(debt),
      kcb_score: kcb_score ? parseInt(kcb_score) : undefined,
      nice_score: parseInt(nice_score),
      has_technology: has_technology === 'true' || has_technology === true
    });

    // 클라이언트 등록
    const result = db.prepare(`
      INSERT INTO clients (
        email, password, name, age, gender, annual_revenue, debt,
        kcb_score, nice_score, has_technology, soho_grade,
        agree_credit_check, agree_privacy, agree_confidentiality
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      email, hashedPassword, name, age, gender, annual_revenue, debt,
      kcb_score || null, nice_score, has_technology ? 1 : 0, diagnosis.sohoGrade,
      1, 1, 1
    );

    const clientId = result.lastInsertRowid;

    // AI 진단 결과 저장
    db.prepare(`
      INSERT INTO ai_diagnosis (client_id, soho_grade, recommended_funds, diagnosis_details)
      VALUES (?, ?, ?, ?)
    `).run(
      clientId,
      diagnosis.sohoGrade,
      JSON.stringify(diagnosis.recommendedFunds),
      diagnosis.details
    );

    // 초기 신청은 생성하지 않음 (AI 진단 후 사용자가 직접 선택하도록)

    // JWT 토큰 생성
    const token = generateToken({
      id: Number(clientId),
      email,
      type: 'client'
    });

    return NextResponse.json({
      success: true,
      message: '회원가입이 완료되었습니다.',
      token,
      clientId,
      sohoGrade: diagnosis.sohoGrade
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: '회원가입 중 오류가 발생했습니다: ' + error.message },
      { status: 500 }
    );
  }
}
