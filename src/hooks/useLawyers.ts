
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Lawyer } from '@/types/lawyer';
import { useToast } from '@/hooks/use-toast';

export const useLawyers = () => {
  return useQuery({
    queryKey: ['lawyers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lawyers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching lawyers:', error);
        throw error;
      }

      console.log('Raw database data sample:', data?.[0]); // Debug log

      // Transform database data to match our Lawyer type
      return data.map((lawyer): Lawyer => {
        // Helper function to safely extract string values
        const safeString = (value: any): string | undefined => {
          if (value === null || value === undefined) return undefined;
          if (typeof value === 'string' && value.trim() !== '' && value !== 'undefined') return value.trim();
          if (typeof value === 'object' && value.value !== undefined) {
            const val = value.value === 'undefined' ? undefined : String(value.value);
            return val && val.trim() !== '' ? val.trim() : undefined;
          }
          if (typeof value !== 'string') {
            const stringVal = String(value);
            return stringVal && stringVal.trim() !== '' && stringVal !== 'undefined' ? stringVal.trim() : undefined;
          }
          return undefined;
        };

        const transformedLawyer = {
          lawyer_id: lawyer.lawyer_id,
          lawyer_name: safeString(lawyer.lawyer_name), // Use the actual lawyer_name from DB
          branch_name: lawyer.branch_name,
          expertise_domains: safeString(lawyer.domain), // Map domain field from DB to expertise_domains
          allocation_month: lawyer.allocation_month,
          case_id: lawyer.case_id || '',
          cases_assigned: lawyer.cases_assigned || 0,
          cases_completed: lawyer.cases_completed || 0,
          completion_rate: Number(lawyer.completion_rate) || 0,
          cases_remaining: lawyer.cases_remaining || 0,
          performance_score: Number(lawyer.performance_score) || 0,
          tat_compliance_percent: Number(lawyer.tat_compliance_percent) || 0,
          avg_tat_days: Number(lawyer.avg_tat_days) || 0,
          tat_flag: (lawyer.tat_flag as 'Red' | 'Green') || 'Green',
          quality_check_flag: lawyer.quality_check_flag === 'Pass',
          client_feedback_score: Number(lawyer.client_feedback_score) || 0,
          feedback_flag: lawyer.feedback_flag === 'Positive',
          complaints_per_case: Number(lawyer.complaints_per_case) || 0,
          reworks_per_case: Number(lawyer.reworks_per_case) || 0,
          low_performance_flag: lawyer.low_performance_flag || false,
          lawyer_score: Number(lawyer.lawyer_score) || 0,
          quality_rating: Number(lawyer.client_feedback_score) || 0,
          allocation_status: (lawyer.allocation_status as 'Allocated' | 'Available' | 'Pending' | 'Completed') || 'Available',
          total_cases_ytd: lawyer.total_cases_ytd || 0
        };
        
        console.log('Transformed lawyer:', transformedLawyer); // Debug log
        return transformedLawyer;
      });
    },
  });
};

export const useAddLawyers = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (lawyers: Lawyer[]) => {
      console.log('Attempting to insert lawyers:', lawyers.length);
      console.log('First lawyer sample before insert:', lawyers[0]);
      
      const { data, error } = await supabase
        .from('lawyers')
        .insert(lawyers.map(lawyer => ({
          lawyer_id: lawyer.lawyer_id,
          lawyer_name: lawyer.lawyer_name || null, // Preserve the actual lawyer_name
          branch_id: null,
          branch_name: lawyer.branch_name,
          domain: lawyer.expertise_domains || null, // Map frontend 'expertise_domains' to database 'domain'
          allocation_month: lawyer.allocation_month,
          allocation_date: null,
          case_id: lawyer.case_id,
          cases_assigned: lawyer.cases_assigned,
          cases_completed: lawyer.cases_completed,
          avg_tat_days: lawyer.avg_tat_days,
          tat_compliance_percent: lawyer.tat_compliance_percent,
          tat_flag: lawyer.tat_flag,
          tat_bucket: null,
          quality_flags: 0,
          quality_check_flag: lawyer.quality_check_flag ? 'Pass' : 'Fail',
          client_feedback_score: lawyer.client_feedback_score,
          feedback_flag: lawyer.feedback_flag ? 'Positive' : 'Neutral/Negative',
          rework_count: 0,
          complaint_count: 0,
          max_capacity: 0,
          blacklist_status: false,
          total_cases_ytd: lawyer.total_cases_ytd,
          quality_rating: 'Good',
          allocation_status: lawyer.allocation_status,
          completion_rate: lawyer.completion_rate,
          cases_remaining: lawyer.cases_remaining,
          complaints_per_case: lawyer.complaints_per_case,
          reworks_per_case: lawyer.reworks_per_case,
          tat_flag_encoded: lawyer.tat_flag === 'Red' ? 1 : 0,
          feedback_flag_encoded: lawyer.feedback_flag ? 1 : 0,
          quality_check_flag_encoded: lawyer.quality_check_flag ? 1 : 0,
          allocation_status_encoded: lawyer.allocation_status === 'Allocated' ? 1 : 0,
          allocation_month_num: new Date().getMonth() + 1,
          low_performance_flag: lawyer.low_performance_flag,
          performance_score: lawyer.performance_score,
          lawyer_score: lawyer.lawyer_score
        })))
        .select();

      if (error) {
        console.error('Error adding lawyers:', error);
        throw error;
      }

      console.log('Successfully inserted lawyers:', data?.length);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lawyers'] });
      toast({
        title: "Success",
        description: "Lawyers data has been uploaded successfully!",
      });
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast({
        title: "Error",
        description: "Failed to upload lawyers data. Please try again.",
        variant: "destructive",
      });
    },
  });
};
