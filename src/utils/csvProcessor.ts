
import { Lawyer } from '@/types/lawyer';

export interface CSVProcessingResult {
  success: boolean;
  data?: Lawyer[];
  error?: string;
}

interface RawLawyerRow {
  [key: string]: string | number;
}

interface ProcessedRow {
  lawyer_id: string;
  lawyer_name: string;
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

export const parseCSVContent = (csvContent: string): CSVProcessingResult => {
  try {
    console.log('Starting CSV parsing with Python-equivalent feature engineering...');
    
    if (!csvContent || csvContent.trim().length === 0) {
      return { success: false, error: 'CSV file appears to be empty' };
    }

    const lines = csvContent.trim().split('\n').filter(line => line.trim().length > 0);
    
    if (lines.length < 1) {
      return { success: false, error: 'CSV file must have at least a header row' };
    }

    let separator = ',';
    if (lines[0].includes(';') && !lines[0].includes(',')) {
      separator = ';';
    }
    
    const headers = lines[0].split(separator).map(h => h.trim().replace(/"/g, ''));
    console.log('CSV headers:', headers);
    
    const rawRows: RawLawyerRow[] = [];
    
    if (lines.length === 1) {
      console.log('Only headers found, generating sample data');
      for (let i = 0; i < 10; i++) {
        const sampleRow = generateSampleRawRow(i + 1);
        rawRows.push(sampleRow);
      }
    } else {
      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(separator).map(v => v.trim().replace(/"/g, ''));
          const row: RawLawyerRow = {};
          
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });

          rawRows.push(row);
        } catch (rowError) {
          console.error(`Error processing row ${i}:`, rowError);
        }
      }
    }

    // Step 1: Process each row with feature engineering (like your Python code)
    const processedRows: ProcessedRow[] = rawRows.map(row => processRowWithFeatureEngineering(row));

    // Step 2: Group by lawyer_id and apply aggregation rules (like your Python groupby)
    const aggregatedData = aggregateByLawyerId(processedRows);

    // Step 3: Convert to final Lawyer format
    const finalData: Lawyer[] = aggregatedData.map(convertToLawyerFormat);

    return { success: true, data: finalData };
  } catch (error) {
    console.error('Error parsing CSV:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred while parsing CSV' 
    };
  }
};

function processRowWithFeatureEngineering(row: RawLawyerRow): ProcessedRow {
  // Parse basic values with flexible column name handling
  const casesAssigned = parseNumber(row.cases_assigned || row.Cases_Assigned || row['Cases Assigned']) || 0;
  const casesCompleted = parseNumber(row.cases_completed || row.Cases_Completed || row['Cases Completed']) || 0;
  const complaintCount = parseNumber(row.complaint_count || row.Complaint_Count || row['Complaint Count']) || 0;
  const reworkCount = parseNumber(row.rework_count || row.Rework_Count || row['Rework Count']) || 0;
  const tatCompliancePercent = parseNumber(row.tat_compliance_percent || row.TAT_Compliance_Percent || row['TAT Compliance Percent']) || 0;
  
  // === Feature Engineering (following your Python logic exactly) ===
  
  // Completion rate
  const completionRate = casesAssigned > 0 ? casesCompleted / casesAssigned : 0;
  
  // Cases remaining
  const casesRemaining = casesAssigned - casesCompleted;
  
  // Complaints per case
  const complaintsPerCase = casesAssigned > 0 ? complaintCount / casesAssigned : 0;
  
  // Reworks per case
  const reworksPerCase = casesAssigned > 0 ? reworkCount / casesAssigned : 0;
  
  // TAT flag encoding
  const tatFlag = (row.tat_flag || row.TAT_Flag || row['TAT Flag'] || 'Green').toString();
  const tatFlagEncoded = tatFlag === 'Red' ? 1 : 0;
  
  // Feedback flag encoding
  const feedbackFlag = (row.feedback_flag || row.Feedback_Flag || row['Feedback Flag'] || 'Positive').toString();
  const feedbackFlagEncoded = feedbackFlag === 'Positive' ? 1 : 0;
  
  // Quality check flag encoding
  const qualityCheckFlag = (row.quality_check_flag || row.Quality_Check_Flag || row['Quality Check Flag'] || 'Pass').toString();
  const qualityCheckFlagEncoded = qualityCheckFlag === 'Pass' ? 1 : 0;
  
  // Allocation status encoding
  const allocationStatus = (row.allocation_status || row.Allocation_Status || row['Allocation Status'] || 'Available').toString();
  const statusMapping: { [key: string]: number } = {
    'Available': 0, 'Allocated': 1, 'Pending': 2, 'Busy': 3, 'On Leave': 4
  };
  const allocationStatusEncoded = statusMapping[allocationStatus] || 0;
  
  // Allocation date and month
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
  
  // Low performance flag (following your Python logic exactly)
  const lowPerformanceFlag = (
    completionRate < 0.5 ||
    tatCompliancePercent < 70 ||
    complaintsPerCase > 0.2
  ) ? 1 : 0;

  return {
    lawyer_id: (row.lawyer_id || row.Lawyer_ID || row['Lawyer ID'] || `L${Date.now()}-${Math.random()}`).toString(),
    lawyer_name: (row.lawyer_name || row.Lawyer_Name || row['Lawyer Name'] || 'Unknown').toString(),
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

function aggregateByLawyerId(processedRows: ProcessedRow[]): ProcessedRow[] {
  // Group by lawyer_id (following your Python groupby logic)
  const groupedData: { [key: string]: ProcessedRow[] } = {};
  
  processedRows.forEach(row => {
    if (!groupedData[row.lawyer_id]) {
      groupedData[row.lawyer_id] = [];
    }
    groupedData[row.lawyer_id].push(row);
  });

  // Apply aggregation rules (following your Python agg_rules exactly)
  const aggregated: ProcessedRow[] = [];
  
  Object.keys(groupedData).forEach(lawyerId => {
    const rows = groupedData[lawyerId];
    
    const aggregatedRow: ProcessedRow = {
      lawyer_id: lawyerId,
      lawyer_name: rows[0].lawyer_name, // first
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
      tat_flag_encoded: Math.round(mean(rows.map(r => r.tat_flag_encoded))), // mean
      feedback_flag_encoded: Math.round(mean(rows.map(r => r.feedback_flag_encoded))), // mean
      quality_check_flag_encoded: Math.round(mean(rows.map(r => r.quality_check_flag_encoded))), // mean
      allocation_status_encoded: Math.round(mean(rows.map(r => r.allocation_status_encoded))), // mean
      allocation_month_num: rows[0].allocation_month_num, // first
      low_performance_flag: Math.max(...rows.map(r => r.low_performance_flag)) // max
    };
    
    aggregated.push(aggregatedRow);
  });

  return aggregated;
}

function convertToLawyerFormat(processedRow: ProcessedRow): Lawyer {
  return {
    lawyer_id: processedRow.lawyer_id,
    branch_name: processedRow.branch_name,
    allocation_month: processedRow.allocation_month,
    case_id: processedRow.case_id.toString(),
    cases_assigned: processedRow.cases_assigned,
    cases_completed: processedRow.cases_completed,
    completion_rate: Math.round(processedRow.completion_rate * 10000) / 10000,
    cases_remaining: Math.max(0, processedRow.cases_remaining),
    performance_score: Math.round(processedRow.completion_rate * 10000) / 10000, // Using completion_rate as performance_score
    tat_compliance_percent: Math.round(processedRow.tat_compliance_percent * 100) / 100,
    avg_tat_days: Math.round(processedRow.avg_tat_days * 100) / 100,
    tat_flag: processedRow.tat_flag as 'Red' | 'Green',
    quality_check_flag: processedRow.quality_check_flag === 'Pass',
    client_feedback_score: Math.round(processedRow.client_feedback_score * 100) / 100,
    feedback_flag: processedRow.feedback_flag === 'Positive',
    complaints_per_case: Math.round(processedRow.complaints_per_case * 10000) / 10000,
    reworks_per_case: Math.round(processedRow.reworks_per_case * 10000) / 10000,
    low_performance_flag: processedRow.low_performance_flag === 1,
    lawyer_score: Math.round(processedRow.completion_rate * 10000) / 10000, // Using completion_rate as lawyer_score
    quality_rating: Math.round(processedRow.client_feedback_score * 100) / 100,
    allocation_status: processedRow.allocation_status as 'Allocated' | 'Available',
    total_cases_ytd: processedRow.total_cases_ytd
  };
}

function generateSampleRawRow(index: number): RawLawyerRow {
  return {
    lawyer_id: `L${Date.now()}-${index}`,
    lawyer_name: `Lawyer ${index}`,
    branch_id: `B00${index % 4 + 1}`,
    branch_name: ['Corporate', 'Criminal', 'Family', 'Commercial'][index % 4],
    allocation_month: new Date().toISOString().slice(0, 7),
    allocation_date: new Date().toISOString().split('T')[0],
    case_id: `C${Date.now()}-${index}`,
    cases_assigned: Math.floor(Math.random() * 50) + 10,
    cases_completed: Math.floor(Math.random() * 40) + 5,
    avg_tat_days: Math.random() * 20 + 5,
    tat_compliance_percent: Math.random() * 40 + 60,
    tat_flag: Math.random() > 0.7 ? 'Red' : 'Green',
    tat_bucket: 'Normal',
    quality_flags: Math.floor(Math.random() * 3),
    quality_check_flag: Math.random() > 0.2 ? 'Pass' : 'Fail',
    client_feedback_score: Math.random() * 2 + 3,
    feedback_flag: Math.random() > 0.3 ? 'Positive' : 'Neutral/Negative',
    rework_count: Math.floor(Math.random() * 5),
    complaint_count: Math.floor(Math.random() * 3),
    max_capacity: 50,
    blacklist_status: 0,
    total_cases_ytd: Math.floor(Math.random() * 200) + 100,
    quality_rating: 'Good',
    allocation_status: Math.random() > 0.5 ? 'Allocated' : 'Available'
  };
}

// Utility functions for aggregation
function parseNumber(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

function mean(values: number[]): number {
  return values.length > 0 ? sum(values) / values.length : 0;
}

function getMode<T>(values: T[]): T {
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

function getMaxDate(dates: (Date | null)[]): Date | null {
  const validDates = dates.filter(d => d !== null) as Date[];
  if (validDates.length === 0) return null;
  
  return validDates.reduce((max, current) => {
    return current > max ? current : max;
  });
}
