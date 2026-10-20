import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import ProductImage from '@/components/ProductImage';
import { saveProduct } from '@/features/admin/adminSlice';
import { PRODUCT_FIELDS, toPayload, validateProduct, validateProductField } from '@/lib/productValidation';
import { cn } from '@/lib/utils';

const EMPTY = {
  name: '',
  category: '',
  price: '',
  stock: '10',
  rating: '4.5',
  imageUrl: '',
  badge: '',
  description: '',
  featured: false,
};

const fromProduct = (p) => ({
  name: p.name ?? '',
  category: p.category ?? '',
  price: String(p.price ?? ''),
  stock: String(p.stock ?? ''),
  rating: String(p.rating ?? ''),
  imageUrl: p.imageUrl ?? '',
  badge: p.badge ?? '',
  description: p.description ?? '',
  featured: Boolean(p.featured),
});

function Field({ id, label, error, hint, children }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="flex items-center gap-1.5 text-[13px] font-medium text-destructive">
          <AlertCircle className="h-3.5 w-3.5 flex-none" /> {error}
        </p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

/** Create (product = null) or edit (product = {...}) in a side sheet. */
export default function ProductFormSheet({ open, product, categories, onClose }) {
  const dispatch = useDispatch();
  const editing = Boolean(product);

  const [values, setValues] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  // reset whenever the sheet opens for a (different) product
  useEffect(() => {
    if (!open) return;
    setValues(product ? fromProduct(product) : EMPTY);
    setTouched({});
    setServerErrors({});
    setFormError('');
  }, [open, product]);

  const clientErrors = useMemo(() => validateProduct(values), [values]);
  const errorFor = (name) => (touched[name] && clientErrors[name]) || serverErrors[name] || '';

  const set = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    if (serverErrors[name] || formError) {
      setServerErrors((e) => ({ ...e, [name]: undefined }));
      setFormError('');
    }
  };
  const blur = (name) => setTouched((t) => ({ ...t, [name]: true }));

  const inputProps = (name) => ({
    id: `pf-${name}`,
    name,
    value: values[name],
    onChange: (e) => set(name, e.target.value),
    onBlur: () => blur(name),
    'aria-invalid': errorFor(name) ? 'true' : 'false',
    'aria-describedby': errorFor(name) ? `pf-${name}-error` : undefined,
  });

  const submit = async (e) => {
    e.preventDefault();
    const errors = validateProduct(values);
    if (Object.keys(errors).length) {
      setTouched(Object.fromEntries(PRODUCT_FIELDS.map((f) => [f, true])));
      document.querySelector(`#pf-${PRODUCT_FIELDS.find((f) => errors[f])}`)?.focus();
      return;
    }
    setBusy(true);
    try {
      const saved = await dispatch(saveProduct({ id: product?.id, data: toPayload(values) })).unwrap();
      toast.success(editing ? `Updated “${saved.name}”` : `Added “${saved.name}”`);
      onClose();
    } catch (err) {
      // field errors come from @Valid on the server; anything else is shown as a banner
      setServerErrors(err?.errors || {});
      setFormError(Object.keys(err?.errors || {}).length ? 'Please fix the highlighted fields.' : err?.message || 'Could not save');
    } finally {
      setBusy(false);
    }
  };

  const descLen = values.description.length;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && !busy && onClose()}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader className="border-b px-6 pb-4 pt-6 pr-16">
          <SheetTitle>{editing ? 'Edit product' : 'Add product'}</SheetTitle>
          <SheetDescription>{editing ? `Changing “${product.name}”` : 'It appears in the shop for everyone as soon as you save.'}</SheetDescription>
        </SheetHeader>

        <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
            {formError && (
              <div role="alert" className="flex gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-medium text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
                <p>{formError}</p>
              </div>
            )}

            <Field id="pf-name" label="Name" error={errorFor('name')}>
              <Input {...inputProps('name')} placeholder="Aurora Wireless Headphones" maxLength={120} />
            </Field>

            <Field id="pf-category" label="Category" error={errorFor('category')} hint="Pick an existing one or type a new one.">
              <Input {...inputProps('category')} list="pf-categories" placeholder="Audio" maxLength={60} />
              <datalist id="pf-categories">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </Field>

            <div className="grid gap-5 sm:grid-cols-3">
              <Field id="pf-price" label="Price (₹)" error={errorFor('price')}>
                <Input {...inputProps('price')} inputMode="decimal" placeholder="2499" />
              </Field>
              <Field id="pf-stock" label="Stock" error={errorFor('stock')}>
                <Input {...inputProps('stock')} inputMode="numeric" placeholder="25" />
              </Field>
              <Field id="pf-rating" label="Rating (0–5)" error={errorFor('rating')}>
                <Input {...inputProps('rating')} inputMode="decimal" placeholder="4.5" />
              </Field>
            </div>

            <Field id="pf-imageUrl" label="Image URL" error={errorFor('imageUrl')} hint="Leave empty to show a placeholder.">
              <Input {...inputProps('imageUrl')} type="url" placeholder="https://images.unsplash.com/photo-…" />
              {values.imageUrl.trim() && !clientErrors.imageUrl && (
                <ProductImage src={values.imageUrl.trim()} alt="Preview" className="mt-2 h-32 w-full rounded-2xl" />
              )}
            </Field>

            <Field id="pf-badge" label="Badge (optional)" error={errorFor('badge')} hint="Small label on the card, like “New” or “Deal”.">
              <Input {...inputProps('badge')} placeholder="New" maxLength={40} />
            </Field>

            <Field id="pf-description" label="Description" error={errorFor('description')}>
              <textarea
                {...inputProps('description')}
                rows={4}
                maxLength={1000}
                placeholder="What makes this product worth buying?"
                className={cn(
                  'flex w-full resize-y rounded-xl border border-input bg-card px-4 py-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground/70 focus-visible:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20 aria-[invalid=true]:border-destructive',
                )}
              />
              <p className="text-right text-xs tabular-nums text-muted-foreground">{descLen} / 1000</p>
            </Field>

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border bg-card p-4">
              <input
                type="checkbox"
                checked={values.featured}
                onChange={(e) => set('featured', e.target.checked)}
                className="mt-0.5 h-5 w-5 accent-[hsl(var(--accent))]"
              />
              <span>
                <span className="block text-sm font-bold">Feature this product</span>
                <span className="block text-xs text-muted-foreground">Shows it in the horizontal scrolling showcase on the home page.</span>
              </span>
            </label>
          </div>

          <div className="flex gap-3 border-t bg-card/60 px-6 py-5">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" className="flex-1" disabled={busy}>
              {busy ? (
                <>
                  <Loader2 className="animate-spin" /> Saving…
                </>
              ) : editing ? (
                'Save changes'
              ) : (
                'Add product'
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
