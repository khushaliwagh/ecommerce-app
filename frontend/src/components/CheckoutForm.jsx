import { useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AlertCircle, ChevronLeft, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { clearOrderError, placeOrder } from '@/features/orders/ordersSlice';
import { selectCartItems, selectCartTotal } from '@/features/cart/cartSlice';
import { FIELD_ORDER, validateAll, validateField } from '@/lib/validation';
import { cn, formatINR } from '@/lib/utils';

const EMPTY = { customerName: '', email: '', phone: '', address: '', city: '', postalCode: '' };

const FIELDS = {
  customerName: { label: 'Full name', placeholder: 'Aarav Patil', autoComplete: 'name' },
  email: { label: 'Email', type: 'email', placeholder: 'you@example.com', autoComplete: 'email' },
  phone: { label: 'Phone', type: 'tel', placeholder: '10-digit mobile', autoComplete: 'tel-national', digits: true, maxLength: 10 },
  address: { label: 'Address', placeholder: 'Flat, street, area', autoComplete: 'street-address' },
  city: { label: 'City', placeholder: 'Pune', autoComplete: 'address-level2' },
  postalCode: { label: 'PIN code', placeholder: '411001', autoComplete: 'postal-code', digits: true, maxLength: 6 },
};

function Field({ name, value, error, onChange, onBlur }) {
  const cfg = FIELDS[name];
  const id = `checkout-${name}`;
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{cfg.label}</Label>
      <Input
        id={id}
        name={name}
        type={cfg.type || 'text'}
        inputMode={cfg.digits ? 'numeric' : undefined}
        maxLength={cfg.maxLength}
        placeholder={cfg.placeholder}
        autoComplete={cfg.autoComplete}
        value={value}
        onChange={(e) => onChange(name, cfg.digits ? e.target.value.replace(/\D/g, '') : e.target.value)}
        onBlur={() => onBlur(name)}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p id={`${id}-error`} className="flex items-center gap-1.5 text-[13px] font-medium text-destructive">
          <AlertCircle className="h-3.5 w-3.5 flex-none" /> {error}
        </p>
      )}
    </div>
  );
}

export default function CheckoutForm({ onBack }) {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const { status, error, fieldErrors } = useSelector((s) => s.orders);

  const [values, setValues] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const formRef = useRef(null);

  const clientErrors = useMemo(() => validateAll(values), [values]);
  const submitting = status === 'loading';

  // Client error (once touched) wins; otherwise show whatever the server's @Valid reported.
  const errorFor = (name) => (touched[name] && clientErrors[name]) || fieldErrors[name] || '';

  const handleChange = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    if (error || Object.keys(fieldErrors).length) dispatch(clearOrderError());
  };

  const handleBlur = (name) => setTouched((t) => ({ ...t, [name]: true }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateAll(values);
    if (Object.keys(errors).length) {
      setTouched(Object.fromEntries(FIELD_ORDER.map((n) => [n, true])));
      const first = FIELD_ORDER.find((n) => errors[n]);
      formRef.current?.querySelector(`[name="${first}"]`)?.focus();
      return;
    }
    dispatch(
      placeOrder({
        customerName: values.customerName.trim(),
        email: values.email.trim(),
        phone: values.phone,
        address: values.address.trim(),
        city: values.city.trim(),
        postalCode: values.postalCode,
        items: items.map((i) => ({ productId: i.id, quantity: i.qty })),
      }),
    );
  };

  // a server error that is not tied to a field (e.g. 409 "Only 2 left of ...")
  const globalError = error && Object.keys(fieldErrors).length === 0 ? error : null;

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
        <button
          type="button"
          onClick={onBack}
          className="-ml-1 flex items-center gap-1 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" /> Back to cart
        </button>

        {globalError && (
          <div role="alert" className="flex gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-medium text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
            <p>{globalError}</p>
          </div>
        )}
        {error && !globalError && (
          <div role="alert" className="flex gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-medium text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
            <p>{error}</p>
          </div>
        )}

        <Field name="customerName" value={values.customerName} error={errorFor('customerName')} onChange={handleChange} onBlur={handleBlur} />
        <Field name="email" value={values.email} error={errorFor('email')} onChange={handleChange} onBlur={handleBlur} />
        <Field name="phone" value={values.phone} error={errorFor('phone')} onChange={handleChange} onBlur={handleBlur} />
        <Field name="address" value={values.address} error={errorFor('address')} onChange={handleChange} onBlur={handleBlur} />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field name="city" value={values.city} error={errorFor('city')} onChange={handleChange} onBlur={handleBlur} />
          <Field name="postalCode" value={values.postalCode} error={errorFor('postalCode')} onChange={handleChange} onBlur={handleBlur} />
        </div>
        {fieldErrors.items && <p className="text-sm font-medium text-destructive">{fieldErrors.items}</p>}
      </div>

      <div className="space-y-4 border-t bg-card/60 px-6 py-5">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-semibold text-muted-foreground">Total · free shipping</span>
          <span className="font-display text-3xl font-extrabold tracking-tight">{formatINR(total)}</span>
        </div>
        <Button type="submit" size="lg" variant="accent" className={cn('w-full')} disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="animate-spin" /> Placing order…
            </>
          ) : (
            <>
              <Lock /> Place order
            </>
          )}
        </Button>
        <p className="text-center text-xs text-muted-foreground">Demo checkout — no payment is taken.</p>
      </div>
    </form>
  );
}
