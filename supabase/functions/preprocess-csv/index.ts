import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405, 
        headers: corsHeaders 
      })
    }

    // Parse form data to get the uploaded file
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return new Response('No file uploaded', { 
        status: 400, 
        headers: corsHeaders 
      })
    }

    // Read CSV content
    const csvContent = await file.text()
    
    // Parse CSV (simple parsing - assumes first row is headers)
    const lines = csvContent.trim().split('\n')
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    
    const processedData = []
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
      const row: any = {}
      
      // Map CSV values to row object
      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })

      // Feature Engineering - Calculate derived fields
      const casesAssigned = parseInt(row.cases_assigned) || 0
      const casesCompleted = parseInt(row.cases_completed) || 0
      const completionRate = casesAssigned > 0 ? casesCompleted / casesAssigned : 0
      const casesRemaining = casesAssigned - casesCompleted

      // Calculate performance metrics
      const tatCompliance = parseFloat(row.tat_compliance_percent) || 0
      const clientFeedback = parseFloat(row.client_feedback_score) || 0
      const avgTatDays = parseFloat(row.avg_tat_days) || 0
      
      // Calculate complaints and reworks per case
      const complaintsPerCase = casesAssigned > 0 ? (parseFloat(row.total_complaints) || 0) / casesAssigned : 0
      const reworksPerCase = casesAssigned > 0 ? (parseFloat(row.total_reworks) || 0) / casesAssigned : 0

      // Determine flags
      const tatFlag = avgTatDays > 15 ? 'Red' : 'Green'
      const feedbackFlag = clientFeedback < 3.5
      const qualityCheckFlag = clientFeedback >= 4.0
      const lowPerformanceFlag = completionRate < 0.7 || tatCompliance < 0.75 || clientFeedback < 3.5

      // Calculate lawyer score (weighted performance metric)
      const lawyerScore = (
        completionRate * 0.4 + 
        tatCompliance * 0.3 + 
        (clientFeedback / 5) * 0.3
      )

      // Process allocation month from date if provided
      let allocationMonth = row.allocation_month
      if (row.allocation_date) {
        const date = new Date(row.allocation_date)
        if (!isNaN(date.getTime())) {
          allocationMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        }
      }

      // Create processed lawyer object
      const processedLawyer = {
        lawyer_id: row.lawyer_id || `L${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        branch_name: row.branch_name || 'Corporate',
        allocation_month: allocationMonth || new Date().toISOString().slice(0, 7),
        case_id: row.case_id || `C${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        cases_assigned: casesAssigned,
        cases_completed: casesCompleted,
        completion_rate: Math.round(completionRate * 10000) / 10000, // 4 decimal places
        cases_remaining: casesRemaining,
        performance_score: Math.round(lawyerScore * 10000) / 10000,
        tat_compliance_percent: tatCompliance,
        avg_tat_days: avgTatDays,
        tat_flag: tatFlag,
        quality_check_flag: qualityCheckFlag,
        client_feedback_score: clientFeedback,
        feedback_flag: feedbackFlag,
        complaints_per_case: Math.round(complaintsPerCase * 10000) / 10000,
        reworks_per_case: Math.round(reworksPerCase * 10000) / 10000,
        low_performance_flag: lowPerformanceFlag,
        lawyer_score: Math.round(lawyerScore * 10000) / 10000,
        quality_rating: parseFloat(row.quality_rating) || clientFeedback,
        allocation_status: row.allocation_status || 'Available',
        total_cases_ytd: parseInt(row.total_cases_ytd) || casesAssigned * 4 // Estimate if not provided
      }

      processedData.push(processedLawyer)
    }

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
      JSON.stringify({ error: 'Failed to process CSV file' }),
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