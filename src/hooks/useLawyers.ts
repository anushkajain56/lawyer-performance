
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

      // Transform database data to match our Lawyer type
      return data.map((lawyer): Lawyer => ({
        lawyer_id: lawyer.lawyer_id,
        branch_name: lawyer.branch_name,
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
        quality_check_flag: lawyer.quality_check_flag || false,
        client_feedback_score: Number(lawyer.client_feedback_score) || 0,
        feedback_flag: lawyer.feedback_flag || false,
        complaints_per_case: Number(lawyer.complaints_per_case) || 0,
        reworks_per_case: Number(lawyer.reworks_per_case) || 0,
        low_performance_flag: lawyer.low_performance_flag || false,
        lawyer_score: Number(lawyer.lawyer_score) || 0,
        quality_rating: Number(lawyer.quality_rating) || 0,
        allocation_status: (lawyer.allocation_status as 'Allocated' | 'Available') || 'Available',
        total_cases_ytd: lawyer.total_cases_ytd || 0
      }));
    },
  });
};

export const useAddLawyers = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (lawyers: Lawyer[]) => {
      const { data, error } = await supabase
        .from('lawyers')
        .insert(lawyers.map(lawyer => ({
          lawyer_id: lawyer.lawyer_id,
          branch_name: lawyer.branch_name,
          allocation_month: lawyer.allocation_month,
          case_id: lawyer.case_id,
          cases_assigned: lawyer.cases_assigned,
          cases_completed: lawyer.cases_completed,
          completion_rate: lawyer.completion_rate,
          cases_remaining: lawyer.cases_remaining,
          performance_score: lawyer.performance_score,
          tat_compliance_percent: lawyer.tat_compliance_percent,
          avg_tat_days: lawyer.avg_tat_days,
          tat_flag: lawyer.tat_flag,
          quality_check_flag: lawyer.quality_check_flag,
          client_feedback_score: lawyer.client_feedback_score,
          feedback_flag: lawyer.feedback_flag,
          complaints_per_case: lawyer.complaints_per_case,
          reworks_per_case: lawyer.reworks_per_case,
          low_performance_flag: lawyer.low_performance_flag,
          lawyer_score: lawyer.lawyer_score,
          quality_rating: lawyer.quality_rating,
          allocation_status: lawyer.allocation_status,
          total_cases_ytd: lawyer.total_cases_ytd
        })))
        .select();

      if (error) {
        console.error('Error adding lawyers:', error);
        throw error;
      }

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
