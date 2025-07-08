
-- Create a table to store lawyer performance data
CREATE TABLE public.lawyers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lawyer_id TEXT NOT NULL UNIQUE,
  branch_name TEXT NOT NULL,
  allocation_month TEXT NOT NULL,
  case_id TEXT,
  cases_assigned INTEGER DEFAULT 0,
  cases_completed INTEGER DEFAULT 0,
  completion_rate DECIMAL(5,4) DEFAULT 0,
  cases_remaining INTEGER DEFAULT 0,
  performance_score DECIMAL(5,4) DEFAULT 0,
  tat_compliance_percent DECIMAL(5,4) DEFAULT 0,
  avg_tat_days DECIMAL(8,2) DEFAULT 0,
  tat_flag TEXT CHECK (tat_flag IN ('Red', 'Green')) DEFAULT 'Green',
  quality_check_flag BOOLEAN DEFAULT false,
  client_feedback_score DECIMAL(3,2) DEFAULT 0,
  feedback_flag BOOLEAN DEFAULT false,
  complaints_per_case DECIMAL(8,4) DEFAULT 0,
  reworks_per_case DECIMAL(8,4) DEFAULT 0,
  low_performance_flag BOOLEAN DEFAULT false,
  lawyer_score DECIMAL(5,4) DEFAULT 0,
  quality_rating DECIMAL(3,2) DEFAULT 0,
  allocation_status TEXT CHECK (allocation_status IN ('Allocated', 'Available')) DEFAULT 'Available',
  total_cases_ytd INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.lawyers ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows everyone to read lawyer data (for now)
-- You can make this more restrictive later with authentication
CREATE POLICY "Everyone can view lawyer data" 
  ON public.lawyers 
  FOR SELECT 
  USING (true);

-- Create a policy that allows everyone to insert lawyer data (for CSV uploads)
CREATE POLICY "Everyone can insert lawyer data" 
  ON public.lawyers 
  FOR INSERT 
  WITH CHECK (true);

-- Create a policy that allows everyone to update lawyer data
CREATE POLICY "Everyone can update lawyer data" 
  ON public.lawyers 
  FOR UPDATE 
  USING (true);

-- Create a policy that allows everyone to delete lawyer data
CREATE POLICY "Everyone can delete lawyer data" 
  ON public.lawyers 
  FOR DELETE 
  USING (true);

-- Create an index on lawyer_id for faster lookups
CREATE INDEX idx_lawyers_lawyer_id ON public.lawyers(lawyer_id);

-- Create an index on branch_name for filtering
CREATE INDEX idx_lawyers_branch_name ON public.lawyers(branch_name);

-- Create an index on allocation_status for filtering
CREATE INDEX idx_lawyers_allocation_status ON public.lawyers(allocation_status);

-- Insert some sample data to replace the mock data
INSERT INTO public.lawyers (
  lawyer_id, branch_name, allocation_month, case_id, cases_assigned, cases_completed,
  completion_rate, cases_remaining, performance_score, tat_compliance_percent,
  avg_tat_days, tat_flag, quality_check_flag, client_feedback_score, feedback_flag,
  complaints_per_case, reworks_per_case, low_performance_flag, lawyer_score,
  quality_rating, allocation_status, total_cases_ytd
) VALUES
('LAW001', 'Corporate', '2024-01', 'C001', 30, 28, 0.9333, 2, 0.85, 0.90, 12.5, 'Green', true, 4.2, false, 0.03, 0.05, false, 0.87, 4.3, 'Allocated', 120),
('LAW002', 'Criminal', '2024-01', 'C002', 25, 20, 0.8000, 5, 0.72, 0.75, 18.2, 'Red', false, 3.8, true, 0.08, 0.12, true, 0.68, 3.5, 'Available', 95),
('LAW003', 'Family', '2024-02', 'C003', 35, 33, 0.9429, 2, 0.88, 0.92, 10.8, 'Green', true, 4.5, false, 0.02, 0.03, false, 0.91, 4.6, 'Allocated', 140),
('LAW004', 'Corporate', '2024-02', 'C004', 28, 24, 0.8571, 4, 0.78, 0.82, 15.3, 'Green', true, 4.0, false, 0.05, 0.07, false, 0.79, 4.1, 'Available', 108),
('LAW005', 'Criminal', '2024-01', 'C005', 22, 18, 0.8182, 4, 0.70, 0.73, 20.1, 'Red', false, 3.6, true, 0.09, 0.15, true, 0.65, 3.4, 'Allocated', 88);
