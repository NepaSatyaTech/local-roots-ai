import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Submission {
  id: string;
  product_name: string;
  location: string;
  usage_details: string | null;
  submitted_by: string;
  submitted_by_user_id: string | null;
  status: string | null;
  created_at: string;
}

export function useSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSubmissions = useCallback(async () => {
    const { data, error } = await supabase
      .from('community_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching submissions:', error);
      toast({ title: 'Error', description: 'Failed to fetch submissions', variant: 'destructive' });
    } else {
      setSubmissions(data || []);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchSubmissions();

    const channel = supabase
      .channel('submissions-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_submissions' }, () => {
        fetchSubmissions();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchSubmissions]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('community_submissions')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return false;
    }
    toast({ title: 'Updated', description: `Submission marked as ${status}` });
    return true;
  };

  const deleteSubmission = async (id: string) => {
    const { error } = await supabase
      .from('community_submissions')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return false;
    }
    toast({ title: 'Deleted', description: 'Submission removed' });
    return true;
  };

  const pendingSubmissions = submissions.filter(s => s.status === 'pending');

  return { submissions, pendingSubmissions, loading, updateStatus, deleteSubmission };
}
