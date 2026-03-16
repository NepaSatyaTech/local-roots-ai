import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { DbCategory } from '@/hooks/useCategories';

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: DbCategory | null;
  onSubmit: (data: Partial<DbCategory>) => Promise<boolean>;
}

const CategoryDialog = ({ open, onOpenChange, category, onSubmit }: CategoryDialogProps) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🏺');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('primary');
  const [sortOrder, setSortOrder] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setIcon(category.icon);
      setDescription(category.description);
      setColor(category.color);
      setSortOrder(category.sort_order);
    } else {
      setName('');
      setIcon('🏺');
      setDescription('');
      setColor('primary');
      setSortOrder(0);
    }
  }, [category, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    const success = await onSubmit({ name, icon, description, color, sort_order: sortOrder });
    setSubmitting(false);
    if (success) onOpenChange(false);
  };

  const colorOptions = ['primary', 'sage', 'amber', 'terracotta', 'secondary', 'muted', 'accent'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">{category ? 'Edit Category' : 'Add Category'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Category name" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Icon (emoji)</Label>
              <Input value={icon} onChange={e => setIcon(e.target.value)} placeholder="🏺" />
            </div>
            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Input type="number" value={sortOrder} onChange={e => setSortOrder(Number(e.target.value))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description" rows={2} />
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    color === c ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/30'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" variant="hero" disabled={submitting}>
              {submitting ? 'Saving...' : category ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryDialog;
