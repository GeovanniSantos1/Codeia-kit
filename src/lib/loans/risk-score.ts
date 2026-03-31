export type CreditBureau = "CLEAN" | "RESTRICTED" | "NEGATIVE";
export type EmploymentType = "CLT" | "PUBLIC" | "SELF_EMPLOYED" | "RETIRED" | "UNEMPLOYED";
export type BankType = "LARGE_BANK" | "DIGITAL_BANK" | "NO_BANK";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";

export interface RiskScoreInput {
  creditBureau?: CreditBureau | null;
  employmentType?: EmploymentType | null;
  monthlyIncome?: number | null;
  dependents?: number | null;
  bankType?: BankType | null;
  totalActiveDebt?: number;
  totalPaidInstallments?: number;
  totalOverdueInstallments?: number;
}

export interface RiskScoreResult {
  score: number;
  level: RiskLevel;
  breakdown: {
    bureau: number;
    employment: number;
    income: number;
    history: number;
    bank: number;
    dependents: number;
  };
}

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  LOW: "Baixo",
  MEDIUM: "Médio",
  HIGH: "Alto",
  VERY_HIGH: "Muito Alto",
};

export const CREDIT_BUREAU_LABELS: Record<CreditBureau, string> = {
  CLEAN: "Limpo",
  RESTRICTED: "Com Restrições",
  NEGATIVE: "Negativado",
};

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  CLT: "CLT (Carteira Assinada)",
  PUBLIC: "Funcionário Público",
  SELF_EMPLOYED: "Autônomo / MEI",
  RETIRED: "Aposentado / Pensionista",
  UNEMPLOYED: "Desempregado",
};

export const BANK_TYPE_LABELS: Record<BankType, string> = {
  LARGE_BANK: "Banco Tradicional (BB, CEF, Itaú, Bradesco...)",
  DIGITAL_BANK: "Banco Digital (Nubank, Inter, C6...)",
  NO_BANK: "Sem Conta Bancária",
};

export function getRiskLevelColor(level: RiskLevel | null | undefined): string {
  switch (level) {
    case "LOW": return "text-green-600 bg-green-50 border-green-200";
    case "MEDIUM": return "text-yellow-700 bg-yellow-50 border-yellow-200";
    case "HIGH": return "text-orange-600 bg-orange-50 border-orange-200";
    case "VERY_HIGH": return "text-red-600 bg-red-50 border-red-200";
    default: return "text-muted-foreground bg-muted border-border";
  }
}

export function getRiskLevelBadgeVariant(
  level: RiskLevel | null | undefined
): "default" | "secondary" | "destructive" | "outline" {
  switch (level) {
    case "LOW": return "secondary";
    case "MEDIUM": return "outline";
    case "HIGH": return "outline";
    case "VERY_HIGH": return "destructive";
    default: return "outline";
  }
}

export function calculateRiskScore(input: RiskScoreInput): RiskScoreResult {
  let bureau = 0;
  let employment = 0;
  let income = 0;
  let history = 0;
  let bank = 0;
  let dependentsScore = 0;

  switch (input.creditBureau) {
    case "CLEAN":      bureau = 30; break;
    case "RESTRICTED": bureau = 10; break;
    case "NEGATIVE":   bureau = 0;  break;
    default:           bureau = 15;
  }

  switch (input.employmentType) {
    case "PUBLIC":       employment = 25; break;
    case "CLT":          employment = 22; break;
    case "RETIRED":      employment = 20; break;
    case "SELF_EMPLOYED":employment = 12; break;
    case "UNEMPLOYED":   employment = 0;  break;
    default:             employment = 10;
  }

  const monthlyIncome = input.monthlyIncome ?? 0;
  const totalDebt = input.totalActiveDebt ?? 0;
  if (monthlyIncome <= 0) {
    income = 5;
  } else {
    const debtToIncomeRatio = totalDebt / monthlyIncome;
    if (debtToIncomeRatio < 1)       income = 20;
    else if (debtToIncomeRatio < 3)  income = 15;
    else if (debtToIncomeRatio < 6)  income = 10;
    else if (debtToIncomeRatio < 12) income = 5;
    else                             income = 0;
  }

  const paid = input.totalPaidInstallments ?? 0;
  const overdue = input.totalOverdueInstallments ?? 0;
  const totalInstallments = paid + overdue;
  if (totalInstallments === 0) {
    history = 10;
  } else {
    const paymentRate = paid / totalInstallments;
    if (paymentRate >= 0.95)      history = 15;
    else if (paymentRate >= 0.85) history = 12;
    else if (paymentRate >= 0.70) history = 8;
    else if (paymentRate >= 0.50) history = 4;
    else                          history = 0;
  }

  switch (input.bankType) {
    case "LARGE_BANK":   bank = 5; break;
    case "DIGITAL_BANK": bank = 3; break;
    case "NO_BANK":      bank = 0; break;
    default:             bank = 2;
  }

  const deps = input.dependents ?? 0;
  if (deps === 0)      dependentsScore = 5;
  else if (deps <= 2)  dependentsScore = 3;
  else if (deps <= 4)  dependentsScore = 1;
  else                 dependentsScore = 0;

  const score = Math.min(100, Math.max(0, bureau + employment + income + history + bank + dependentsScore));

  let level: RiskLevel;
  if (score >= 70)      level = "LOW";
  else if (score >= 50) level = "MEDIUM";
  else if (score >= 30) level = "HIGH";
  else                  level = "VERY_HIGH";

  return {
    score,
    level,
    breakdown: {
      bureau,
      employment,
      income,
      history,
      bank,
      dependents: dependentsScore,
    },
  };
}
