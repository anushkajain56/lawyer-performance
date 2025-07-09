import { ProcessedRow } from './csvFeatureEngineering';

export function aggregateByLawyerId(processedRows: ProcessedRow[]): ProcessedRow[] {
  const groupedData: { [key: string]: ProcessedRow[] } = {};
  
  processedRows.forEach(row => {
    if (!groupedData[row.lawyer_id]) {
      groupedData[row.lawyer_id] = [];
    }
    groupedData[row.lawyer_id].push(row);
  });

  const aggregated: ProcessedRow[] = [];
  
  Object.keys(groupedData).forEach(lawyerId => {
    const rows = groupedData[lawyerId];
    
    // Pandas-style aggregation rules
    const aggregatedRow: ProcessedRow = {
      lawyer_id: lawyerId,
      lawyer_name: rows[0].lawyer_name, // first
      expertise_domains: [...new Set(rows.map(r => r.expertise_domains.trim()).filter(Boolean))].sort().join(', '), // unique domains joined
      branch_id: rows[0].branch_id, // first
      branch_name: rows[0].branch_name, // first
      allocation_month: rows[0].allocation_month, // first
      allocation_date: getMaxDate(rows.map(r => r.allocation_date)), // max
      case_id: rows.length, // count
      cases_assigned: sum(rows.map(r => r.cases_assigned)), // sum
      cases_completed: sum(rows.map(r => r.cases_completed)), // sum
      avg_tat_days: mean(rows.map(r => r.avg_tat_days)), // mean
      tat_compliance_percent: mean(rows.map(r => r.tat_compliance_percent)), // mean
      tat_flag: getMode(rows.map(r => r.tat_flag)), // mode
      tat_bucket: getMode(rows.map(r => r.tat_bucket)), // mode
      quality_flags: sum(rows.map(r => r.quality_flags)), // sum
      quality_check_flag: getMode(rows.map(r => r.quality_check_flag)), // mode
      client_feedback_score: mean(rows.map(r => r.client_feedback_score)), // mean
      feedback_flag: getMode(rows.map(r => r.feedback_flag)), // mode
      rework_count: sum(rows.map(r => r.rework_count)), // sum
      complaint_count: sum(rows.map(r => r.complaint_count)), // sum
      max_capacity: rows[0].max_capacity, // first
      blacklist_status: Math.max(...rows.map(r => r.blacklist_status)), // max
      total_cases_ytd: Math.round(mean(rows.map(r => r.total_cases_ytd))), // mean
      quality_rating: getMode(rows.map(r => r.quality_rating)), // mode
      allocation_status: getMode(rows.map(r => r.allocation_status)), // mode
      completion_rate: mean(rows.map(r => r.completion_rate)), // mean
      cases_remaining: sum(rows.map(r => r.cases_remaining)), // sum
      complaints_per_case: mean(rows.map(r => r.complaints_per_case)), // mean
      reworks_per_case: mean(rows.map(r => r.reworks_per_case)), // mean
      tat_flag_encoded: Math.round(mean(rows.map(r => r.tat_flag_encoded))), // mean -> int
      feedback_flag_encoded: Math.round(mean(rows.map(r => r.feedback_flag_encoded))), // mean -> int
      quality_check_flag_encoded: Math.round(mean(rows.map(r => r.quality_check_flag_encoded))), // mean -> int
      allocation_status_encoded: Math.round(mean(rows.map(r => r.allocation_status_encoded))), // mean -> int
      allocation_month_num: rows[0].allocation_month_num, // first
      low_performance_flag: Math.max(...rows.map(r => r.low_performance_flag)) // max
    };
    
    aggregated.push(aggregatedRow);
  });

  return aggregated;
}

export function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

export function mean(values: number[]): number {
  return values.length > 0 ? sum(values) / values.length : 0;
}

export function getMode<T>(values: T[]): T {
  const frequency: { [key: string]: number } = {};
  values.forEach(val => {
    const key = String(val);
    frequency[key] = (frequency[key] || 0) + 1;
  });
  
  let maxFreq = 0;
  let mode = values[0];
  
  Object.keys(frequency).forEach(key => {
    if (frequency[key] > maxFreq) {
      maxFreq = frequency[key];
      mode = values.find(v => String(v) === key) || values[0];
    }
  });
  
  return mode;
}

export function getMaxDate(dates: (Date | null)[]): Date | null {
  const validDates = dates.filter(d => d !== null) as Date[];
  if (validDates.length === 0) return null;
  
  return validDates.reduce((max, current) => {
    return current > max ? current : max;
  });
}