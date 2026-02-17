import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { verifyToken } from '@/lib/auth';
import jwt from 'jsonwebtoken';

const QR_SECRET = process.env.QR_SECRET || 'emfrontier-qr-secret-2026';

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

    // QR 코드용 암호화된 토큰 생성 (관리자 사이트에서만 스캔 가능)
    const qrToken = jwt.sign(
      {
        clientId: payload.id,
        type: 'admin-qr',  // 관리자 전용 QR 타입
        timestamp: Date.now()
      },
      QR_SECRET,
      { expiresIn: '30d' } // QR 코드 유효기간 30일
    );

    // QR 데이터 생성 (관리자 사이트에서만 인식 가능)
    const qrData = JSON.stringify({
      token: qrToken,
      clientId: payload.id,
      issuer: 'EMFRONTIER_ADMIN'  // 관리자 사이트 발급 표시
    });

    // QR 코드 생성
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return NextResponse.json({
      qrCode: qrCodeDataURL,
      clientId: payload.id
    });

  } catch (error: any) {
    console.error('QR Code generation error:', error);
    return NextResponse.json(
      { error: 'QR 코드 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
