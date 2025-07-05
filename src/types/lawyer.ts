
export interface Lawyer {
  // Basic Info
  lawyer_id: string;
  branch_name: string;
  allocation_month: string;
  case_id: string;
  
  // Performance Metrics
  cases_assigned: number;
  cases_completed: number;
  completion_rate: number;
  cases_remaining: number;
  performance_score: number;
  tat_compliance_percent: number;
  avg_tat_days: number;
  
  // Risk & Quality Indicators
  tat_flag: 'Red' | 'Green';
  quality_check_flag: boolean;
  client_feedback_score: number;
  feedback_flag: boolean;
  complaints_per_case: number;
  reworks_per_case: number;
  low_performance_flag: boolean;
  
  // Summary
  lawyer_score: number;
  quality_rating: number;
  allocation_status: 'Allocated' | 'Available';
  total_cases_ytd: number;
}

export interface FilterState {
  branch_name: string;
  low_performance_flag: boolean;
  searchTerm: string;
}
