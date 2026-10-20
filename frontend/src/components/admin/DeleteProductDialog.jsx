import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { deleteProduct } from '@/features/admin/adminSlice';

export default function DeleteProductDialog({ product, onClose }) {
  const dispatch = useDispatch();
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    setBusy(true);
    try {
      await dispatch(deleteProduct(product.id)).unwrap();
      toast.success(`Deleted “${product.name}”`);
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Could not delete the product');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={Boolean(product)} onOpenChange={(open) => !open && !busy && onClose()}>
      <DialogContent>
        <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-destructive/10 text-destructive">
          <Trash2 className="h-5 w-5" />
        </span>
        <DialogTitle>Delete this product?</DialogTitle>
        <DialogDescription>
          <span className="font-semibold text-foreground">{product?.name}</span> will be removed from the shop for everyone
          straight away. Past orders keep their record of it. This can&apos;t be undone.
        </DialogDescription>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={busy}>
              Cancel
            </Button>
          </DialogClose>
          <Button variant="destructive" onClick={confirm} disabled={busy}>
            {busy ? (
              <>
                <Loader2 className="animate-spin" /> Deleting…
              </>
            ) : (
              'Delete product'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
