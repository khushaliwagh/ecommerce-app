import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import ProductImage from '@/components/ProductImage';
import CheckoutForm from '@/components/CheckoutForm';
import {
  closeCart,
  MAX_PER_ITEM,
  openCart,
  removeItem,
  selectCartCount,
  selectCartHasStockIssue,
  selectCartItems,
  selectCartTotal,
  setQty,
} from '@/features/cart/cartSlice';
import { resetOrder } from '@/features/orders/ordersSlice';
import { formatINR } from '@/lib/utils';

const stepMotion = {
  initial: { opacity: 0, x: 28 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -28 },
  transition: { duration: 0.25, ease: [0.2, 0.8, 0.2, 1] },
};

function CartLine({ item }) {
  const dispatch = useDispatch();
  const max = Math.min(MAX_PER_ITEM, item.stock);
  const short = item.qty > item.stock;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40 }}
      className="flex gap-4 py-5"
    >
      <ProductImage src={item.imageUrl} alt={item.name} className="h-20 w-20 flex-none rounded-2xl" />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-bold leading-snug">{item.name}</h3>
          <button
            type="button"
            onClick={() => dispatch(removeItem(item.id))}
            aria-label={`Remove ${item.name}`}
            className="-mr-1 grid h-8 w-8 flex-none place-items-center rounded-full text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">{formatINR(item.price)}</p>

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center rounded-full border border-input bg-card">
            <button
              type="button"
              aria-label={`Decrease quantity of ${item.name}`}
              disabled={item.qty <= 1}
              onClick={() => dispatch(setQty({ id: item.id, qty: item.qty - 1 }))}
              className="grid h-8 w-8 place-items-center rounded-full transition hover:bg-foreground/10 disabled:opacity-30"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-7 text-center text-sm font-bold tabular-nums" aria-live="polite">
              {item.qty}
            </span>
            <button
              type="button"
              aria-label={`Increase quantity of ${item.name}`}
              disabled={item.qty >= max}
              onClick={() => dispatch(setQty({ id: item.id, qty: item.qty + 1 }))}
              className="grid h-8 w-8 place-items-center rounded-full transition hover:bg-foreground/10 disabled:opacity-30"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="font-bold tabular-nums">{formatINR(item.price * item.qty)}</p>
        </div>

        {short && (
          <p className="mt-2 flex items-center gap-1.5 text-[13px] font-semibold text-destructive">
            <AlertCircle className="h-3.5 w-3.5" />
            {item.stock === 0 ? 'Just sold out — remove to continue' : `Only ${item.stock} left — reduce quantity`}
          </p>
        )}
      </div>
    </motion.li>
  );
}

function CartStep({ onCheckout }) {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const hasStockIssue = useSelector(selectCartHasStockIssue);

  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
        <span className="grid h-20 w-20 place-items-center rounded-full bg-secondary">
          <ShoppingBag className="h-9 w-9 text-muted-foreground" />
        </span>
        <p className="font-display text-2xl font-bold">Your cart is empty</p>
        <p className="max-w-xs text-sm text-muted-foreground">Add something from the shelf — stock updates live, so don&apos;t wait too long.</p>
        <Button variant="outline" onClick={() => dispatch(closeCart())}>
          Keep browsing
        </Button>
      </div>
    );
  }

  return (
    <>
      <ul className="min-h-0 flex-1 divide-y overflow-y-auto px-6">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <CartLine key={item.id} item={item} />
          ))}
        </AnimatePresence>
      </ul>
      <div className="space-y-4 border-t bg-card/60 px-6 py-5">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-semibold text-muted-foreground">Subtotal · free shipping</span>
          <span className="font-display text-3xl font-extrabold tracking-tight">{formatINR(total)}</span>
        </div>
        <Button size="lg" className="w-full" disabled={hasStockIssue} onClick={onCheckout}>
          Checkout <ArrowRight />
        </Button>
        {hasStockIssue && (
          <p className="text-center text-xs font-medium text-destructive">Fix the highlighted items to continue.</p>
        )}
      </div>
    </>
  );
}

function SuccessStep({ order, onDone }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
      <motion.svg
        viewBox="0 0 80 80"
        className="h-24 w-24"
        initial="hidden"
        animate="visible"
        aria-hidden="true"
      >
        <motion.circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke="hsl(var(--accent))"
          strokeWidth="6"
          variants={{ hidden: { pathLength: 0 }, visible: { pathLength: 1 } }}
          transition={{ duration: 0.6 }}
        />
        <motion.path
          d="M24 41 l11 11 l22 -24"
          fill="none"
          stroke="hsl(var(--foreground))"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={{ hidden: { pathLength: 0 }, visible: { pathLength: 1 } }}
          transition={{ duration: 0.45, delay: 0.5 }}
        />
      </motion.svg>
      <div>
        <p className="font-display text-3xl font-extrabold tracking-tight">Order placed!</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Order <span className="font-bold text-foreground">#{order.id}</span> · {formatINR(order.total)}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">Confirmation for {order.email}</p>
      </div>
      <ul className="w-full max-w-xs space-y-1 rounded-2xl border bg-card p-4 text-left text-sm">
        {order.items.map((l) => (
          <li key={l.productId} className="flex justify-between gap-3">
            <span className="truncate">{l.quantity} × {l.productName}</span>
            <span className="font-semibold tabular-nums">{formatINR(l.unitPrice * l.quantity)}</span>
          </li>
        ))}
      </ul>
      <Button size="lg" onClick={onDone}>
        Continue shopping
      </Button>
    </div>
  );
}

export default function CartSheet() {
  const dispatch = useDispatch();
  const open = useSelector((s) => s.cart.isOpen);
  const count = useSelector(selectCartCount);
  const lastOrder = useSelector((s) => s.orders.lastOrder);
  const [step, setStep] = useState('cart'); // cart | checkout | done
  const resetTimer = useRef();

  // successful order -> show the confirmation
  useEffect(() => {
    if (lastOrder) setStep('done');
  }, [lastOrder]);

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const handleOpenChange = (next) => {
    if (next) {
      dispatch(openCart());
      return;
    }
    dispatch(closeCart());
    // reset after the close animation so the content doesn't jump
    resetTimer.current = setTimeout(() => {
      setStep('cart');
      dispatch(resetOrder());
    }, 350);
  };

  const finish = () => handleOpenChange(false);

  const title = step === 'checkout' ? 'Delivery details' : step === 'done' ? 'Thank you' : 'Your cart';
  const description =
    step === 'checkout'
      ? 'Where should we send your order?'
      : step === 'done'
        ? 'Your order has been recorded.'
        : count > 0
          ? `${count} ${count === 1 ? 'item' : 'items'} ready to go`
          : 'Nothing here yet';

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent>
        <SheetHeader className="border-b px-6 pb-4 pt-6 pr-16">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={step} {...stepMotion} className="flex min-h-0 flex-1 flex-col">
            {step === 'cart' && <CartStep onCheckout={() => setStep('checkout')} />}
            {step === 'checkout' && <CheckoutForm onBack={() => setStep('cart')} />}
            {step === 'done' && lastOrder && <SuccessStep order={lastOrder} onDone={finish} />}
          </motion.div>
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
}
