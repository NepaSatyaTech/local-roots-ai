import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DbProduct {
  id: string;
  name: string;
  category_id: string;
  category_name: string;
  category_icon: string;
  description: string;
  importance: string;
  daily_life_uses: string;
  how_to_use: string;
  ingredients: string;
  cultural_background: string;
  where_to_find: string;
  price: string;
  images: string[];
  availability: string;
  location_country: string;
  location_state: string;
  location_district: string;
  location_local_area: string;
  featured: boolean;
  trending: boolean;
  status: string;
  review_status: string;
  review_comment: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useProducts() {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      toast({ title: 'Error', description: 'Failed to fetch products', variant: 'destructive' });
    } else {
      setProducts((data as unknown as DbProduct[]) || []);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchProducts();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('products-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchProducts();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchProducts]);

  const addProduct = async (product: Partial<DbProduct>) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('products').insert({
      ...product,
      created_by: user?.id,
      review_status: 'pending',
      status: 'active',
    } as any);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return false;
    }
    toast({ title: 'Success', description: 'Product added successfully' });
    return true;
  };

  const approveProduct = async (productId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Check if already approved
    const product = products.find(p => p.id === productId);
    if (product?.review_status === 'approved') {
      toast({ title: 'Already Approved', description: 'This product is already approved', variant: 'destructive' });
      return false;
    }

    const { error } = await supabase.from('products').update({
      review_status: 'approved',
      approved_by: user?.id,
      approved_at: new Date().toISOString(),
    } as any).eq('id', productId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return false;
    }
    toast({ title: 'Approved', description: 'Product approved successfully' });
    return true;
  };

  const reviewProduct = async (productId: string, reviewStatus: string, comment: string) => {
    if (!comment.trim()) {
      toast({ title: 'Error', description: 'Review comment is required', variant: 'destructive' });
      return false;
    }

    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('products').update({
      review_status: reviewStatus,
      review_comment: comment,
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
    } as any).eq('id', productId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return false;
    }
    toast({ title: 'Reviewed', description: `Product marked as ${reviewStatus}` });
    return true;
  };

  const updateProduct = async (productId: string, updates: Partial<DbProduct>) => {
    const { error } = await supabase.from('products').update(updates as any).eq('id', productId);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return false;
    }
    toast({ title: 'Updated', description: 'Product updated successfully' });
    return true;
  };

  const deleteProduct = async (productId: string) => {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return false;
    }
    toast({ title: 'Deleted', description: 'Product deleted' });
    return true;
  };

  // Derived data
  const recentProducts = products.slice(0, 5);
  const pendingProducts = products.filter(p => p.review_status === 'pending');
  const approvedCount = products.filter(p => p.review_status === 'approved').length;
  const reviewedCount = products.filter(p => p.reviewed_by !== null).length;

  return {
    products,
    recentProducts,
    pendingProducts,
    approvedCount,
    reviewedCount,
    loading,
    fetchProducts,
    addProduct,
    updateProduct,
    approveProduct,
    reviewProduct,
    deleteProduct,
  };
}
