import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DbCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function useCategories() {
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCategories = useCallback(async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      toast({ title: 'Error', description: 'Failed to fetch categories', variant: 'destructive' });
    } else {
      setCategories((data as unknown as DbCategory[]) || []);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = async (category: Partial<DbCategory>) => {
    const { error } = await supabase.from('categories').insert(category as any);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return false;
    }
    toast({ title: 'Success', description: 'Category added' });
    await fetchCategories();
    return true;
  };

  const updateCategory = async (id: string, updates: Partial<DbCategory>) => {
    const { error } = await supabase.from('categories').update(updates as any).eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return false;
    }
    toast({ title: 'Updated', description: 'Category updated' });
    await fetchCategories();
    return true;
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return false;
    }
    toast({ title: 'Deleted', description: 'Category deleted' });
    await fetchCategories();
    return true;
  };

  return { categories, loading, addCategory, updateCategory, deleteCategory, fetchCategories };
}
