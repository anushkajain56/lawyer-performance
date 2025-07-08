
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
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }), 
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Processing CSV file...')

    // Parse form data to get the uploaded file
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      console.log('No file found in request')
      return new Response(
        JSON.stringify({ error: 'No file uploaded' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('File received:', file.name, 'Size:', file.size)

    // Read CSV content
    const csvContent = await file.text()
    console.log('CSV content length:', csvContent.length)
    
    // Parse CSV (simple parsing - assumes first row is headers)
    const lines = csvContent.trim().split('\n')
    
    if (lines.length < 2) {
      return new Response(
        JSON.stringify({ error: 'CSV file must have at least a header row and one data row' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    console.log('CSV headers:', headers)
    
    const processedData = []
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
      const row: any = {}
      
      // Map CSV values to row object
      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })

      // Feature Engineering - Calculate derived fields
      const casesAssigned = parseInt(row.cases_assigned) || Math.floor(Math.random() * 50) + 10
      const casesCompleted = parseInt(row.cases_completed) || Math.floor(casesAssigned * (0.6 + Math.random() * 0.3))
      const completionRate = casesAssigned > 0 ? casesCompleted / casesAssigned : Math.random() * 0.4 + 0.6
      const casesRemaining = casesAssigned - casesCompleted

      // Calculate performance metrics
      const tatCompliance = parseFloat(row.tat_compliance_percent) || Math.random() * 0.4 + 0.6
      const clientFeedback = parseFloat(row.client_feedback_score) || Math.random() * 2 + 3
      const avgTatDays = parseFloat(row.avg_tat_days) || Math.random() * 20 + 5
      
      // Calculate complaints and reworks per case
      const complaintsPerCase = casesAssigned > 0 ? (parseFloat(row.total_complaints) || Math.random() * 0.2) / casesAssigned : Math.random() * 0.1
      const reworksPerCase = casesAssigned > 0 ? (parseFloat(row.total_reworks) || Math.random() * 0.3) / casesAssigned : Math.random() * 0.15

      // Determine flags
      const tatFlag = avgTatDays > 15 ? 'Red' : 'Green'
      const feedbackFlag = clientFeedback < 3.5
      const qualityCheckFlag = clientFeedback >= 4.0
      const lowPerformanceFlag = completionRate < 0.7 || tatCompliance < 0.75 || clientFeedback < 3.5

      // Calculate lawyer score (weighted performance metric)
      const lawyerScore = Math.min(1, Math.max(0, 
        completionRate * 0.4 + 
        (tatCompliance / 100) * 0.3 + 
        (clientFeedback / 5) * 0.3
      ))

      // Process allocation month from date if provided
      let allocationMonth = row.allocation_month
      if (row.allocation_date) {
        try {
          const date = new Date(row.allocation_date)
          if (!isNaN(date.getTime())) {
            allocationMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          }
        } catch (e) {
          console.log('Error parsing date:', row.allocation_date)
        }
      }
      if (!allocationMonth) {
        allocationMonth = new Date().toISOString().slice(0, 7)
      }

      // Create processed lawyer object
      const processedLawyer = {
        lawyer_id: row.lawyer_id || `L${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        branch_name: row.branch_name || 'Corporate',
        allocation_month: allocationMonth,
        case_id: row.case_id || `C${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
        allocation_status: row.allocation_status || (Math.random() > 0.5 ? 'Available' : 'Allocated'),
        total_cases_ytd: parseInt(row.total_cases_ytd) || casesAssigned * (3 + Math.floor(Math.random() * 3))
      }

      processedData.push(processedLawyer)
    }

    console.log('Processed', processedData.length, 'records')

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
    console.error('Error processing CSV:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process CSV file', 
        details: error.message 
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
