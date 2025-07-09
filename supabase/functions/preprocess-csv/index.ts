
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  console.log('Edge Function called with method:', req.method)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      console.log('Invalid method:', req.method)
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }), 
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Processing CSV file with Feature Engineering...')

    let file: File;
    let csvContent: string;

    try {
      // Parse form data to get the uploaded file
      const formData = await req.formData()
      const uploadedFile = formData.get('file')
      
      if (!uploadedFile) {
        console.log('No file found in form data')
        return new Response(
          JSON.stringify({ error: 'No file uploaded' }), 
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      file = uploadedFile as File
      console.log('File received:', file.name, 'Size:', file.size, 'Type:', file.type)

      // Read CSV content with error handling
      csvContent = await file.text()
      console.log('CSV content length:', csvContent.length)
      
    } catch (parseError) {
      console.error('Error parsing form data or reading file:', parseError)
      return new Response(
        JSON.stringify({ error: 'Failed to read uploaded file' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    if (!csvContent || csvContent.trim().length === 0) {
      console.log('CSV content is empty')
      return new Response(
        JSON.stringify({ error: 'CSV file appears to be empty' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse CSV with comprehensive error handling
    let lines: string[]
    let headers: string[]
    let separator: string

    try {
      lines = csvContent.trim().split('\n').filter(line => line.trim().length > 0)
      
      if (lines.length < 1) {
        return new Response(
          JSON.stringify({ error: 'CSV file must have at least a header row' }), 
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Parse headers - handle both comma and semicolon separators
      separator = ','
      if (lines[0].includes(';') && !lines[0].includes(',')) {
        separator = ';'
      }
      
      headers = lines[0].split(separator).map(h => h.trim().replace(/["']/g, ''))
      console.log('CSV headers:', headers, 'Separator:', separator, 'Total lines:', lines.length)
      
    } catch (headerError) {
      console.error('Error parsing CSV headers:', headerError)
      return new Response(
        JSON.stringify({ error: 'Failed to parse CSV headers' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    const processedData = []
    
    // If we only have headers, generate sample data
    if (lines.length === 1) {
      console.log('Only headers found, generating sample data')
      for (let i = 0; i < 5; i++) {
        const sampleRow = generateSampleLawyer(i + 1)
        processedData.push(sampleRow)
      }
    } else {
      // Process actual data rows with feature engineering
      let successfulRows = 0
      let failedRows = 0
      
      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(separator).map(v => v.trim().replace(/["']/g, ''))
          const row: any = {}
          
          // Map CSV values to row object
          headers.forEach((header, index) => {
            row[header] = values[index] || ''
          })

          const processedLawyer = processLawyerDataWithFeatureEngineering(row, i)
          processedData.push(processedLawyer)
          successfulRows++
        } catch (rowError) {
          console.error(`Error processing row ${i}:`, rowError, 'Row data:', lines[i])
          failedRows++
          // Continue processing other rows instead of failing completely
        }
      }
      
      console.log(`Processing complete: ${successfulRows} successful, ${failedRows} failed`)
      
      if (processedData.length === 0) {
        return new Response(
          JSON.stringify({ error: 'No valid data rows could be processed from the CSV file' }), 
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    }

    console.log('Successfully processed', processedData.length, 'records with feature engineering')

    return new Response(
      JSON.stringify(processedData),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Unexpected error in Edge Function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error while processing CSV file', 
        details: error instanceof Error ? error.message : 'Unknown error occurred'
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

function processLawyerDataWithFeatureEngineering(row: any, index: number) {
  // Parse base numeric values
  const casesAssigned = parseInt(row.cases_assigned) || 0
  const casesCompleted = parseInt(row.cases_completed) || 0
  const complaintCount = parseInt(row.complaint_count) || 0
  const reworkCount = parseInt(row.rework_count) || 0
  const tatCompliancePercent = parseFloat(row.tat_compliance_percent) || 0
  
  // === Feature Engineering (following the Python logic) ===
  
  // 1. Completion rate
  const completionRate = casesAssigned > 0 ? casesCompleted / casesAssigned : 0
  
  // 2. Cases remaining
  const casesRemaining = Math.max(0, casesAssigned - casesCompleted)
  
  // 3. Complaints per case
  const complaintsPerCase = casesAssigned > 0 ? complaintCount / casesAssigned : 0
  
  // 4. Reworks per case
  const reworksPerCase = casesAssigned > 0 ? reworkCount / casesAssigned : 0
  
  // 5. TAT flag encoded (Red = 1, Green = 0)
  const tatFlag = row.tat_flag || (parseFloat(row.avg_tat_days) > 15 ? 'Red' : 'Green')
  const tatFlagEncoded = tatFlag === 'Red' ? 1 : 0
  
  // 6. Feedback flag encoded (Positive = 1, Neutral/Negative = 0)
  const feedbackFlag = row.feedback_flag || 'Positive'
  const feedbackFlagEncoded = feedbackFlag === 'Positive' ? 1 : 0
  
  // 7. Quality check flag encoded (Pass = 1, Fail = 0)
  const qualityCheckFlag = row.quality_check_flag || 'Pass'
  const qualityCheckFlagEncoded = qualityCheckFlag === 'Pass' ? 1 : 0
  
  // 8. Allocation status encoded (category codes)
  const allocationStatus = row.allocation_status || 'Available'
  const statusMapping: { [key: string]: number } = {
    'Available': 0, 'Allocated': 1, 'Pending': 2, 'Busy': 3, 'On Leave': 4
  }
  const allocationStatusEncoded = statusMapping[allocationStatus] || 0
  
  // 9. Allocation month number (from date)
  let allocationMonthNum = 1
  if (row.allocation_date) {
    try {
      const date = new Date(row.allocation_date)
      if (!isNaN(date.getTime())) {
        allocationMonthNum = date.getMonth() + 1
      }
    } catch (e) {
      console.log('Error parsing allocation_date:', row.allocation_date)
    }
  }
  
  // 10. Low performance flag
  const lowPerformanceFlag = (
    completionRate < 0.5 ||
    tatCompliancePercent < 70 ||
    complaintsPerCase > 0.2
  ) ? 1 : 0
  
  // Calculate additional metrics
  const clientFeedbackScore = parseFloat(row.client_feedback_score) || Math.random() * 2 + 3
  const avgTatDays = parseFloat(row.avg_tat_days) || Math.random() * 20 + 5
  
  // Calculate lawyer score (weighted performance metric)
  const lawyerScore = Math.min(1, Math.max(0, 
    completionRate * 0.4 + 
    (tatCompliancePercent / 100) * 0.3 + 
    (clientFeedbackScore / 5) * 0.3
  ))

  // Process allocation month string
  let allocationMonth = row.allocation_month
  if (row.allocation_date && !allocationMonth) {
    try {
      const date = new Date(row.allocation_date)
      if (!isNaN(date.getTime())) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        allocationMonth = `${months[date.getMonth()]}-${date.getFullYear()}`
      }
    } catch (e) {
      console.log('Error creating allocation_month:', row.allocation_date)
    }
  }
  if (!allocationMonth) {
    const now = new Date()
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    allocationMonth = `${months[now.getMonth()]}-${now.getFullYear()}`
  }

  // Create the final processed lawyer object with all engineered features
  return {
    // Basic Info
    lawyer_id: row.lawyer_id || `L${Date.now()}-${index}`,
    branch_name: row.branch_name || 'Corporate',
    allocation_month: allocationMonth,
    case_id: row.case_id || `C${Date.now()}-${index}`,
    
    // Core Performance Metrics
    cases_assigned: casesAssigned,
    cases_completed: casesCompleted,
    completion_rate: Math.round(completionRate * 10000) / 10000,
    cases_remaining: casesRemaining,
    performance_score: Math.round(lawyerScore * 10000) / 10000,
    tat_compliance_percent: Math.round(tatCompliancePercent * 100) / 100,
    avg_tat_days: Math.round(avgTatDays * 100) / 100,
    
    // Flags and Indicators
    tat_flag: tatFlag,
    quality_check_flag: qualityCheckFlagEncoded === 1,
    client_feedback_score: Math.round(clientFeedbackScore * 100) / 100,
    feedback_flag: feedbackFlagEncoded === 1,
    complaints_per_case: Math.round(complaintsPerCase * 10000) / 10000,
    reworks_per_case: Math.round(reworksPerCase * 10000) / 10000,
    low_performance_flag: lowPerformanceFlag === 1,
    
    // Summary Metrics
    lawyer_score: Math.round(lawyerScore * 10000) / 10000,
    quality_rating: Math.round(clientFeedbackScore * 100) / 100,
    allocation_status: allocationStatus,
    total_cases_ytd: parseInt(row.total_cases_ytd) || casesAssigned * (3 + Math.floor(Math.random() * 3))
  }
}

function generateSampleLawyer(index: number) {
  const casesAssigned = Math.floor(Math.random() * 50) + 10
  const casesCompleted = Math.floor(casesAssigned * (0.6 + Math.random() * 0.3))
  const completionRate = casesAssigned > 0 ? casesCompleted / casesAssigned : Math.random() * 0.4 + 0.6
  const casesRemaining = casesAssigned - casesCompleted
  
  const tatCompliance = Math.random() * 0.4 + 0.6
  const clientFeedback = Math.random() * 2 + 3
  const avgTatDays = Math.random() * 20 + 5
  
  const complaintsPerCase = Math.random() * 0.2
  const reworksPerCase = Math.random() * 0.3
  
  const tatFlag = avgTatDays > 15 ? 'Red' : 'Green'
  const feedbackFlag = clientFeedback < 3.5
  const qualityCheckFlag = clientFeedback >= 4.0
  const lowPerformanceFlag = completionRate < 0.7 || tatCompliance < 0.75 || clientFeedback < 3.5
  
  const lawyerScore = Math.min(1, Math.max(0, 
    completionRate * 0.4 + 
    tatCompliance * 0.3 + 
    (clientFeedback / 5) * 0.3
  ))
  
  const branches = ['Corporate', 'Criminal', 'Family', 'Commercial']
  const statuses = ['Available', 'Allocated']
  
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
    tat_flag: tatFlag,
    quality_check_flag: qualityCheckFlag,
    client_feedback_score: Math.round(clientFeedback * 100) / 100,
    feedback_flag: feedbackFlag,
    complaints_per_case: Math.round(complaintsPerCase * 10000) / 10000,
    reworks_per_case: Math.round(reworksPerCase * 10000) / 10000,
    low_performance_flag: lowPerformanceFlag,
    lawyer_score: Math.round(lawyerScore * 10000) / 10000,
    quality_rating: Math.round(clientFeedback * 100) / 100,
    allocation_status: statuses[Math.floor(Math.random() * statuses.length)],
    total_cases_ytd: casesAssigned * (3 + Math.floor(Math.random() * 3))
  }
}
