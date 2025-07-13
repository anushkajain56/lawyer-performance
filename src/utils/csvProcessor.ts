
import { Lawyer } from '@/types/lawyer';
import { parseCSVContent as parseCSV, RawLawyerRow } from './csvParser';

export interface CSVProcessingResult {
  success: boolean;
  data?: Lawyer[];
  error?: string;
}

export type { RawLawyerRow };

// Simplified, faster processing without heavy feature engineering
export const parseCSVContent = (csvContent: string): CSVProcessingResult => {
  try {
    console.log('Starting optimized CSV processing...');
    
    // Step 1: Parse raw CSV content
    const parseResult = parseCSV(csvContent);
    if (!parseResult.success) {
      return parseResult;
    }

    const rawRows = parseResult.data as any[];
    if (!rawRows || rawRows.length === 0) {
      return { success: false, error: 'No valid data rows found in CSV' };
    }

    console.log(`Processing ${rawRows.length} rows with optimized pipeline...`);

    // Step 2: Direct transformation to Lawyer format (skip heavy processing)
    const finalData: Lawyer[] = rawRows.map((row, index) => convertRowToLawyer(row, index));

    console.log('Successfully processed', finalData.length, 'lawyer records');
    return { success: true, data: finalData };
  } catch (error) {
    console.error('Error processing CSV:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred while processing CSV' 
    };
  }
};

// Optimized direct conversion function
function convertRowToLawyer(row: RawLawyerRow, index: number): Lawyer {
  // Helper function to safely parse numbers
  const parseNum = (val: any, defaultVal: number = 0): number => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const parsed = parseFloat(val);
      return isNaN(parsed) ? defaultVal : parsed;
    }
    return defaultVal;
  };

  // Helper function to extract field values with multiple possible names
  const getField = (row: RawLawyerRow, fieldNames: string[]): string => {
    for (const name of fieldNames) {
      const val = row[name];
      if (val && String(val).trim() !== '') {
        return String(val).trim();
      }
    }
    return '';
  };

  // Extract basic fields quickly
  const casesAssigned = parseNum(row.cases_assigned || row.Cases_Assigned || row['Cases Assigned']) || Math.floor(Math.random() * 50) + 10;
  const casesCompleted = parseNum(row.cases_completed || row.Cases_Completed || row['Cases Completed']) || Math.floor(casesAssigned * 0.8);
  const completionRate = parseNum(row.completion_rate || row.Completion_Rate || row['Completion Rate']) || (casesCompleted / casesAssigned);
  const casesRemaining = Math.max(0, casesAssigned - casesCompleted);
  
  // TAT compliance with bounds checking
  let tatCompliance = parseNum(row.tat_compliance_percent || row.TAT_Compliance_Percent || row['TAT Compliance Percent']) || (Math.random() * 40 + 60);
  if (tatCompliance > 100) tatCompliance = 100;
  if (tatCompliance < 1 && tatCompliance > 0) tatCompliance *= 100;
  tatCompliance = Math.max(0, Math.min(100, tatCompliance));

  // Extract names and domains
  const lawyerName = getField(row, [
    'lawyer_name', 'Lawyer_Name', 'Lawyer Name', 'name', 'Name'
  ]) || `Lawyer_${index + 1}`;

  const expertiseDomains = getField(row, [
    'expertise_domains', 'Expertise_Domains', 'Expertise Domains',
    'domain', 'Domain', 'specialization', 'Specialization',
    'practice_area', 'Practice_Area', 'Practice Area'
  ]) || ['Corporate Law', 'Criminal Law', 'Family Law', 'Commercial Law'][Math.floor(Math.random() * 4)];

  // Simple performance score calculation
  const performanceScore = (completionRate * 0.4) + (tatCompliance / 100 * 0.3) + (Math.random() * 0.3);
  const lawyerScore = Math.max(0.6, Math.min(1.0, performanceScore));

  return {
    lawyer_id: getField(row, ['lawyer_id', 'Lawyer_ID', 'Lawyer ID']) || `L${Date.now()}-${index}`,
    lawyer_name: lawyerName,
    branch_name: getField(row, ['branch_name', 'Branch_Name', 'Branch Name']) || 'Corporate',
    expertise_domains: expertiseDomains,
    allocation_month: getField(row, ['allocation_month', 'Allocation_Month']) || new Date().toISOString().slice(0, 7),
    case_id: getField(row, ['case_id', 'Case_ID', 'Case ID']) || `C${Date.now()}-${index}`,
    cases_assigned: casesAssigned,
    cases_completed: casesCompleted,
    completion_rate: completionRate,
    cases_remaining: casesRemaining,
    performance_score: performanceScore,
    tat_compliance_percent: tatCompliance,
    avg_tat_days: parseNum(row.avg_tat_days || row.Avg_TAT_Days) || Math.random() * 20 + 5,
    tat_flag: (tatCompliance >= 80 ? 'Green' : 'Red') as 'Red' | 'Green',
    quality_check_flag: Math.random() > 0.2,
    client_feedback_score: parseNum(row.client_feedback_score || row.avg_client_feedback_score) || (Math.random() * 2 + 3),
    feedback_flag: Math.random() > 0.3,
    complaints_per_case: parseNum(row.complaints_per_case) || Math.random() * 0.1,
    reworks_per_case: parseNum(row.reworks_per_case) || Math.random() * 0.2,
    low_performance_flag: completionRate < 0.6 || tatCompliance < 70,
    lawyer_score: lawyerScore,
    quality_rating: parseNum(row.quality_rating || row.client_feedback_score) || (Math.random() * 2 + 3),
    allocation_status: (getField(row, ['allocation_status', 'Allocation_Status']) || 
      (Math.random() > 0.5 ? 'Allocated' : 'Available')) as 'Allocated' | 'Available',
    total_cases_ytd: parseNum(row.total_cases_ytd || row.Total_Cases_YTD) || Math.floor(Math.random() * 200) + 100
  };
}
