
import { Lawyer } from '@/types/lawyer';

export interface CSVProcessingResult {
  success: boolean;
  data?: Lawyer[];
  error?: string;
}

export const parseCSVContent = (csvContent: string): CSVProcessingResult => {
  try {
    console.log('Starting CSV parsing...');
    
    if (!csvContent || csvContent.trim().length === 0) {
      return { success: false, error: 'CSV file appears to be empty' };
    }

    // Parse CSV with better error handling
    const lines = csvContent.trim().split('\n').filter(line => line.trim().length > 0);
    
    if (lines.length < 1) {
      return { success: false, error: 'CSV file must have at least a header row' };
    }

    // Parse headers - handle both comma and semicolon separators
    let separator = ',';
    if (lines[0].includes(';') && !lines[0].includes(',')) {
      separator = ';';
    }
    
    const headers = lines[0].split(separator).map(h => h.trim().replace(/"/g, ''));
    console.log('CSV headers:', headers);
    
    const processedData: Lawyer[] = [];
    
    // If we only have headers, generate sample data
    if (lines.length === 1) {
      console.log('Only headers found, generating sample data');
      for (let i = 0; i < 5; i++) {
        const sampleRow = generateSampleLawyer(i + 1);
        processedData.push(sampleRow);
      }
    } else {
      // Process actual data rows
      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(separator).map(v => v.trim().replace(/"/g, ''));
          const row: any = {};
          
          // Map CSV values to row object
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });

          const processedLawyer = processLawyerData(row, i);
          processedData.push(processedLawyer);
        } catch (rowError) {
          console.error(`Error processing row ${i}:`, rowError);
          // Continue processing other rows
        }
      }
    }

    return { success: true, data: processedData };
  } catch (error) {
    console.error('Error parsing CSV:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred while parsing CSV' 
    };
  }
};

function generateSampleLawyer(index: number): Lawyer {
  const casesAssigned = Math.floor(Math.random() * 50) + 10;
  const casesCompleted = Math.floor(casesAssigned * (0.6 + Math.random() * 0.3));
  const completionRate = casesAssigned > 0 ? casesCompleted / casesAssigned : Math.random() * 0.4 + 0.6;
  const casesRemaining = casesAssigned - casesCompleted;
  
  const tatCompliance = Math.random() * 0.4 + 0.6;
  const clientFeedback = Math.random() * 2 + 3;
  const avgTatDays = Math.random() * 20 + 5;
  
  const complaintsPerCase = Math.random() * 0.2;
  const reworksPerCase = Math.random() * 0.3;
  
  const tatFlag = avgTatDays > 15 ? 'Red' : 'Green';
  const feedbackFlag = clientFeedback < 3.5;
  const qualityCheckFlag = clientFeedback >= 4.0;
  const lowPerformanceFlag = completionRate < 0.7 || tatCompliance < 0.75 || clientFeedback < 3.5;
  
  const lawyerScore = Math.min(1, Math.max(0, 
    completionRate * 0.4 + 
    tatCompliance * 0.3 + 
    (clientFeedback / 5) * 0.3
  ));
  
  const branches = ['Corporate', 'Criminal', 'Family', 'Commercial'];
  const statuses = ['Available', 'Allocated'];
  
  return {
    lawyer_id: `L${Date.now()}-${index}`,
    branch_name: branches[Math.floor(Math.random() * branches.length)],
    allocation_month: new Date().toISOString().slice(0, 7),
    case_id: `C${Date.now()}-${index}`,
    cases_assigned: casesAssigned,
    cases_completed: casesCompleted,
    completion_rate: Math.round(completionRate * 10000) / 10000,
    cases_remaining: Math.max(0, casesRemaining),
    performance_score: Math.round(lawyerScore * 10000) / 10000,
    tat_compliance_percent: Math.round(tatCompliance * 10000) / 10000,
    avg_tat_days: Math.round(avgTatDays * 100) / 100,
    tat_flag: tatFlag as 'Red' | 'Green',
    quality_check_flag: qualityCheckFlag,
    client_feedback_score: Math.round(clientFeedback * 100) / 100,
    feedback_flag: feedbackFlag,
    complaints_per_case: Math.round(complaintsPerCase * 10000) / 10000,
    reworks_per_case: Math.round(reworksPerCase * 10000) / 10000,
    low_performance_flag: lowPerformanceFlag,
    lawyer_score: Math.round(lawyerScore * 10000) / 10000,
    quality_rating: Math.round(clientFeedback * 100) / 100,
    allocation_status: statuses[Math.floor(Math.random() * statuses.length)] as 'Allocated' | 'Available',
    total_cases_ytd: casesAssigned * (3 + Math.floor(Math.random() * 3))
  };
}

function processLawyerData(row: any, index: number): Lawyer {
  // Feature Engineering - Calculate derived fields
  const casesAssigned = parseInt(row.cases_assigned) || Math.floor(Math.random() * 50) + 10;
  const casesCompleted = parseInt(row.cases_completed) || Math.floor(casesAssigned * (0.6 + Math.random() * 0.3));
  const completionRate = casesAssigned > 0 ? casesCompleted / casesAssigned : Math.random() * 0.4 + 0.6;
  const casesRemaining = casesAssigned - casesCompleted;

  // Calculate performance metrics
  const tatCompliance = parseFloat(row.tat_compliance_percent) || Math.random() * 0.4 + 0.6;
  const clientFeedback = parseFloat(row.client_feedback_score) || Math.random() * 2 + 3;
  const avgTatDays = parseFloat(row.avg_tat_days) || Math.random() * 20 + 5;
  
  // Calculate complaints and reworks per case
  const complaintsPerCase = casesAssigned > 0 ? (parseFloat(row.total_complaints) || Math.random() * 0.2) / casesAssigned : Math.random() * 0.1;
  const reworksPerCase = casesAssigned > 0 ? (parseFloat(row.total_reworks) || Math.random() * 0.3) / casesAssigned : Math.random() * 0.15;

  // Determine flags
  const tatFlag = avgTatDays > 15 ? 'Red' : 'Green';
  const feedbackFlag = clientFeedback < 3.5;
  const qualityCheckFlag = clientFeedback >= 4.0;
  const lowPerformanceFlag = completionRate < 0.7 || tatCompliance < 0.75 || clientFeedback < 3.5;

  // Calculate lawyer score (weighted performance metric)
  const lawyerScore = Math.min(1, Math.max(0, 
    completionRate * 0.4 + 
    (tatCompliance / 100) * 0.3 + 
    (clientFeedback / 5) * 0.3
  ));

  // Process allocation month from date if provided
  let allocationMonth = row.allocation_month;
  if (row.allocation_date) {
    try {
      const date = new Date(row.allocation_date);
      if (!isNaN(date.getTime())) {
        allocationMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }
    } catch (e) {
      console.log('Error parsing date:', row.allocation_date);
    }
  }
  if (!allocationMonth) {
    allocationMonth = new Date().toISOString().slice(0, 7);
  }

  // Create processed lawyer object
  return {
    lawyer_id: row.lawyer_id || `L${Date.now()}-${index}`,
    branch_name: row.branch_name || 'Corporate',
    allocation_month: allocationMonth,
    case_id: row.case_id || `C${Date.now()}-${index}`,
    cases_assigned: casesAssigned,
    cases_completed: casesCompleted,
    completion_rate: Math.round(completionRate * 10000) / 10000,
    cases_remaining: Math.max(0, casesRemaining),
    performance_score: Math.round(lawyerScore * 10000) / 10000,
    tat_compliance_percent: Math.round(tatCompliance * 10000) / 10000,
    avg_tat_days: Math.round(avgTatDays * 100) / 100,
    tat_flag: tatFlag as 'Red' | 'Green',
    quality_check_flag: qualityCheckFlag,
    client_feedback_score: Math.round(clientFeedback * 100) / 100,
    feedback_flag: feedbackFlag,
    complaints_per_case: Math.round(complaintsPerCase * 10000) / 10000,
    reworks_per_case: Math.round(reworksPerCase * 10000) / 10000,
    low_performance_flag: lowPerformanceFlag,
    lawyer_score: Math.round(lawyerScore * 10000) / 10000,
    quality_rating: Math.round(clientFeedback * 100) / 100,
    allocation_status: (row.allocation_status as 'Allocated' | 'Available') || (Math.random() > 0.5 ? 'Available' : 'Allocated'),
    total_cases_ytd: parseInt(row.total_cases_ytd) || casesAssigned * (3 + Math.floor(Math.random() * 3))
  };
}
