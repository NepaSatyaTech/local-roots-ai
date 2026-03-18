import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useSavedProducts() {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSaved = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSavedIds([]); setLoading(false); return; }

    const { data, error } = await supabase
      .from('saved_products')
      .select('product_id')
      .eq('user_id', user.id);

    if (!error && data) {
      setSavedIds(data.map((d: any) => d.product_id));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchSaved(); }, [fetchSaved]);

  const toggleSave = async (productId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: 'Login required', description: 'Please verify your email to save products', variant: 'destructive' });
      return;
    }

    if (savedIds.includes(productId)) {
      const { error } = await supabase
        .from('saved_products')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
      if (!error) {
        setSavedIds(prev => prev.filter(id => id !== productId));
        toast({ title: 'Removed', description: 'Product removed from saved items' });
      }
    } else {
      const { error } = await supabase
        .from('saved_products')
        .insert({ user_id: user.id, product_id: productId });
      if (!error) {
        setSavedIds(prev => [...prev, productId]);
        toast({ title: 'Saved!', description: 'Product added to your saved items' });
      }
    }
  };

  const isSaved = (productId: string) => savedIds.includes(productId);

  return { savedIds, loading, toggleSave, isSaved };
}
