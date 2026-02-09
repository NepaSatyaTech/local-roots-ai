import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  currentComment?: string;
  onSubmit: (status: string, comment: string) => Promise<boolean>;
}

const ReviewDialog = ({ open, onOpenChange, productName, currentComment, onSubmit }: ReviewDialogProps) => {
  const [status, setStatus] = useState('reviewed');
  const [comment, setComment] = useState(currentComment || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim()) return;
    setLoading(true);
    const success = await onSubmit(status, comment);
    setLoading(false);
    if (success) {
      setComment('');
      setStatus('reviewed');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display">Review: {productName}</DialogTitle>
          <DialogDescription>Add your review comments and set the review status</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Review Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="reviewed">Reviewed ✅</SelectItem>
                <SelectItem value="needs_changes">Needs Changes ⚠️</SelectItem>
                <SelectItem value="rejected">Rejected ❌</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Comments *</Label>
            <Textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Enter your review comments..."
              rows={4}
              maxLength={2000}
              required
            />
            {!comment.trim() && (
              <p className="text-xs text-destructive">Comment is required</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading || !comment.trim()}>
            {loading ? 'Submitting...' : 'Submit Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDialog;
