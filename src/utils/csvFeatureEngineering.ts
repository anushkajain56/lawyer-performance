import { RawLawyerRow, parseNumber } from './csvParser';

export interface ProcessedRow {
  lawyer_id: string;
  lawyer_name: string;
  expertise_domains: string;
  branch_id: string;
  branch_name: string;
  allocation_month: string;
  allocation_date: Date | null;
  case_id: number;
  cases_assigned: number;
  cases_completed: number;
  avg_tat_days: number;
  tat_compliance_percent: number;
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
  total_cases_ytd: number;
  quality_rating: string;
  allocation_status: string;
  completion_rate: number;
  cases_remaining: number;
  complaints_per_case: number;
  reworks_per_case: number;
  tat_flag_encoded: number;
  feedback_flag_encoded: number;
  quality_check_flag_encoded: number;
  allocation_status_encoded: number;
  allocation_month_num: number;
  low_performance_flag: number;
}

export function processRowWithFeatureEngineering(row: RawLawyerRow): ProcessedRow {
  // Debug: Log the actual field names in the CSV row
  console.log('CSV Row field names:', Object.keys(row));
  console.log('Sample row data:', row);
  
  // Extract basic fields with multiple possible names
  const casesAssigned = parseNumber(row.cases_assigned || row.Cases_Assigned || row['Cases Assigned']) || 0;
  const casesCompleted = parseNumber(row.cases_completed || row.Cases_Completed || row['Cases Completed']) || 0;
  const complaintCount = parseNumber(row.complaint_count || row.Complaint_Count || row['Complaint Count']) || 0;
  const reworkCount = parseNumber(row.rework_count || row.Rework_Count || row['Rework Count']) || 0;
  const tatCompliancePercent = parseNumber(row.tat_compliance_percent || row.TAT_Compliance_Percent || row['TAT Compliance Percent']) || 0;
  
  // Pandas-style feature engineering
  const completionRate = casesAssigned > 0 ? casesCompleted / casesAssigned : 0;
  const casesRemaining = casesAssigned - casesCompleted;
  const complaintsPerCase = casesAssigned > 0 ? complaintCount / casesAssigned : 0;
  const reworksPerCase = casesAssigned > 0 ? reworkCount / casesAssigned : 0;
  
  // Encoding categorical variables
  const tatFlag = (row.tat_flag || row.TAT_Flag || row['TAT Flag'] || 'Green').toString();
  const tatFlagEncoded = tatFlag === 'Red' ? 1 : 0;
  
  const feedbackFlag = (row.feedback_flag || row.Feedback_Flag || row['Feedback Flag'] || 'Positive').toString();
  const feedbackFlagEncoded = feedbackFlag === 'Positive' ? 1 : 0;
  
  const qualityCheckFlag = (row.quality_check_flag || row.Quality_Check_Flag || row['Quality Check Flag'] || 'Pass').toString();
  const qualityCheckFlagEncoded = qualityCheckFlag === 'Pass' ? 1 : 0;
  
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
  
  // Low performance flag calculation
  const lowPerformanceFlag = (
    completionRate < 0.5 ||
    tatCompliancePercent < 70 ||
    complaintsPerCase > 0.2
  ) ? 1 : 0;

  // Extract lawyer name - try multiple field variations
  const lawyerName = extractFieldValue(row, [
    'lawyer_name', 'Lawyer_Name', 'Lawyer Name', 'name', 'Name', 
    'LawyerName', 'lawyer', 'Lawyer', 'attorney_name', 'Attorney_Name'
  ]) || `Lawyer_${Math.random().toString(36).substr(2, 9)}`;

  // Extract expertise domains - try multiple field variations  
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
    branch_id: (row.branch_id || row.Branch_ID || row['Branch ID'] || 'B001').toString(),
    branch_name: (row.branch_name || row.Branch_Name || row['Branch Name'] || 'Corporate').toString(),
    allocation_month: (row.allocation_month || row.Allocation_Month || row['Allocation Month'] || new Date().toISOString().slice(0, 7)).toString(),
    allocation_date: allocationDate,
    case_id: parseNumber(row.case_id || row.Case_ID || row['Case ID']) || 1,
    cases_assigned: casesAssigned,
    cases_completed: casesCompleted,
    avg_tat_days: parseNumber(row.avg_tat_days || row.Avg_TAT_Days || row['Avg TAT Days']) || 0,
    tat_compliance_percent: tatCompliancePercent,
    tat_flag: tatFlag,
    tat_bucket: (row.tat_bucket || row.TAT_Bucket || row['TAT Bucket'] || 'Normal').toString(),
    quality_flags: parseNumber(row.quality_flags || row.Quality_Flags || row['Quality Flags']) || 0,
    quality_check_flag: qualityCheckFlag,
    client_feedback_score: parseNumber(row.client_feedback_score || row.Client_Feedback_Score || row['Client Feedback Score']) || 4.0,
    feedback_flag: feedbackFlag,
    rework_count: reworkCount,
    complaint_count: complaintCount,
    max_capacity: parseNumber(row.max_capacity || row.Max_Capacity || row['Max Capacity']) || 50,
    blacklist_status: parseNumber(row.blacklist_status || row.Blacklist_Status || row['Blacklist Status']) || 0,
    total_cases_ytd: parseNumber(row.total_cases_ytd || row.Total_Cases_YTD || row['Total Cases YTD']) || casesAssigned,
    quality_rating: (row.quality_rating || row.Quality_Rating || row['Quality Rating'] || 'Good').toString(),
    allocation_status: allocationStatus,
    completion_rate: completionRate,
    cases_remaining: casesRemaining,
    complaints_per_case: complaintsPerCase,
    reworks_per_case: reworksPerCase,
    tat_flag_encoded: tatFlagEncoded,
    feedback_flag_encoded: feedbackFlagEncoded,
    quality_check_flag_encoded: qualityCheckFlagEncoded,
    allocation_status_encoded: allocationStatusEncoded,
    allocation_month_num: allocationMonthNum,
    low_performance_flag: lowPerformanceFlag
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