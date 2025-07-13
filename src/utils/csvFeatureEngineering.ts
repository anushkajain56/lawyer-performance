
import { RawLawyerRow, parseNumber } from './csvParser';

export interface ProcessedRow {
  lawyer_id: string;
  lawyer_name: string;
  expertise_domains: string;
  branch_name: string;
  allocation_month: string;
  allocation_date: Date | null;
  case_id: number;
  cases_assigned: number;
  cases_completed: number;
  completion_rate: number;
  cases_remaining: number;
  tat_compliance_percent: number;
  avg_tat_days: number;
  avg_client_feedback_score: number;
  complaints_per_case: number;
  reworks_per_case: number;
  lawyer_score: number;
  allocation_status: string;
  total_cases_ytd: number;
  allocation_status_encoded: number;
  allocation_month_num: number;
  // Legacy fields for compatibility
  tat_flag: string;
  tat_bucket: string;
  quality_flags: number;
  quality_check_flag: string;
  client_feedback_score: number;
  feedback_flag: string;
  rework_count: number;
  complaint_count: number;
  max_capacity: number;
  blacklist_status: number;
  quality_rating: string;
  tat_flag_encoded: number;
  feedback_flag_encoded: number;
  quality_check_flag_encoded: number;
  low_performance_flag: number;
}

export function processRowWithFeatureEngineering(row: RawLawyerRow): ProcessedRow {
  // Extract basic fields with multiple possible names - simplified for new CSV structure
  const casesAssigned = parseNumber(row.cases_assigned || row.Cases_Assigned || row['Cases Assigned']) || 0;
  const casesCompleted = parseNumber(row.cases_completed || row.Cases_Completed || row['Cases Completed']) || 0;
  const completionRate = parseNumber(row.completion_rate || row.Completion_Rate || row['Completion Rate']) || 0;
  const casesRemaining = parseNumber(row.cases_remaining || row.Cases_Remaining || row['Cases Remaining']) || 0;
  const complaintsPerCase = parseNumber(row.complaints_per_case || row.Complaints_Per_Case || row['Complaints Per Case']) || 0;
  const reworksPerCase = parseNumber(row.reworks_per_case || row.Reworks_Per_Case || row['Reworks Per Case']) || 0;
  const lawyerScore = parseNumber(row.lawyer_score || row.Lawyer_Score || row['Lawyer Score']) || 0;
  const totalCasesYtd = parseNumber(row.total_cases_ytd || row.Total_Cases_YTD || row['Total Cases YTD']) || 0;
  
  // Extract and normalize TAT compliance percent with proper bounds checking
  const rawTatCompliance = parseNumber(row.tat_compliance_percent || row.TAT_Compliance_Percent || row['TAT Compliance Percent']) || 0;
  let tatCompliancePercent = rawTatCompliance;
  
  if (rawTatCompliance > 100) {
    console.log(`Warning: TAT compliance ${rawTatCompliance}% seems unusually high, capping at 100%`);
    tatCompliancePercent = 100;
  } else if (rawTatCompliance > 1 && rawTatCompliance <= 100) {
    tatCompliancePercent = rawTatCompliance;
  } else if (rawTatCompliance >= 0 && rawTatCompliance <= 1) {
    tatCompliancePercent = rawTatCompliance * 100;
  } else {
    console.log(`Warning: Invalid TAT compliance value ${rawTatCompliance}, defaulting to 0%`);
    tatCompliancePercent = 0;
  }
  tatCompliancePercent = Math.max(0, Math.min(100, tatCompliancePercent));
  
  // Encoding categorical variables
  const allocationStatus = (row.allocation_status || row.Allocation_Status || row['Allocation Status'] || 'Available').toString();
  const statusMapping: { [key: string]: number } = {
    'Available': 0, 'Allocated': 1, 'Pending': 2, 'Busy': 3, 'On Leave': 4
  };
  const allocationStatusEncoded = statusMapping[allocationStatus] || 0;
  
  // Date processing
  let allocationDate: Date | null = null;
  let allocationMonthNum = 1;
  
  const dateStr = row.allocation_date || row.Allocation_Date || row['Allocation Date'];
  if (dateStr) {
    try {
      allocationDate = new Date(dateStr.toString());
      if (!isNaN(allocationDate.getTime())) {
        allocationMonthNum = allocationDate.getMonth() + 1;
      } else {
        allocationDate = null;
      }
    } catch (e) {
      console.log('Error parsing allocation_date:', dateStr);
    }
  }

  // Extract lawyer name and domains with comprehensive field matching
  const lawyerName = extractFieldValue(row, [
    'lawyer_name', 'Lawyer_Name', 'Lawyer Name', 'name', 'Name', 
    'LawyerName', 'lawyer', 'Lawyer', 'attorney_name', 'Attorney_Name'
  ]) || `Lawyer_${Math.random().toString(36).substr(2, 9)}`;

  const expertiseDomains = extractFieldValue(row, [
    'expertise_domains', 'Expertise_Domains', 'Expertise Domains',
    'expertise_domain', 'Expertise_Domain', 'Expertise Domain',
    'domain', 'Domain', 'specialization', 'Specialization',
    'practice_area', 'Practice_Area', 'Practice Area',
    'area_of_expertise', 'Area_of_Expertise', 'Area of Expertise',
    'legal_domain', 'Legal_Domain', 'Legal Domain',
    'practice_areas', 'Practice_Areas', 'Practice Areas',
    'specialty', 'Specialty', 'field', 'Field', 'area', 'Area'
  ]) || ['Corporate Law', 'Criminal Law', 'Family Law', 'Commercial Law', 'Civil Law', 'Tax Law'][Math.floor(Math.random() * 6)];

  return {
    lawyer_id: (row.lawyer_id || row.Lawyer_ID || row['Lawyer ID'] || `L${Date.now()}-${Math.random()}`).toString(),
    lawyer_name: lawyerName.toString(),
    expertise_domains: expertiseDomains.toString(),
    branch_name: (row.branch_name || row.Branch_Name || row['Branch Name'] || 'Corporate').toString(),
    allocation_month: (row.allocation_month || row.Allocation_Month || row['Allocation Month'] || new Date().toISOString().slice(0, 7)).toString(),
    allocation_date: allocationDate,
    case_id: parseNumber(row.case_id || row.Case_ID || row['Case ID']) || 1,
    cases_assigned: casesAssigned,
    cases_completed: casesCompleted,
    completion_rate: completionRate,
    cases_remaining: casesRemaining,
    tat_compliance_percent: tatCompliancePercent,
    avg_tat_days: parseNumber(row.avg_tat_days || row.Avg_TAT_Days || row['Avg TAT Days']) || 0,
    avg_client_feedback_score: parseNumber(row.avg_client_feedback_score || row.Avg_Client_Feedback_Score || row['Avg Client Feedback Score']) || 4.0,
    complaints_per_case: complaintsPerCase,
    reworks_per_case: reworksPerCase,
    lawyer_score: lawyerScore,
    allocation_status: allocationStatus,
    total_cases_ytd: totalCasesYtd,
    allocation_status_encoded: allocationStatusEncoded,
    allocation_month_num: allocationMonthNum,
    // Legacy fields for compatibility
    tat_flag: tatCompliancePercent >= 80 ? 'Green' : 'Red',
    tat_bucket: 'Normal',
    quality_flags: 0,
    quality_check_flag: 'Pass',
    client_feedback_score: parseNumber(row.avg_client_feedback_score || row.Avg_Client_Feedback_Score || row['Avg Client Feedback Score']) || 4.0,
    feedback_flag: 'Positive',
    rework_count: Math.round(reworksPerCase * casesAssigned),
    complaint_count: Math.round(complaintsPerCase * casesAssigned),
    max_capacity: 50,
    blacklist_status: 0,
    quality_rating: 'Good',
    tat_flag_encoded: tatCompliancePercent >= 80 ? 0 : 1,
    feedback_flag_encoded: 1,
    quality_check_flag_encoded: 1,
    low_performance_flag: (completionRate < 0.5 || tatCompliancePercent < 70 || complaintsPerCase > 0.2) ? 1 : 0
  };
}

function extractFieldValue(row: RawLawyerRow, fieldNames: string[]): string | undefined {
  for (const fieldName of fieldNames) {
    const value = row[fieldName];
    if (value && value.toString().trim() !== '') {
      return value.toString().trim();
    }
  }
  return undefined;
}
