import { ProcessedRow } from './csvFeatureEngineering';

// XGBoost model feature importance weights
export const XGBOOST_FEATURE_WEIGHTS = {
  feedback_flag_encoded: 0.359135,
  quality_check_flag_encoded: 0.211663,
  tat_compliance_percent: 0.138505,
  complaints_per_case: 0.126061,
  avg_tat_days: 0.063968,
  reworks_per_case: 0.063401,
  cases_remaining: 0.013272,
  low_performance_flag: 0.008766,
  completion_rate: 0.006925,
  allocation_status_encoded: 0.004249,
  allocation_month_num: 0.004054,
  tat_flag_encoded: 0.000000
};

export function calculateLawyerScore(processedRow: ProcessedRow): number {
  const normalizedFeatures = {
    feedback_flag_encoded: processedRow.feedback_flag_encoded,
    quality_check_flag_encoded: processedRow.quality_check_flag_encoded,
    tat_compliance_percent: Math.min(processedRow.tat_compliance_percent / 100, 1),
    complaints_per_case: Math.min(processedRow.complaints_per_case, 1),
    avg_tat_days: Math.max(0, 1 - (processedRow.avg_tat_days / 30)),
    reworks_per_case: Math.min(processedRow.reworks_per_case, 1),
    cases_remaining: Math.max(0, 1 - (processedRow.cases_remaining / 100)),
    low_performance_flag: 1 - processedRow.low_performance_flag,
    completion_rate: processedRow.completion_rate,
    allocation_status_encoded: processedRow.allocation_status_encoded / 4,
    allocation_month_num: processedRow.allocation_month_num / 12,
    tat_flag_encoded: 1 - processedRow.tat_flag_encoded
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