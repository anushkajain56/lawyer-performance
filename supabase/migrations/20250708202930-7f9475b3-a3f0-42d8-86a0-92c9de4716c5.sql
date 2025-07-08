
-- Update the lawyers table to handle larger values for percentage fields
ALTER TABLE public.lawyers 
ALTER COLUMN tat_compliance_percent TYPE DECIMAL(6,2);

ALTER TABLE public.lawyers 
ALTER COLUMN completion_rate TYPE DECIMAL(6,4);

ALTER TABLE public.lawyers 
ALTER COLUMN performance_score TYPE DECIMAL(6,4);

ALTER TABLE public.lawyers 
ALTER COLUMN lawyer_score TYPE DECIMAL(6,4);
