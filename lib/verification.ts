// 인증 코드 공통 저장소 (forgot-password & reset-password 공유)
const verificationCodes = new Map<string, { code: string; expires: number }>();

// 인증 코드 생성 (6자리 숫자)
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 인증 코드 저장 (유효시간: 밀리초 단위)
export function storeCode(email: string, code: string, ttlMs = 10 * 60 * 1000): void {
  verificationCodes.set(email, { code, expires: Date.now() + ttlMs });
}

// 인증 코드 검증
export function verifyCode(email: string, code: string): boolean {
  const stored = verificationCodes.get(email);
  if (!stored) return false;

  if (Date.now() > stored.expires) {
    verificationCodes.delete(email);
    return false;
  }

  return stored.code === code;
}

// 인증 코드 삭제
export function deleteCode(email: string): void {
  verificationCodes.delete(email);
}
