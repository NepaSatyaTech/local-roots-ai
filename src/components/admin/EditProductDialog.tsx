import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { PRODUCT_CATEGORIES } from '@/types/product';
import type { DbProduct } from '@/hooks/useProducts';

interface EditProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: DbProduct | null;
  onSubmit: (id: string, updates: Partial<DbProduct>) => Promise<boolean>;
}

const EditProductDialog = ({ open, onOpenChange, product, onSubmit }: EditProductDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', category_id: '', description: '', importance: '',
    daily_life_uses: '', how_to_use: '', ingredients: '', cultural_background: '',
    where_to_find: '', price: '', availability: 'available',
    location_state: '', location_district: '', location_local_area: '',
    featured: false, trending: false,
  });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        category_id: product.category_id || '',
        description: product.description || '',
        importance: product.importance || '',
        daily_life_uses: product.daily_life_uses || '',
        how_to_use: product.how_to_use || '',
        ingredients: product.ingredients || '',
        cultural_background: product.cultural_background || '',
        where_to_find: product.where_to_find || '',
        price: product.price || '',
        availability: product.availability || 'available',
        location_state: product.location_state || '',
        location_district: product.location_district || '',
        location_local_area: product.location_local_area || '',
        featured: product.featured || false,
        trending: product.trending || false,
      });
    }
  }, [product]);

  const selectedCategory = PRODUCT_CATEGORIES.find(c => c.id === form.category_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !form.name.trim()) return;
    setLoading(true);
    const success = await onSubmit(product.id, {
      ...form,
      category_name: selectedCategory?.name || product.category_name,
      category_icon: selectedCategory?.icon || product.category_icon,
    } as Partial<DbProduct>);
    setLoading(false);
    if (success) onOpenChange(false);
  };

  const updateField = (field: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Edit Product</DialogTitle>
          <DialogDescription>Update the product details</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Product Name *</Label>
              <Input value={form.name} onChange={e => updateField('name', e.target.value)} required maxLength={200} />
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={form.category_id} onValueChange={v => updateField('category_id', v)}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {PRODUCT_CATEGORIES.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={e => updateField('description', e.target.value)} maxLength={2000} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Importance</Label>
              <Textarea value={form.importance} onChange={e => updateField('importance', e.target.value)} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Daily Life Uses</Label>
              <Textarea value={form.daily_life_uses} onChange={e => updateField('daily_life_uses', e.target.value)} rows={2} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>How to Use</Label>
              <Textarea value={form.how_to_use} onChange={e => updateField('how_to_use', e.target.value)} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Ingredients / Materials</Label>
              <Textarea value={form.ingredients} onChange={e => updateField('ingredients', e.target.value)} rows={2} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cultural / Historical Background</Label>
            <Textarea value={form.cultural_background} onChange={e => updateField('cultural_background', e.target.value)} />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>State</Label>
              <Input value={form.location_state} onChange={e => updateField('location_state', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>District</Label>
              <Input value={form.location_district} onChange={e => updateField('location_district', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Local Area</Label>
              <Input value={form.location_local_area} onChange={e => updateField('location_local_area', e.target.value)} />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Price</Label>
              <Input value={form.price} onChange={e => updateField('price', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Where to Find</Label>
              <Input value={form.where_to_find} onChange={e => updateField('where_to_find', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Availability</Label>
              <Select value={form.availability} onValueChange={v => updateField('availability', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="limited">Limited</SelectItem>
                  <SelectItem value="seasonal">Seasonal</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={form.featured} onCheckedChange={v => updateField('featured', v)} />
              <Label>Featured</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.trending} onCheckedChange={v => updateField('trending', v)} />
              <Label>Trending</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" variant="hero" disabled={loading || !form.name.trim()}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductDialog;
