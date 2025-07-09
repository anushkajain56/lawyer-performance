import { Lawyer } from '@/types/lawyer';
import { ProcessedRow } from './csvFeatureEngineering';
import { calculateLawyerScore } from './csvScoring';

export function convertToLawyerFormat(processedRow: ProcessedRow): Lawyer {
  const lawyerScore = calculateLawyerScore(processedRow);
  
  return {
    lawyer_id: processedRow.lawyer_id,
    lawyer_name: processedRow.lawyer_name, // Use the actual lawyer name from CSV
    branch_name: processedRow.branch_name,
    expertise_domains: processedRow.expertise_domains, // Use expertise_domains properly
    allocation_month: processedRow.allocation_month,
    case_id: processedRow.case_id.toString(),
    cases_assigned: processedRow.cases_assigned,
    cases_completed: processedRow.cases_completed,
    completion_rate: Math.round(processedRow.completion_rate * 10000) / 10000,
    cases_remaining: Math.max(0, processedRow.cases_remaining),
    performance_score: lawyerScore,
    tat_compliance_percent: Math.round(processedRow.tat_compliance_percent * 100) / 100,
    avg_tat_days: Math.round(processedRow.avg_tat_days * 100) / 100,
    tat_flag: processedRow.tat_flag as 'Red' | 'Green',
    quality_check_flag: processedRow.quality_check_flag === 'Pass',
    client_feedback_score: Math.round(processedRow.client_feedback_score * 100) / 100,
    feedback_flag: processedRow.feedback_flag === 'Positive',
    complaints_per_case: Math.round(processedRow.complaints_per_case * 10000) / 10000,
    reworks_per_case: Math.round(processedRow.reworks_per_case * 10000) / 10000,
    low_performance_flag: processedRow.low_performance_flag === 1,
    lawyer_score: lawyerScore,
    quality_rating: Math.round(processedRow.client_feedback_score * 100) / 100,
    allocation_status: processedRow.allocation_status as 'Allocated' | 'Available' | 'Pending' | 'Completed',
    total_cases_ytd: processedRow.total_cases_ytd
  };
}