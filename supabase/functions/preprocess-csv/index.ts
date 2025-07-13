import { serve } from "https://deno.land/std@0.224.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface RawLawyerRow {
  [key: string]: string | number;
}

interface ProcessedRow {
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

// Updated XGBoost model feature importance weights
const XGBOOST_FEATURE_WEIGHTS = {
  completion_rate: 0.612067,
  tat_compliance_percent: 0.184235,
  avg_tat_days: 0.166585,
  reworks_per_case: 0.015159,
  complaints_per_case: 0.010657,
  cases_remaining: 0.004215,
  total_cases_ytd: 0.003676,
  allocation_status_encoded: 0.003408
}

// Simple CSV parser that handles quoted fields with commas
function parseCSV(csvContent: string): string[][] {
  const lines = csvContent.trim().split('\n')
  const result: string[][] = []
  
  for (const line of lines) {
    if (!line.trim()) continue
    
    const row: string[] = []
    let current = ''
    let inQuotes = false
    let i = 0
    
    // Detect separator
    const separator = line.includes(';') && !line.includes(',') ? ';' : ','
    
    while (i < line.length) {
      const char = line[i]
      const nextChar = line[i + 1]
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"'
          i += 2
        } else {
          // Toggle quote state
          inQuotes = !inQuotes
          i++
        }
      } else if (char === separator && !inQuotes) {
        // Field separator
        row.push(current.trim())
        current = ''
        i++
      } else {
        current += char
        i++
      }
    }
    
    // Add the last field
    row.push(current.trim())
    result.push(row)
  }
  
  return result
}

function calculateLawyerScore(processedRow: ProcessedRow): number {
  const normalizedFeatures = {
    completion_rate: processedRow.completion_rate,
    tat_compliance_percent: Math.min(processedRow.tat_compliance_percent / 100, 1),
    avg_tat_days: Math.max(0, 1 - (processedRow.avg_tat_days / 30)),
    reworks_per_case: Math.min(processedRow.reworks_per_case, 1),
    complaints_per_case: Math.min(processedRow.complaints_per_case, 1),
    cases_remaining: Math.max(0, 1 - (processedRow.cases_remaining / 100)),
    total_cases_ytd: Math.min(processedRow.total_cases_ytd / 500, 1),
    allocation_status_encoded: processedRow.allocation_status_encoded / 4
  }

  let weightedScore = 0
  let totalWeight = 0

  Object.entries(XGBOOST_FEATURE_WEIGHTS).forEach(([feature, weight]) => {
    const featureValue = normalizedFeatures[feature as keyof typeof normalizedFeatures]
    weightedScore += featureValue * weight
    totalWeight += weight
  })

  return totalWeight > 0 ? Math.max(0, Math.min(1, weightedScore / totalWeight)) : 0
}

serve(async (req) => {
  console.log('Edge Function called with simplified CSV processing')
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }), 
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Processing CSV file with simplified feature set...')

    let file: File;
    let csvContent: string;

    try {
      const formData = await req.formData()
      const uploadedFile = formData.get('file')
      
      if (!uploadedFile) {
        return new Response(
          JSON.stringify({ error: 'No file uploaded' }), 
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      file = uploadedFile as File
      console.log('File received:', file.name, 'Size:', file.size)
      csvContent = await file.text()
      
    } catch (parseError) {
      console.error('Error parsing form data:', parseError)
      return new Response(
        JSON.stringify({ error: 'Failed to read uploaded file' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    if (!csvContent || csvContent.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'CSV file appears to be empty' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Use custom CSV parser that handles quoted fields correctly
    let parsedData: string[][];
    try {
      parsedData = parseCSV(csvContent);
    } catch (csvError) {
      console.error('CSV parsing error:', csvError)
      return new Response(
        JSON.stringify({ error: 'Invalid CSV format' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (parsedData.length === 0) {
      return new Response(
        JSON.stringify({ error: 'CSV file must have at least a header row' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const headers = parsedData[0].map(h => h.trim())
    console.log('Headers found:', headers)
    
    const rawRows: RawLawyerRow[] = []
    
    if (parsedData.length === 1) {
      console.log('Only headers found, generating sample data')
      for (let i = 0; i < 10; i++) {
        const sampleRow = generateSampleRawRow(i + 1)
        rawRows.push(sampleRow)
      }
    } else {
      // Process data rows with proper CSV parsing
      for (let i = 1; i < parsedData.length; i++) {
        const values = parsedData[i]
        const row: RawLawyerRow = {}
        
        headers.forEach((header, index) => {
          row[header] = values[index] || ''
        })

        rawRows.push(row)
        
        if (i <= 3) {
          console.log(`Row ${i} expertise_domains raw:`, row.expertise_domains || row.Expertise_Domains || row['Expertise Domains'])
        }
      }
    }

    // Step 1: Simplified Feature Engineering
    const processedRows: ProcessedRow[] = rawRows.map(row => processRowWithFeatureEngineering(row))
    
    // Step 2: Group by lawyer_id and aggregate
    const aggregatedData = aggregateByLawyerId(processedRows)
    
    // Step 3: Convert to final format
    const finalData = aggregatedData.map(convertToFinalFormat)

    console.log('Successfully processed', finalData.length, 'records with simplified feature set')

    return new Response(
      JSON.stringify(finalData),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in Edge Function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})

function processRowWithFeatureEngineering(row: RawLawyerRow): ProcessedRow {
  // Extract basic fields - simplified for new CSV structure
  const casesAssigned = parseNumber(row.cases_assigned || row.Cases_Assigned || row['Cases Assigned']) || 0
  const casesCompleted = parseNumber(row.cases_completed || row.Cases_Completed || row['Cases Completed']) || 0
  const completionRate = parseNumber(row.completion_rate || row.Completion_Rate || row['Completion Rate']) || 0
  const casesRemaining = parseNumber(row.cases_remaining || row.Cases_Remaining || row['Cases Remaining']) || 0
  const complaintsPerCase = parseNumber(row.complaints_per_case || row.Complaints_Per_Case || row['Complaints Per Case']) || 0
  const reworksPerCase = parseNumber(row.reworks_per_case || row.Reworks_Per_Case || row['Reworks Per Case']) || 0
  const lawyerScore = parseNumber(row.lawyer_score || row.Lawyer_Score || row['Lawyer Score']) || 0
  const totalCasesYtd = parseNumber(row.total_cases_ytd || row.Total_Cases_YTD || row['Total Cases YTD']) || 0
  
  // Extract and normalize TAT compliance percent with proper bounds checking
  const rawTatCompliance = parseNumber(row.tat_compliance_percent || row.TAT_Compliance_Percent || row['TAT Compliance Percent']) || 0
  let tatCompliancePercent = rawTatCompliance
  
  if (rawTatCompliance > 100) {
    console.log(`Warning: TAT compliance ${rawTatCompliance}% seems unusually high, capping at 100%`)
    tatCompliancePercent = 100
  } else if (rawTatCompliance > 1 && rawTatCompliance <= 100) {
    tatCompliancePercent = rawTatCompliance
  } else if (rawTatCompliance >= 0 && rawTatCompliance <= 1) {
    tatCompliancePercent = rawTatCompliance * 100
  } else {
    console.log(`Warning: Invalid TAT compliance value ${rawTatCompliance}, defaulting to 0%`)
    tatCompliancePercent = 0
  }
  tatCompliancePercent = Math.max(0, Math.min(100, tatCompliancePercent))
  
  // Categorical encoding
  const allocationStatus = (row.allocation_status || row.Allocation_Status || row['Allocation Status'] || 'Available').toString()
  const statusMapping: { [key: string]: number } = {
    'Available': 0, 'Allocated': 1, 'Pending': 2, 'Busy': 3, 'On Leave': 4
  }
  const allocationStatusEncoded = statusMapping[allocationStatus] || 0
  
  // Date processing
  let allocationDate: Date | null = null
  let allocationMonthNum = 1
  
  const dateStr = row.allocation_date || row.Allocation_Date || row['Allocation Date']
  if (dateStr) {
    try {
      allocationDate = new Date(dateStr.toString())
      if (!isNaN(allocationDate.getTime())) {
        allocationMonthNum = allocationDate.getMonth() + 1
      } else {
        allocationDate = null
      }
    } catch (e) {
      console.log('Error parsing allocation_date:', dateStr)
    }
  }

  // Extract lawyer name and domains with comprehensive field matching
  const lawyerName = (
    row.lawyer_name || 
    row.Lawyer_Name || 
    row['Lawyer Name'] || 
    row.name || 
    row.Name ||
    row.LawyerName ||
    `Lawyer_${Math.random().toString(36).substr(2, 9)}`
  ).toString()

  const expertiseDomains = (
    row.expertise_domains || 
    row.Expertise_Domains || 
    row['Expertise Domains'] ||
    row.domain || 
    row.Domain || 
    row.specialization || 
    row.Specialization ||
    row.practice_area || 
    row.Practice_Area || 
    row['Practice Area'] ||
    row.expertise ||
    row.Expertise ||
    row.field ||
    row.Field ||
    row.area ||
    row.Area ||
    ['Corporate Law', 'Criminal Law', 'Family Law', 'Commercial Law', 'Civil Law', 'Tax Law'][Math.floor(Math.random() * 6)]
  ).toString()

  return {
    lawyer_id: (row.lawyer_id || row.Lawyer_ID || row['Lawyer ID'] || `L${Date.now()}-${Math.random()}`).toString(),
    lawyer_name: lawyerName,
    expertise_domains: expertiseDomains,
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
  }
}

function aggregateByLawyerId(processedRows: ProcessedRow[]): ProcessedRow[] {
  const groupedData: { [key: string]: ProcessedRow[] } = {}
  
  processedRows.forEach(row => {
    if (!groupedData[row.lawyer_id]) {
      groupedData[row.lawyer_id] = []
    }
    groupedData[row.lawyer_id].push(row)
  })

  const aggregated: ProcessedRow[] = []
  
  Object.keys(groupedData).forEach(lawyerId => {
    const rows = groupedData[lawyerId]
    
    // Pandas-style aggregation rules
    const aggregatedRow: ProcessedRow = {
      lawyer_id: lawyerId,
      lawyer_name: rows[0].lawyer_name, // first
      expertise_domains: [...new Set(rows.map(r => r.expertise_domains.trim()).filter(Boolean))].sort().join(', '), // unique domains
      branch_name: rows[0].branch_name, // first
      allocation_month: rows[0].allocation_month, // first
      allocation_date: getMaxDate(rows.map(r => r.allocation_date)), // max
      case_id: rows.length, // count
      cases_assigned: sum(rows.map(r => r.cases_assigned)), // sum
      cases_completed: sum(rows.map(r => r.cases_completed)), // sum
      completion_rate: mean(rows.map(r => r.completion_rate)), // mean
      cases_remaining: sum(rows.map(r => r.cases_remaining)), // sum
      tat_compliance_percent: mean(rows.map(r => r.tat_compliance_percent)), // mean
      avg_tat_days: mean(rows.map(r => r.avg_tat_days)), // mean
      avg_client_feedback_score: mean(rows.map(r => r.avg_client_feedback_score)), // mean
      complaints_per_case: mean(rows.map(r => r.complaints_per_case)), // mean
      reworks_per_case: mean(rows.map(r => r.reworks_per_case)), // mean
      lawyer_score: mean(rows.map(r => r.lawyer_score)), // mean
      allocation_status: getMode(rows.map(r => r.allocation_status)), // mode
      total_cases_ytd: Math.round(mean(rows.map(r => r.total_cases_ytd))), // mean -> int
      allocation_status_encoded: Math.round(mean(rows.map(r => r.allocation_status_encoded))), // mean -> int
      allocation_month_num: rows[0].allocation_month_num, // first
      tat_flag: getMode(rows.map(r => r.tat_flag)),
      tat_bucket: getMode(rows.map(r => r.tat_bucket)),
      quality_flags: sum(rows.map(r => r.quality_flags)),
      quality_check_flag: getMode(rows.map(r => r.quality_check_flag)),
      client_feedback_score: mean(rows.map(r => r.client_feedback_score)),
      feedback_flag: getMode(rows.map(r => r.feedback_flag)),
      rework_count: sum(rows.map(r => r.rework_count)),
      complaint_count: sum(rows.map(r => r.complaint_count)),
      max_capacity: rows[0].max_capacity,
      blacklist_status: Math.max(...rows.map(r => r.blacklist_status)),
      quality_rating: getMode(rows.map(r => r.quality_rating)),
      tat_flag_encoded: Math.round(mean(rows.map(r => r.tat_flag_encoded))),
      feedback_flag_encoded: Math.round(mean(rows.map(r => r.feedback_flag_encoded))),
      quality_check_flag_encoded: Math.round(mean(rows.map(r => r.quality_check_flag_encoded))),
      low_performance_flag: Math.max(...rows.map(r => r.low_performance_flag))
    }
    
    aggregated.push(aggregatedRow)
  })

  return aggregated
}

function convertToFinalFormat(processedRow: ProcessedRow) {
  const lawyerScore = calculateLawyerScore(processedRow)
  
  return {
    lawyer_id: processedRow.lawyer_id,
    lawyer_name: processedRow.lawyer_name,
    branch_name: processedRow.branch_name,
    expertise_domains: processedRow.expertise_domains, // Preserve full expertise domains string
    allocation_month: processedRow.allocation_month,
    case_id: processedRow.case_id.toString(),
    cases_assigned: processedRow.cases_assigned,
    cases_completed: processedRow.cases_completed,
    completion_rate: Math.round(processedRow.completion_rate * 10000) / 10000,
    cases_remaining: Math.max(0, processedRow.cases_remaining),
    performance_score: lawyerScore,
    tat_compliance_percent: Math.round(processedRow.tat_compliance_percent * 100) / 100,
    avg_tat_days: Math.round(processedRow.avg_tat_days * 100) / 100,
    tat_flag: processedRow.tat_flag,
    quality_check_flag: processedRow.quality_check_flag === 'Pass',
    client_feedback_score: Math.round(processedRow.client_feedback_score * 100) / 100,
    feedback_flag: processedRow.feedback_flag === 'Positive',
    complaints_per_case: Math.round(processedRow.complaints_per_case * 10000) / 10000,
    reworks_per_case: Math.round(processedRow.reworks_per_case * 10000) / 10000,
    low_performance_flag: processedRow.low_performance_flag === 1,
    lawyer_score: lawyerScore,
    quality_rating: Math.round(processedRow.client_feedback_score * 100) / 100,
    allocation_status: processedRow.allocation_status,
    total_cases_ytd: processedRow.total_cases_ytd
  }
}

function generateSampleRawRow(index: number): RawLawyerRow {
  const domains = ['Corporate Law', 'Criminal Law', 'Family Law', 'Commercial Law', 'Civil Law', 'Tax Law']
  const names = [
    'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sunita Singh', 'Vikram Gupta',
    'Meera Joshi', 'Ravi Agarwal', 'Kavya Reddy', 'Suresh Nair', 'Anita Verma'
  ]
  
  return {
    lawyer_id: `L${Date.now()}-${index}`,
    lawyer_name: names[index % names.length],
    expertise_domains: domains[index % domains.length],
    branch_name: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai'][index % 4],
    allocation_month: new Date().toISOString().slice(0, 7),
    allocation_date: new Date().toISOString().split('T')[0],
    case_id: `C${Date.now()}-${index}`,
    cases_assigned: Math.floor(Math.random() * 50) + 10,
    cases_completed: Math.floor(Math.random() * 40) + 5,
    completion_rate: Math.random(),
    cases_remaining: Math.floor(Math.random() * 15),
    tat_compliance_percent: Math.random() * 40 + 60,
    avg_tat_days: Math.random() * 20 + 5,
    avg_client_feedback_score: Math.random() * 2 + 3,
    complaints_per_case: Math.random() * 0.1,
    reworks_per_case: Math.random() * 0.2,
    lawyer_score: Math.random() * 0.4 + 0.6,
    allocation_status: Math.random() > 0.5 ? 'Allocated' : 'Available',
    total_cases_ytd: Math.floor(Math.random() * 200) + 100
  }
}

function parseNumber(value: any): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    return isNaN(parsed) ? 0 : parsed
  }
  return 0
}

function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0)
}

function mean(values: number[]): number {
  return values.length > 0 ? sum(values) / values.length : 0
}

function getMode<T>(values: T[]): T {
  const frequency: { [key: string]: number } = {}
  values.forEach(val => {
    const key = String(val)
    frequency[key] = (frequency[key] || 0) + 1
  })
  
  let maxFreq = 0
  let mode = values[0]
  
  Object.keys(frequency).forEach(key => {
    if (frequency[key] > maxFreq) {
      maxFreq = frequency[key]
      mode = values.find(v => String(v) === key) || values[0]
    }
  })
  
  return mode
}

function getMaxDate(dates: (Date | null)[]): Date | null {
  const validDates = dates.filter(d => d !== null) as Date[]
  if (validDates.length === 0) return null
  
  return validDates.reduce((max, current) => {
    return current > max ? current : max
  })
}
