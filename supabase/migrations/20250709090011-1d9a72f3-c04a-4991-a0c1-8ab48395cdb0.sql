
-- Drop the existing lawyers table and recreate with all required columns
DROP TABLE IF EXISTS public.lawyers;

-- Create the lawyers table with all required columns from your specification
CREATE TABLE public.lawyers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Basic info columns
  lawyer_id TEXT NOT NULL,
  lawyer_name TEXT,
  branch_id TEXT,
  branch_name TEXT NOT NULL,
  allocation_month TEXT NOT NULL,
  allocation_date DATE,
  case_id TEXT,
  
  -- Performance metrics
  cases_assigned INTEGER DEFAULT 0,
  cases_completed INTEGER DEFAULT 0,
  avg_tat_days NUMERIC DEFAULT 0,
  tat_compliance_percent NUMERIC DEFAULT 0,
  tat_flag TEXT DEFAULT 'Green',
  tat_bucket TEXT,
  quality_flags INTEGER DEFAULT 0,
  quality_check_flag TEXT DEFAULT 'Pass',
  client_feedback_score NUMERIC DEFAULT 0,
  feedback_flag TEXT DEFAULT 'Positive',
  rework_count INTEGER DEFAULT 0,
  complaint_count INTEGER DEFAULT 0,
  max_capacity INTEGER DEFAULT 0,
  blacklist_status BOOLEAN DEFAULT false,
  total_cases_ytd INTEGER DEFAULT 0,
  quality_rating TEXT DEFAULT 'Good',
  allocation_status TEXT DEFAULT 'Available',
  
  -- Engineered/calculated columns
  completion_rate NUMERIC DEFAULT 0,
  cases_remaining INTEGER DEFAULT 0,
  complaints_per_case NUMERIC DEFAULT 0,
  reworks_per_case NUMERIC DEFAULT 0,
  tat_flag_encoded INTEGER DEFAULT 0,
  feedback_flag_encoded INTEGER DEFAULT 0,
  quality_check_flag_encoded INTEGER DEFAULT 0,
  allocation_status_encoded INTEGER DEFAULT 0,
  allocation_month_num INTEGER DEFAULT 1,
  low_performance_flag BOOLEAN DEFAULT false,
  
  -- Additional fields for compatibility
  performance_score NUMERIC DEFAULT 0,
  lawyer_score NUMERIC DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.lawyers ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for all operations
CREATE POLICY "Everyone can view lawyer data" ON public.lawyers FOR SELECT USING (true);
CREATE POLICY "Everyone can insert lawyer data" ON public.lawyers FOR INSERT WITH CHECK (true);
CREATE POLICY "Everyone can update lawyer data" ON public.lawyers FOR UPDATE USING (true);
CREATE POLICY "Everyone can delete lawyer data" ON public.lawyers FOR DELETE USING (true);
