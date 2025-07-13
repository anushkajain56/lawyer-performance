
import { ProcessedRow } from './csvFeatureEngineering';

// Updated XGBoost model feature importance weights based on new training data
export const XGBOOST_FEATURE_WEIGHTS = {
  completion_rate: 0.612067,
  tat_compliance_percent: 0.184235,
  avg_tat_days: 0.166585,
  reworks_per_case: 0.015159,
  complaints_per_case: 0.010657,
  cases_remaining: 0.004215,
  total_cases_ytd: 0.003676,
  allocation_status_encoded: 0.003408
};

export function calculateLawyerScore(processedRow: ProcessedRow): number {
  const normalizedFeatures = {
    completion_rate: processedRow.completion_rate,
    tat_compliance_percent: Math.min(processedRow.tat_compliance_percent / 100, 1),
    avg_tat_days: Math.max(0, 1 - (processedRow.avg_tat_days / 30)),
    reworks_per_case: Math.min(processedRow.reworks_per_case, 1),
    complaints_per_case: Math.min(processedRow.complaints_per_case, 1),
    cases_remaining: Math.max(0, 1 - (processedRow.cases_remaining / 100)),
    total_cases_ytd: Math.min(processedRow.total_cases_ytd / 500, 1),
    allocation_status_encoded: processedRow.allocation_status_encoded / 4
  };

  let weightedScore = 0;
  let totalWeight = 0;

  Object.entries(XGBOOST_FEATURE_WEIGHTS).forEach(([feature, weight]) => {
    const featureValue = normalizedFeatures[feature as keyof typeof normalizedFeatures];
    weightedScore += featureValue * weight;
    totalWeight += weight;
  });

  return totalWeight > 0 ? Math.max(0, Math.min(1, weightedScore / totalWeight)) : 0;
}
