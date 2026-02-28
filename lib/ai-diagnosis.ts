// AI 진단 로직

export interface ClientData {
  niceScore?: number;
  nice_score?: number;
  kcbScore?: number;
  kcb_score?: number;
  annualRevenue?: number;
  annual_revenue?: number;
  totalDebt?: number;
  total_debt?: number;
  debt?: number;
  hasTechnology?: boolean;
  has_technology?: boolean;
  name?: string;
  age?: number;
  gender?: string;
  businessYears?: number;
  business_years?: number;
  employeeCount?: number;
  employee_count?: number;
  debtPolicyFund?: number;
  debt_policy_fund?: number;
  debtCreditLoan?: number;
  debt_credit_loan?: number;
  debtSecondaryLoan?: number;
  debt_secondary_loan?: number;
  debtCardLoan?: number;
  debt_card_loan?: number;
}

// 개별 조건 체크 결과
export interface FundCondition {
  label: string;       // 조건명
  required: string;    // 요구 조건 설명
  actual: string;      // 실제 값
  passed: boolean;     // 충족 여부
}

// 정책자금 추천 결과 (조건 상세 포함)
export interface PolicyFundResult {
  name: string;
  category: string;
  max_amount: number;
  interest_rate: string;
  requirements: string;
  conditions: FundCondition[];   // 조건 체크 목록
  eligible: boolean;             // 전체 통과 여부
  passCount: number;             // 충족 조건 수
  totalCount: number;            // 전체 조건 수
}

export interface PolicyFund {
  name: string;
  category: string;
  max_amount: number;
  interest_rate: string;
  requirements: string;
}

export interface DiagnosisResult {
  sohoGrade: string;
  recommendedFunds: PolicyFundResult[];
  maxLoanLimit: number;
  details: string;
}

// ═══════════════════════════════════════════════════════
// 정책자금 정의 (조건 체크 함수 포함)
// ═══════════════════════════════════════════════════════
type FundDef = {
  category: string;
  max_amount: number;
  interest_rate: string;
  requirements: string;
  checkConditions: (c: ClientData) => FundCondition[];
};

const FUND_DEFINITIONS: Record<string, FundDef> = {

  '소진공 취약소상공인자금': {
    category: '소진공',
    max_amount: 30000000,
    interest_rate: '2.0%',
    requirements: 'NICE 신용점수 839점 이하',
    checkConditions: (c) => {
      const nice = c.niceScore || c.nice_score || 0;
      return [
        { label: 'NICE 신용점수', required: '839점 이하', actual: `${nice}점`, passed: nice <= 839 && nice > 0 },
      ];
    }
  },

  '중진공 청년창업 지원금': {
    category: '중진공',
    max_amount: 100000000,
    interest_rate: '2.5%',
    requirements: '업력 3년 이내',
    checkConditions: (c) => {
      const yrs = c.businessYears ?? c.business_years ?? 0;
      const rev = c.annualRevenue || c.annual_revenue || 0;
      return [
        { label: '업력', required: '3년 이내', actual: `${yrs}년`, passed: yrs <= 3 },
        { label: '연매출', required: '제한 없음', actual: `${(rev/100000000).toFixed(1)}억`, passed: true },
      ];
    }
  },

  '중진공 혁신창업사업화자금': {
    category: '중진공',
    max_amount: 150000000,
    interest_rate: '2.3%',
    requirements: '업력 7년 이하, 기술력 보유',
    checkConditions: (c) => {
      const yrs = c.businessYears ?? c.business_years ?? 0;
      const tech = c.hasTechnology ?? c.has_technology ?? false;
      return [
        { label: '업력', required: '7년 이하', actual: `${yrs}년`, passed: yrs <= 7 },
        { label: '기술력 보유', required: '필요', actual: tech ? '보유' : '미보유', passed: tech },
      ];
    }
  },

  '중진공 신시장진출지원자금': {
    category: '중진공',
    max_amount: 120000000,
    interest_rate: '2.7%',
    requirements: '업력 무관, 매출 1억 이상',
    checkConditions: (c) => {
      const rev = c.annualRevenue || c.annual_revenue || 0;
      const debt = c.totalDebt || c.total_debt || c.debt || 0;
      const debtRatio = rev > 0 ? (debt / rev) * 100 : 999;
      return [
        { label: '연매출', required: '1억 이상', actual: `${(rev/100000000).toFixed(1)}억`, passed: rev >= 100000000 },
        { label: '부채비율', required: '150% 이하', actual: `${debtRatio.toFixed(0)}%`, passed: debtRatio <= 150 },
      ];
    }
  },

  '중진공 재도약지원자금': {
    category: '중진공',
    max_amount: 200000000,
    interest_rate: '2.8%',
    requirements: '업력 3년 이상, NICE 700점 이상',
    checkConditions: (c) => {
      const yrs = c.businessYears ?? c.business_years ?? 0;
      const nice = c.niceScore || c.nice_score || 0;
      const rev = c.annualRevenue || c.annual_revenue || 0;
      return [
        { label: '업력', required: '3년 이상', actual: `${yrs}년`, passed: yrs >= 3 },
        { label: 'NICE 신용점수', required: '700점 이상', actual: `${nice}점`, passed: nice >= 700 },
        { label: '연매출', required: '5천만 이상', actual: `${(rev/100000000).toFixed(1)}억`, passed: rev >= 50000000 },
      ];
    }
  },

  '중진공 제조현장스마트화자금': {
    category: '중진공',
    max_amount: 180000000,
    interest_rate: '2.4%',
    requirements: '업력 2년 이상, 기술력 보유',
    checkConditions: (c) => {
      const yrs = c.businessYears ?? c.business_years ?? 0;
      const tech = c.hasTechnology ?? c.has_technology ?? false;
      const rev = c.annualRevenue || c.annual_revenue || 0;
      return [
        { label: '업력', required: '2년 이상', actual: `${yrs}년`, passed: yrs >= 2 },
        { label: '기술력 보유', required: '필요', actual: tech ? '보유' : '미보유', passed: tech },
        { label: '연매출', required: '3천만 이상', actual: `${(rev/100000000).toFixed(1)}억`, passed: rev >= 30000000 },
      ];
    }
  },

  '소진공 일반경영안정자금': {
    category: '소진공',
    max_amount: 80000000,
    interest_rate: '2.5%',
    requirements: '업력 1년 이상, 매출 감소 등',
    checkConditions: (c) => {
      const yrs = c.businessYears ?? c.business_years ?? 0;
      const rev = c.annualRevenue || c.annual_revenue || 0;
      const debt = c.totalDebt || c.total_debt || c.debt || 0;
      const debtRatio = rev > 0 ? (debt / rev) * 100 : 999;
      return [
        { label: '업력', required: '1년 이상', actual: `${yrs}년`, passed: yrs >= 1 },
        { label: '연매출', required: '1억 이상', actual: `${(rev/100000000).toFixed(1)}억`, passed: rev >= 100000000 },
        { label: '부채비율', required: '200% 이하', actual: `${debtRatio.toFixed(0)}%`, passed: debtRatio <= 200 },
      ];
    }
  },

  '소진공 성장촉진자금': {
    category: '소진공',
    max_amount: 100000000,
    interest_rate: '2.6%',
    requirements: '업력 3년 이상, 매출 성장세',
    checkConditions: (c) => {
      const yrs = c.businessYears ?? c.business_years ?? 0;
      const rev = c.annualRevenue || c.annual_revenue || 0;
      const nice = c.niceScore || c.nice_score || 0;
      return [
        { label: '업력', required: '3년 이상', actual: `${yrs}년`, passed: yrs >= 3 },
        { label: '연매출', required: '1억 이상', actual: `${(rev/100000000).toFixed(1)}억`, passed: rev >= 100000000 },
        { label: 'NICE 신용점수', required: '650점 이상', actual: `${nice}점`, passed: nice >= 650 },
      ];
    }
  },

  '소진공 청년고용연계자금': {
    category: '소진공',
    max_amount: 90000000,
    interest_rate: '2.4%',
    requirements: '업력 1년 이상, 청년고용 의지',
    checkConditions: (c) => {
      const yrs = c.businessYears ?? c.business_years ?? 0;
      const emp = c.employeeCount ?? c.employee_count ?? 0;
      return [
        { label: '업력', required: '1년 이상', actual: `${yrs}년`, passed: yrs >= 1 },
        { label: '직원수', required: '1명 이상', actual: `${emp}명`, passed: emp >= 1 },
      ];
    }
  },

  '신용보증기금 신용보증서 (반보증)': {
    category: '신용보증',
    max_amount: 300000000,
    interest_rate: '3.0%',
    requirements: 'NICE 700점 이상, 매출 1억 이상',
    checkConditions: (c) => {
      const nice = c.niceScore || c.nice_score || 0;
      const kcb = c.kcbScore || c.kcb_score || 0;
      const rev = c.annualRevenue || c.annual_revenue || 0;
      const debt = c.totalDebt || c.total_debt || c.debt || 0;
      const debtRatio = rev > 0 ? (debt / rev) * 100 : 999;
      return [
        { label: 'NICE 신용점수', required: '700점 이상', actual: `${nice}점`, passed: nice >= 700 },
        { label: 'KCB 신용점수', required: '650점 이상', actual: kcb > 0 ? `${kcb}점` : '미입력', passed: kcb === 0 || kcb >= 650 },
        { label: '연매출', required: '1억 이상', actual: `${(rev/100000000).toFixed(1)}억`, passed: rev >= 100000000 },
        { label: '부채비율', required: '200% 이하', actual: `${debtRatio.toFixed(0)}%`, passed: debtRatio <= 200 },
      ];
    }
  },

  '신용보증기금 유망창업기업보증': {
    category: '신용보증',
    max_amount: 250000000,
    interest_rate: '2.9%',
    requirements: 'NICE 700점 이상, 업력 5년 이내',
    checkConditions: (c) => {
      const nice = c.niceScore || c.nice_score || 0;
      const yrs = c.businessYears ?? c.business_years ?? 0;
      const rev = c.annualRevenue || c.annual_revenue || 0;
      return [
        { label: 'NICE 신용점수', required: '700점 이상', actual: `${nice}점`, passed: nice >= 700 },
        { label: '업력', required: '5년 이내', actual: `${yrs}년`, passed: yrs <= 5 },
        { label: '연매출', required: '5천만 이상', actual: `${(rev/100000000).toFixed(1)}억`, passed: rev >= 50000000 },
      ];
    }
  },

  '기술보증기금 기술보증서': {
    category: '기술보증',
    max_amount: 400000000,
    interest_rate: '2.8%',
    requirements: '기술력 보유 필수',
    checkConditions: (c) => {
      const tech = c.hasTechnology ?? c.has_technology ?? false;
      const nice = c.niceScore || c.nice_score || 0;
      const rev = c.annualRevenue || c.annual_revenue || 0;
      return [
        { label: '기술력 보유', required: '필수', actual: tech ? '보유' : '미보유', passed: tech },
        { label: 'NICE 신용점수', required: '650점 이상', actual: `${nice}점`, passed: nice >= 650 },
        { label: '연매출', required: '3천만 이상', actual: `${(rev/100000000).toFixed(1)}억`, passed: rev >= 30000000 },
      ];
    }
  },

  '기술보증기금 벤처기업특례보증': {
    category: '기술보증',
    max_amount: 500000000,
    interest_rate: '2.5%',
    requirements: '기술력 보유, 업력 7년 이하',
    checkConditions: (c) => {
      const tech = c.hasTechnology ?? c.has_technology ?? false;
      const yrs = c.businessYears ?? c.business_years ?? 0;
      const nice = c.niceScore || c.nice_score || 0;
      const rev = c.annualRevenue || c.annual_revenue || 0;
      return [
        { label: '기술력 보유', required: '필수', actual: tech ? '보유' : '미보유', passed: tech },
        { label: '업력', required: '7년 이하', actual: `${yrs}년`, passed: yrs <= 7 },
        { label: 'NICE 신용점수', required: '700점 이상', actual: `${nice}점`, passed: nice >= 700 },
        { label: '연매출', required: '5천만 이상', actual: `${(rev/100000000).toFixed(1)}억`, passed: rev >= 50000000 },
      ];
    }
  },
};

// ═══════════════════════════════════════════════════════
// SOHO 등급 계산
// ═══════════════════════════════════════════════════════
export function calculateSOHOGrade(client: ClientData): string {
  let score = 0;
  const niceScore = client.niceScore || client.nice_score || 0;
  const annualRevenue = client.annualRevenue || client.annual_revenue || 0;
  const totalDebt = client.totalDebt || client.total_debt || client.debt || 0;
  const hasTechnology = client.hasTechnology ?? client.has_technology ?? false;
  const businessYears = client.businessYears ?? client.business_years ?? 0;
  const employeeCount = client.employeeCount ?? client.employee_count ?? 0;

  // 신용점수 (35점)
  if (niceScore >= 900) score += 35;
  else if (niceScore >= 850) score += 30;
  else if (niceScore >= 800) score += 25;
  else if (niceScore >= 750) score += 20;
  else if (niceScore >= 700) score += 15;
  else score += 8;

  // 매출액 (25점)
  if (annualRevenue >= 500000000) score += 25;
  else if (annualRevenue >= 300000000) score += 20;
  else if (annualRevenue >= 100000000) score += 15;
  else if (annualRevenue >= 50000000) score += 10;
  else score += 5;

  // 부채비율 (20점)
  const debtRatio = annualRevenue > 0 ? (totalDebt / annualRevenue) * 100 : 100;
  if (debtRatio < 30) score += 20;
  else if (debtRatio < 50) score += 16;
  else if (debtRatio < 70) score += 12;
  else if (debtRatio < 100) score += 8;
  else score += 3;

  // 업력 (10점)
  if (businessYears >= 10) score += 10;
  else if (businessYears >= 7) score += 8;
  else if (businessYears >= 5) score += 6;
  else if (businessYears >= 3) score += 4;
  else if (businessYears >= 1) score += 2;

  // 직원수 (5점)
  if (employeeCount >= 10) score += 5;
  else if (employeeCount >= 5) score += 4;
  else if (employeeCount >= 3) score += 3;
  else if (employeeCount >= 1) score += 2;

  // 기술력 (5점)
  if (hasTechnology) score += 5;

  if (score >= 80) return 'S';
  else if (score >= 65) return 'A';
  else if (score >= 50) return 'B';
  else if (score >= 35) return 'C';
  else return 'D';
}

// ═══════════════════════════════════════════════════════
// 최대 대출 한도 계산
// ═══════════════════════════════════════════════════════
export function calculateMaxLoanLimit(client: ClientData, sohoGrade: string): number {
  const niceScore = client.niceScore || client.nice_score || 0;
  const kcbScore = client.kcbScore || client.kcb_score || 0;
  const annualRevenue = client.annualRevenue || client.annual_revenue || 0;
  const totalDebt = client.totalDebt || client.total_debt || client.debt || 0;
  const hasTechnology = client.hasTechnology ?? client.has_technology ?? false;
  const businessYears = client.businessYears ?? client.business_years ?? 0;

  const avgCreditScore = kcbScore > 0 ? (niceScore + kcbScore) / 2 : niceScore;

  let creditBasedLimit = 0;
  if (avgCreditScore >= 900) creditBasedLimit = 500000000;
  else if (avgCreditScore >= 850) creditBasedLimit = 400000000;
  else if (avgCreditScore >= 800) creditBasedLimit = 300000000;
  else if (avgCreditScore >= 750) creditBasedLimit = 200000000;
  else if (avgCreditScore >= 700) creditBasedLimit = 150000000;
  else if (avgCreditScore >= 650) creditBasedLimit = 100000000;
  else creditBasedLimit = 50000000;

  let revenueMultiplier = 0.4;
  if (avgCreditScore >= 850) revenueMultiplier = 0.6;
  else if (avgCreditScore >= 800) revenueMultiplier = 0.55;
  else if (avgCreditScore >= 750) revenueMultiplier = 0.5;
  else if (avgCreditScore >= 700) revenueMultiplier = 0.45;
  const revenueBasedLimit = annualRevenue * revenueMultiplier;

  const debtRatio = annualRevenue > 0 ? (totalDebt / annualRevenue) * 100 : 200;
  let debtAdjustment = 1.0;
  if (debtRatio >= 200) debtAdjustment = 0.2;
  else if (debtRatio >= 150) debtAdjustment = 0.4;
  else if (debtRatio >= 120) debtAdjustment = 0.6;
  else if (debtRatio >= 100) debtAdjustment = 0.7;
  else if (debtRatio >= 80) debtAdjustment = 0.8;
  else if (debtRatio >= 60) debtAdjustment = 0.9;
  else debtAdjustment = 1.1;

  let businessYearsBonus = 1.0;
  if (businessYears >= 10) businessYearsBonus = 1.15;
  else if (businessYears >= 7) businessYearsBonus = 1.1;
  else if (businessYears >= 5) businessYearsBonus = 1.05;
  else if (businessYears >= 3) businessYearsBonus = 1.0;
  else if (businessYears >= 1) businessYearsBonus = 0.9;
  else businessYearsBonus = 0.8;

  const techBonus = hasTechnology ? 1.15 : 1.0;

  let gradeWeight = 1.0;
  switch (sohoGrade) {
    case 'S': gradeWeight = 1.3; break;
    case 'A': gradeWeight = 1.2; break;
    case 'B': gradeWeight = 1.1; break;
    case 'C': gradeWeight = 1.0; break;
    case 'D': gradeWeight = 0.85; break;
    default: gradeWeight = 0.7;
  }

  let baseLimit = Math.max(creditBasedLimit, revenueBasedLimit);
  let finalLimit = baseLimit * debtAdjustment * businessYearsBonus * techBonus * gradeWeight;
  finalLimit = Math.max(30000000, Math.min(1000000000, finalLimit));
  finalLimit = Math.round(finalLimit / 10000000) * 10000000;
  return finalLimit;
}

// ═══════════════════════════════════════════════════════
// 정책자금 조건 체크 (노션 스타일 상세 결과 반환)
// ═══════════════════════════════════════════════════════
export function evaluatePolicyFunds(client: ClientData): PolicyFundResult[] {
  return Object.entries(FUND_DEFINITIONS).map(([name, def]) => {
    const conditions = def.checkConditions(client);
    const passCount = conditions.filter(c => c.passed).length;
    const eligible = conditions.every(c => c.passed);
    return {
      name,
      category: def.category,
      max_amount: def.max_amount,
      interest_rate: def.interest_rate,
      requirements: def.requirements,
      conditions,
      eligible,
      passCount,
      totalCount: conditions.length,
    };
  }).sort((a, b) => {
    // 충족 → 부분 충족 → 미충족 순 정렬
    if (a.eligible && !b.eligible) return -1;
    if (!a.eligible && b.eligible) return 1;
    return b.passCount / b.totalCount - a.passCount / a.totalCount;
  });
}

// ═══════════════════════════════════════════════════════
// 기업 집중 분석 결과
// ═══════════════════════════════════════════════════════
export interface CompanyAnalysis {
  revenueLevel: { grade: string; comment: string; score: number; detail: string };
  debtLevel: { grade: string; comment: string; score: number; ratio: number; detail: string };
  employeeLevel: { grade: string; comment: string; score: number; detail: string };
  businessAgeLevel: { grade: string; comment: string; score: number; detail: string };
  creditLevel: { grade: string; comment: string; score: number; detail: string };
  overallScore: number;
  overallGrade: string;
  summary: string;
  executiveSummary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  riskAnalysis: string[];
  fundingStrategy: string;
  reportDate: string;
}

export function performCompanyAnalysis(client: ClientData): CompanyAnalysis {
  const rev = client.annualRevenue || client.annual_revenue || 0;
  const debt = client.totalDebt || client.total_debt || client.debt || 0;
  const emp = client.employeeCount ?? client.employee_count ?? 0;
  const yrs = client.businessYears ?? client.business_years ?? 0;
  const nice = client.niceScore || client.nice_score || 0;
  const kcb = client.kcbScore || client.kcb_score || 0;
  const tech = client.hasTechnology ?? client.has_technology ?? false;
  const debtRatio = rev > 0 ? (debt / rev) * 100 : 999;
  const revBillion = (rev / 100000000).toFixed(2);
  const debtBillion = (debt / 100000000).toFixed(2);
  const reportDate = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

  // ── 매출 분석 ──
  let revGrade = 'E'; let revScore = 0; let revComment = ''; let revDetail = '';
  if (rev >= 1000000000) {
    revGrade = 'S'; revScore = 100;
    revComment = '매출 10억 이상 우수 기업';
    revDetail = `연매출 ${revBillion}억원으로 소상공인 중 상위권에 해당하는 우수한 매출 실적을 보유하고 있습니다. 이 수준의 매출은 대부분의 정책자금에서 최대 한도 신청이 가능하며, 중진공 시설자금 및 운전자금 등 대형 정책자금 이용에 매우 유리한 위치입니다. 안정적인 매출 기반을 바탕으로 사업 확장 및 신규 투자를 위한 정책 금융을 적극 활용할 시점으로 판단됩니다.`;
  } else if (rev >= 500000000) {
    revGrade = 'A'; revScore = 85;
    revComment = '매출 5억 이상 안정적 기업';
    revDetail = `연매출 ${revBillion}억원으로 소규모 기업 중 안정적인 매출 구조를 갖추고 있습니다. 이 수준에서는 소진공·중진공 주요 정책자금의 신청 기준을 대부분 충족하며, 매출 성장세에 따라 추가 한도 확보도 기대할 수 있습니다. 매출 증가를 위한 마케팅·설비 투자용 운전자금 확보를 우선 검토하시길 권장합니다.`;
  } else if (rev >= 300000000) {
    revGrade = 'B'; revScore = 70;
    revComment = '매출 3억 이상 성장 기업';
    revDetail = `연매출 ${revBillion}억원으로 성장 단계에 있는 소기업입니다. 주요 정책자금의 기준 매출을 충족하며, 적정 규모의 운전자금 및 창업 초기 자금 이용이 가능합니다. 매출을 5억원 이상으로 성장시키면 보다 다양한 자금에 접근할 수 있으므로, 성장을 위한 단계적 자금 계획 수립이 중요합니다.`;
  } else if (rev >= 100000000) {
    revGrade = 'C'; revScore = 55;
    revComment = '매출 1억 이상 소규모 기업';
    revDetail = `연매출 ${revBillion}억원으로 소규모 사업체 수준입니다. 일부 소진공 소상공인 전용 자금 및 창업 초기 자금 이용은 가능하나, 한도에 제약이 있을 수 있습니다. 매출 실적을 꾸준히 쌓아 신청 가능한 자금의 폭을 넓혀가는 전략이 필요합니다. 매출 증빙 서류(부가가치세 신고서, 세금계산서 등)를 철저히 관리하시길 권장합니다.`;
  } else if (rev >= 50000000) {
    revGrade = 'D'; revScore = 40;
    revComment = '매출 5천만 이상 초기 기업';
    revDetail = `연매출 ${revBillion}억원으로 사업 초기 단계의 매출 수준입니다. 대부분의 정책자금에서 매출 기준 충족 여부를 꼼꼼히 검토해야 합니다. 소진공 취약소상공인 전용 저금리 자금이나 창업 패키지 지원 프로그램을 우선 활용하시고, 매출 확대 전략과 병행하여 자금 계획을 수립하시길 권장합니다.`;
  } else {
    revGrade = 'E'; revScore = 20;
    revComment = '매출 5천만 미만 영세 기업';
    revDetail = `연매출 ${revBillion}억원으로 현재 매출 규모가 매우 낮은 수준입니다. 대부분의 정책자금에서 최소 매출 기준 미충족으로 한도가 크게 제한됩니다. 먼저 소진공 영세소상공인 특례자금, 지자체 창업지원금 등 매출 요건이 낮은 자금부터 검토하고, 사업 운영 안정화 후 정책자금을 확대 활용하시길 권장합니다.`;
  }

  // ── 부채 분석 ──
  let debtGrade = 'E'; let debtScore = 0; let debtComment = ''; let debtDetail = '';
  const debtRatioStr = debtRatio === 999 ? '산출불가(매출 없음)' : debtRatio.toFixed(1) + '%';
  if (debtRatio <= 30) {
    debtGrade = 'S'; debtScore = 100;
    debtComment = '부채비율 30% 이하 매우 건전';
    debtDetail = `총 부채 ${debtBillion}억원, 부채비율 ${debtRatioStr}로 재무구조가 매우 건전합니다. 이 수준의 부채비율은 금융기관 및 보증기관에서 최우수 등급으로 평가되며, 추가 차입 여력이 충분합니다. 시설 투자나 운전자금 확보를 위해 정책자금을 적극적으로 활용할 수 있는 최적의 상태입니다. 신용보증기금·기술보증기금의 보증서 발급도 유리하게 진행될 가능성이 높습니다.`;
  } else if (debtRatio <= 50) {
    debtGrade = 'A'; debtScore = 85;
    debtComment = '부채비율 50% 이하 건전한 재무구조';
    debtDetail = `총 부채 ${debtBillion}억원, 부채비율 ${debtRatioStr}로 건전한 재무구조를 유지하고 있습니다. 대부분의 정책자금 심사에서 부채비율 기준을 충족하며, 보증기관의 보증서 발급도 원활히 진행될 것으로 예상됩니다. 현재의 건전한 재무 상태를 유지하면서 필요한 자금을 전략적으로 활용하시길 권장합니다.`;
  } else if (debtRatio <= 80) {
    debtGrade = 'B'; debtScore = 70;
    debtComment = '부채비율 80% 이하 양호';
    debtDetail = `총 부채 ${debtBillion}억원, 부채비율 ${debtRatioStr}로 양호한 수준입니다. 주요 정책자금 이용에는 큰 문제가 없으나, 일부 고한도 자금에서는 부채비율 요건을 더 엄격하게 적용할 수 있습니다. 신규 부채 발생을 최소화하고 기존 부채를 저금리 정책자금으로 전환하는 전략을 검토하시길 권장합니다.`;
  } else if (debtRatio <= 120) {
    debtGrade = 'C'; debtScore = 50;
    debtComment = '부채비율 120% 이하 주의 필요';
    debtDetail = `총 부채 ${debtBillion}억원, 부채비율 ${debtRatioStr}로 주의가 필요한 수준입니다. 일부 정책자금에서 부채비율 제한으로 신청이 제한될 수 있습니다. 기존 고금리 사적 대출을 저금리 정책자금으로 전환하거나, 매출 증대를 통해 부채비율을 낮추는 것이 우선 과제입니다. 재무구조 개선 계획을 수립하고 전문 컨설팅을 받아보시길 권장합니다.`;
  } else if (debtRatio <= 200) {
    debtGrade = 'D'; debtScore = 30;
    debtComment = '부채비율 200% 이하 위험 수준';
    debtDetail = `총 부채 ${debtBillion}억원, 부채비율 ${debtRatioStr}로 재무적 위험이 높은 상태입니다. 신규 대출 심사에서 부결 가능성이 높으며, 정책자금 이용도 제한적입니다. 최우선으로 기존 고금리 부채 정리와 매출 확대에 집중하시고, 소상공인 재기지원 프로그램이나 채무조정 제도 활용을 검토하시길 권장합니다. 전문 재무 상담을 통해 부채 감축 로드맵을 수립하시길 강력히 권고드립니다.`;
  } else {
    debtGrade = 'E'; debtScore = 10;
    debtComment = '부채비율 200% 초과 매우 위험';
    debtDetail = `총 부채 ${debtBillion}억원, 부채비율 ${debtRatioStr}로 매우 심각한 재무 위기 상태입니다. 일반적인 정책자금 이용이 사실상 불가능하며, 즉각적인 재무구조 개선이 필요합니다. 소상공인시장진흥공단의 경영 위기 기업 특별 지원 프로그램, 신용회복위원회 채무조정 제도, 중소기업 재기지원 센터 등을 통한 전문 지원을 즉시 받으시길 강력히 권고드립니다.`;
  }

  // ── 직원수 분석 ──
  let empGrade = 'E'; let empScore = 0; let empComment = ''; let empDetail = '';
  if (emp >= 20) {
    empGrade = 'S'; empScore = 100;
    empComment = '20명 이상 중소기업 규모';
    empDetail = `직원 ${emp}명으로 소상공인을 넘어 소기업·중소기업 규모에 해당합니다. 이 규모는 중소기업 전용 정책자금 이용이 가능하며, 고용 창출 실적을 인정받아 일자리 연계형 정책자금에서 추가 우대를 받을 수 있습니다. 고용보험·4대보험 가입 직원 수를 정확히 관리하면 자금 신청 시 유리하게 작용합니다.`;
  } else if (emp >= 10) {
    empGrade = 'A'; empScore = 85;
    empComment = '10명 이상 성장형 소기업';
    empDetail = `직원 ${emp}명으로 성장 단계의 소기업입니다. 소상공인 전용 자금부터 소기업 전용 자금까지 폭넓게 이용할 수 있으며, 고용 유지 및 신규 채용 시 정책자금 우대 요건을 충족할 가능성이 높습니다. 직원 증가 추세를 유지하면 향후 중소기업 정책자금으로 확대 이용할 수 있습니다.`;
  } else if (emp >= 5) {
    empGrade = 'B'; empScore = 70;
    empComment = '5명 이상 소규모 기업';
    empDetail = `직원 ${emp}명으로 안정적인 소규모 기업 운영 중입니다. 소상공인 정책자금의 대부분을 이용할 수 있으며, 직원 수 기준 소상공인 요건(업종별 5~10명 이하)을 충족하여 소진공 자금 이용에 유리합니다. 추가 고용 계획이 있다면 일자리 연계 정책자금을 함께 검토하시길 권장합니다.`;
  } else if (emp >= 3) {
    empGrade = 'C'; empScore = 50;
    empComment = '3명 이상 영세 기업';
    empDetail = `직원 ${emp}명으로 소규모 운영 중입니다. 소상공인 기준을 충족하여 주요 정책자금 이용이 가능합니다. 다만 일부 자금에서 최소 고용인 수를 요구하는 경우가 있으므로, 신청 전 각 자금별 고용 요건을 반드시 확인하시길 권장합니다.`;
  } else if (emp >= 1) {
    empGrade = 'D'; empScore = 35;
    empComment = '1-2명 소규모 창업 수준';
    empDetail = `직원 ${emp}명으로 소규모 창업 단계입니다. 소상공인 자격 요건은 충족하나, 대규모 정책자금보다는 창업 초기 전용 자금이나 1인 창업 지원 프로그램에 집중하시길 권장합니다. 직원 채용 시 정부 지원 고용장려금 프로그램을 함께 활용하면 인건비 부담을 줄이면서 자금 이용 범위를 넓힐 수 있습니다.`;
  } else {
    empGrade = 'E'; empScore = 20;
    empComment = '직원 없음 (대표자 단독)';
    empDetail = `현재 대표자 1인 운영 중입니다. 소상공인 요건은 충족하나, 일부 자금에서 고용 인원을 평가 기준으로 활용합니다. 1인 창업·프리랜서 전용 지원 프로그램, 소진공 소액창업자금 등을 우선 검토하시고, 사업 성장에 따른 단계적 고용 계획을 수립하시길 권장합니다.`;
  }

  // ── 업력 분석 ──
  let ageGrade = 'E'; let ageScore = 0; let ageComment = ''; let ageDetail = '';
  if (yrs >= 10) {
    ageGrade = 'S'; ageScore = 100;
    ageComment = '10년 이상 검증된 안정 기업';
    ageDetail = `업력 ${yrs}년으로 장기간 사업을 유지해 온 검증된 기업입니다. 이 수준의 업력은 금융기관에서 사업 안정성 최우수로 평가하며, 장기 저금리 시설자금 및 운전자금 이용에 가장 유리한 위치입니다. 그동안 축적된 거래 실적, 납세 실적, 고용 유지 실적이 정책자금 심사에서 강력한 가점 요소로 작용합니다.`;
  } else if (yrs >= 7) {
    ageGrade = 'A'; ageScore = 85;
    ageComment = '7년 이상 성숙기 진입 기업';
    ageDetail = `업력 ${yrs}년으로 사업이 성숙기에 진입한 안정적인 기업입니다. 대부분의 정책자금에서 업력 기준을 충족하며, 장기 운영 실적이 금융기관의 신뢰도를 높여줍니다. 재도약·확장을 위한 시설자금이나 기술개발 자금 이용을 적극 검토하시길 권장합니다.`;
  } else if (yrs >= 5) {
    ageGrade = 'B'; ageScore = 70;
    ageComment = '5년 이상 안정화 기업';
    ageDetail = `업력 ${yrs}년으로 초기 위험을 극복하고 사업이 안정화된 단계입니다. 업력 5년 이상 기업은 대부분의 정책자금에서 신뢰도 우대를 받으며, 특히 중진공 재도약 지원자금이나 신시장진출 자금 등 안정 기업 대상 자금 이용에 유리합니다.`;
  } else if (yrs >= 3) {
    ageGrade = 'C'; ageScore = 55;
    ageComment = '3년 이상 성장 중인 기업';
    ageDetail = `업력 ${yrs}년으로 창업 초기를 벗어나 성장 단계에 있습니다. 창업 초기 자금(업력 3년 이내)과 일반 운전·시설자금 모두 이용 가능한 과도기입니다. 업력 5년을 목표로 사업 기록을 철저히 관리하고, 매출·신용·고용 실적을 꾸준히 쌓아가시길 권장합니다.`;
  } else if (yrs >= 1) {
    ageGrade = 'D'; ageScore = 35;
    ageComment = '1-2년 초기 창업 기업';
    ageDetail = `업력 ${yrs}년으로 창업 초기 단계입니다. 이 시기에는 청년창업사관학교, 중진공 청년창업 지원금, 소진공 창업 패키지 등 창업 전용 자금을 집중적으로 활용하시길 권장합니다. 사업자등록 이후의 모든 매출·세금 신고 실적을 철저히 관리하고, 신용도 관리를 최우선으로 하시길 권장합니다.`;
  } else {
    ageGrade = 'E'; ageScore = 15;
    ageComment = '1년 미만 신생 기업';
    ageDetail = `업력이 1년 미만인 신생 기업으로, 대부분의 정책자금에서 업력 요건으로 인해 이용이 제한됩니다. 창업 초기 단계에서는 정부 지원 창업 교육 프로그램, 창업진흥원의 초기 창업 패키지, 지자체 창업지원금 등 비대출성 지원 프로그램을 우선 활용하시고, 사업 안정화 이후 대출형 정책자금으로 단계적으로 전환하시길 권장합니다.`;
  }

  // ── 신용 분석 ──
  const avgCredit = kcb > 0 && nice > 0 ? Math.round((kcb + nice) / 2) : Math.max(kcb, nice);
  let creditGrade = 'E'; let creditScore = 0; let creditComment = ''; let creditDetail = '';
  if (avgCredit >= 900) {
    creditGrade = 'S'; creditScore = 100;
    creditComment = '신용점수 900점 이상 최우수';
    creditDetail = `KCB ${kcb > 0 ? kcb + '점' : '-'}, NICE ${nice > 0 ? nice + '점' : '-'}으로 평균 ${avgCredit}점의 최우수 신용등급입니다. 이 수준에서는 보증기관의 보증료 우대, 대출금리 최저구간 적용, 최대 한도 지원 등 모든 면에서 우대를 받을 수 있습니다. 현재의 신용 관리 상태를 계속 유지하시면 향후 자금 이용에도 지속적으로 유리합니다.`;
  } else if (avgCredit >= 800) {
    creditGrade = 'A'; creditScore = 85;
    creditComment = '신용점수 800점 이상 우수';
    creditDetail = `KCB ${kcb > 0 ? kcb + '점' : '-'}, NICE ${nice > 0 ? nice + '점' : '-'}으로 평균 ${avgCredit}점의 우수한 신용등급입니다. 신용보증기금·기술보증기금 보증서 발급이 원활하게 진행될 것으로 예상되며, 대부분의 정책자금에서 우대 금리 적용이 가능합니다. 신용카드 연체 없이 현재 신용도를 유지하시면 900점대 진입도 가능합니다.`;
  } else if (avgCredit >= 700) {
    creditGrade = 'B'; creditScore = 70;
    creditComment = '신용점수 700점 이상 양호';
    creditDetail = `KCB ${kcb > 0 ? kcb + '점' : '-'}, NICE ${nice > 0 ? nice + '점' : '-'}으로 평균 ${avgCredit}점으로 양호한 수준입니다. 주요 정책자금 이용은 가능하나, 일부 고한도 자금에서는 신용점수 기준(750점 또는 800점 이상)으로 인해 제한이 있을 수 있습니다. 체납 세금 납부, 연체 정리, 불필요한 대출 정리 등을 통해 신용점수를 단계적으로 향상시키시길 권장합니다.`;
  } else if (avgCredit >= 600) {
    creditGrade = 'C'; creditScore = 50;
    creditComment = '신용점수 600점 이상 보통';
    creditDetail = `KCB ${kcb > 0 ? kcb + '점' : '-'}, NICE ${nice > 0 ? nice + '점' : '-'}으로 평균 ${avgCredit}점으로 보통 수준입니다. 신용점수로 인해 이용 가능한 정책자금이 제한될 수 있습니다. 소진공 취약소상공인 전용 자금처럼 신용점수 요건이 낮은 자금을 우선 검토하고, 신용점수 향상을 위한 체계적인 관리 계획을 수립하시길 권장합니다.`;
  } else {
    creditGrade = 'D'; creditScore = 30;
    creditComment = '신용점수 600점 미만 개선 필요';
    creditDetail = `KCB ${kcb > 0 ? kcb + '점' : '-'}, NICE ${nice > 0 ? nice + '점' : '-'}으로 평균 ${avgCredit}점으로 신용도 개선이 시급합니다. 대부분의 정책자금에서 신용점수 미달로 거절될 가능성이 높습니다. 먼저 신용회복위원회, 서민금융진흥원 등을 통한 신용도 회복 지원을 받으시고, 체납 세금 납부 및 연체 대출 정리를 최우선으로 추진하시길 강력히 권고드립니다.`;
  }

  const overallScore = Math.round((revScore * 0.30 + debtScore * 0.25 + creditScore * 0.20 + empScore * 0.10 + ageScore * 0.15));
  let overallGrade = 'D';
  if (overallScore >= 85) overallGrade = 'S';
  else if (overallScore >= 70) overallGrade = 'A';
  else if (overallScore >= 55) overallGrade = 'B';
  else if (overallScore >= 40) overallGrade = 'C';
  else overallGrade = 'D';

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const suggestions: string[] = [];
  const riskAnalysis: string[] = [];

  // 강점 분석
  if (revScore >= 70) strengths.push(`연매출 ${revBillion}억원으로 정책자금 신청 매출 기준 충족`);
  if (debtScore >= 70) strengths.push(`부채비율 ${debtRatioStr}로 추가 차입 여력 충분`);
  if (ageScore >= 55) strengths.push(`업력 ${yrs}년으로 사업 안정성 및 신뢰도 인정`);
  if (tech) strengths.push('기술력 보유 — 기술보증기금 등 최대 10억원 한도 자금 이용 가능');
  if (creditScore >= 70) strengths.push(`신용점수 ${avgCredit}점으로 보증기관 보증서 발급에 유리`);
  if (emp >= 5) strengths.push(`직원 ${emp}명으로 고용 안정성 우수, 일자리 연계 자금 우대 가능`);

  // 약점 분석
  if (revScore < 55) weaknesses.push(`매출 ${revBillion}억원 — 정책자금 심사 시 한도 제한 가능성`);
  if (debtScore < 55) { weaknesses.push(`부채비율 ${debtRatioStr} — 재무구조 부담으로 심사 불리`); }
  if (creditScore < 55) weaknesses.push(`신용점수 ${avgCredit}점 — 일부 자금 신청 자격 제한`);
  if (!tech) weaknesses.push('기술력 미보유 — 기술보증기금 이용 불가, 접근 가능한 자금 범위 축소');
  if (emp < 3) weaknesses.push(`직원 ${emp}명 — 고용 규모 소규모로 일부 자금에서 평가 불리`);
  if (ageScore < 35) weaknesses.push(`업력 ${yrs}년 — 대부분의 일반 자금에서 업력 기준 미달 가능성`);

  // 리스크 분석
  if (debtRatio > 120) riskAnalysis.push(`⚠️ 고부채비율 리스크: 부채비율 ${debtRatioStr}는 상환 불능 위험 신호입니다. 신규 부채 발생 전 반드시 전문 컨설팅을 받으시길 권장합니다.`);
  if (debtRatio > 80 && revScore < 55) riskAnalysis.push('⚠️ 매출-부채 불균형: 낮은 매출 대비 높은 부채는 자금난으로 이어질 수 있습니다. 매출 확대 또는 부채 감축이 시급합니다.');
  if (creditScore < 55) riskAnalysis.push(`⚠️ 신용위험: 신용점수 ${avgCredit}점은 신규 대출 승인에 심각한 장애 요인입니다. 즉각적인 신용도 개선 조치가 필요합니다.`);
  if (yrs < 1) riskAnalysis.push('⚠️ 창업 초기 위험: 사업 생존율이 낮은 창업 1년 이내 구간입니다. 무리한 부채보다 비대출성 정부 지원을 우선 활용하세요.');
  if (riskAnalysis.length === 0) riskAnalysis.push('✅ 현재 주요 재무 위험 요소가 없는 안정적인 상태입니다.');

  // 개선 제안
  if (debtScore < 70) suggestions.push('🔑 고금리 사적 대출(2금융권, 카드론 등)을 저금리 정책자금으로 전환하면 이자 부담이 크게 줄어듭니다.');
  if (creditScore < 70) suggestions.push('🔑 신용점수 향상을 위해 소액 정기적금 개설, 통신비·공과금 자동이체 등록, 카드 연체 즉시 해소를 실천하세요.');
  if (!tech) suggestions.push('🔑 이노비즈 인증, 메인비즈 인증, 벤처기업 확인 취득 시 기술보증기금·중진공 기술 연계 자금 이용 가능 범위가 크게 확대됩니다.');
  if (ageScore < 55) suggestions.push(`🔑 업력 ${yrs}년에 맞는 창업 초기 전용 자금(청년창업, 소진공 창업 패키지)을 우선 신청하세요.`);
  if (revScore < 55) suggestions.push('🔑 매출액을 꾸준히 쌓고 세금 신고를 정확히 하면 향후 정책자금 심사에서 한도가 크게 늘어납니다.');
  if (emp < 5) suggestions.push('🔑 고용노동부 일자리 창출 지원사업과 연계하면 인건비 보조를 받으면서 직원을 늘릴 수 있습니다.');
  suggestions.push('🔑 소상공인진흥공단 경영지원 컨설팅(무료)을 통해 업종별 맞춤 자금 전략을 수립하시길 권장합니다.');

  const summary = `연매출 ${revBillion}억원, 부채비율 ${debtRatioStr}, 업력 ${yrs}년, 직원 ${emp}명, 신용점수 ${avgCredit}점 기준 종합 분석 결과 ${overallGrade}등급(${overallScore}점) 기업입니다.`;

  const executiveSummary = `본 보고서는 ${reportDate} 기준으로 작성된 AI 기업집중분석 결과입니다.\n\n대상 기업은 연매출 ${revBillion}억원, 총 부채 ${debtBillion}억원(부채비율 ${debtRatioStr}), 업력 ${yrs}년, 임직원 ${emp}명, KCB 신용점수 ${kcb > 0 ? kcb + '점' : '미입력'}, NICE 신용점수 ${nice > 0 ? nice + '점' : '미입력'}, 기술력 ${tech ? '보유' : '미보유'} 기준으로 분석되었습니다.\n\n5개 핵심 지표(매출 30%, 부채비율 25%, 신용도 20%, 업력 15%, 직원수 10%) 종합 평가 결과 ${overallGrade}등급 ${overallScore}점으로 산정되었습니다. ${overallScore >= 70 ? '현재 정책자금 활용 가능성이 높으며, 전략적 자금 운용을 통해 사업 성장을 가속화할 수 있습니다.' : overallScore >= 50 ? '조건에 따라 일부 정책자금 이용이 가능하며, 재무구조 개선을 병행하면 이용 가능한 자금이 크게 늘어납니다.' : '현재 재무 상황 개선이 우선 과제이며, 비대출성 정부 지원 프로그램부터 단계적으로 활용하시길 권장합니다.'}`;

  const fundingStrategy = overallScore >= 70
    ? `현재 재무 상태가 양호하여 다음 순서로 정책자금 활용을 권장합니다.\n\n① 단기(1~3개월): 소진공 운전자금 또는 중진공 혁신창업자금 신청 — 빠른 실행으로 즉시 유동성 확보\n② 중기(3~6개월): ${tech ? '기술보증기금 기술사업화 자금 — 최대 5억원 한도 보증' : '신용보증기금 보증서 발급 후 정책자금 추가 확보'}\n③ 장기(6개월~): 사업 확장에 따른 시설자금 또는 수출지원 자금 검토\n\n정책자금 신청 전 반드시 소상공인진흥공단 또는 중소기업진흥공단 상담을 통해 최적 자금을 확정하시길 권장합니다.`
    : overallScore >= 50
    ? `조건부 자금 이용이 가능한 상황으로, 다음 전략을 권장합니다.\n\n① 즉시 실행: ${debtScore < 55 ? '고금리 부채 정리를 통한 부채비율 개선 (저금리 정책자금으로 전환)' : '소진공 취약소상공인 전용 저금리 자금 신청'}\n② 단기 개선: ${creditScore < 55 ? '신용점수 향상 — 연체 정리, 소액 적금 개설, 공과금 자동이체' : '매출 증빙 강화 — 세금계산서 발급, 카드 매출 관리'}\n③ 중기 목표: 종합 신용등급 B 이상 달성 후 주요 정책자금 적극 신청\n\n현재 상황에서 가장 먼저 신청 가능한 자금은 소진공 소상공인 정책자금이며, 담당 지역 센터 방문 상담을 권장합니다.`
    : `현재 재무 상황에서는 단계적 개선이 최우선입니다.\n\n① 즉각 조치: 신용회복위원회 또는 서민금융진흥원을 통한 채무조정 및 신용 회복 지원 활용\n② 3개월 내: 체납 세금 분할 납부 시작, 연체 대출 정리 계획 수립\n③ 6개월 내: 소액 매출 증빙 확보 및 신용점수 600점대 진입 목표\n④ 1년 후: 기초 재무 안정화 후 소진공 소상공인 자금 신청 도전\n\n무리한 신규 차입보다 재무구조 안정화가 장기적으로 더 많은 자금을 활용할 수 있는 길입니다.`;

  return {
    revenueLevel: { grade: revGrade, comment: revComment, score: revScore, detail: revDetail },
    debtLevel: { grade: debtGrade, comment: debtComment, score: debtScore, ratio: debtRatio === 999 ? 0 : debtRatio, detail: debtDetail },
    employeeLevel: { grade: empGrade, comment: empComment, score: empScore, detail: empDetail },
    businessAgeLevel: { grade: ageGrade, comment: ageComment, score: ageScore, detail: ageDetail },
    creditLevel: { grade: creditGrade, comment: creditComment, score: creditScore, detail: creditDetail },
    overallScore,
    overallGrade,
    summary,
    executiveSummary,
    strengths,
    weaknesses,
    suggestions,
    riskAnalysis,
    fundingStrategy,
    reportDate,
  };
}

// 기존 호환용
export function recommendPolicyFunds(client: ClientData, sohoGrade: string): PolicyFund[] {
  return evaluatePolicyFunds(client)
    .filter(f => f.eligible)
    .map(({ name, category, max_amount, interest_rate, requirements }) => ({
      name, category, max_amount, interest_rate, requirements
    }));
}

export function performAIDiagnosis(client: ClientData): DiagnosisResult {
  const sohoGrade = calculateSOHOGrade(client);
  const allFunds = evaluatePolicyFunds(client);
  // eligible(조건 충족)한 자금만 추천 — 조건 미충족 자금은 제외
  const recommendedFunds = allFunds.filter(f => f.eligible);
  const maxLoanLimit = calculateMaxLoanLimit(client, sohoGrade);

  const niceScore = client.niceScore || client.nice_score || 0;
  const kcbScore = client.kcbScore || client.kcb_score || 0;
  const annualRevenue = client.annualRevenue || client.annual_revenue || 0;
  const totalDebt = client.totalDebt || client.total_debt || client.debt || 0;
  const hasTechnology = client.hasTechnology ?? client.has_technology ?? false;
  const businessYears = client.businessYears ?? client.business_years ?? 0;

  let details = `SOHO 등급: ${sohoGrade}등급\n\n분석 결과:\n`;
  details += `- 신용점수: KCB ${kcbScore}점, NICE ${niceScore}점\n`;
  details += `- 사업 연차: ${businessYears}년\n`;
  details += `- 연매출액: ${annualRevenue.toLocaleString()}원\n`;
  details += `- 총부채: ${totalDebt.toLocaleString()}원\n`;
  details += `- 기술력 보유: ${hasTechnology ? '예' : '아니오'}\n\n`;
  details += `💰 최대 대출 가능 한도: ${maxLoanLimit.toLocaleString()}원\n\n`;
  const eligible = allFunds.filter(f => f.eligible);
  details += `추천 정책자금: ${eligible.length}개\n`;
  details += eligible.map((f, i) => `${i + 1}. ${f.name} (${f.category}, 최대 ${f.max_amount.toLocaleString()}원)`).join('\n');

  return { sohoGrade, recommendedFunds, maxLoanLimit, details };
}
