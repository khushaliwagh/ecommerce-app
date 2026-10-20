import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { openCart, selectCartCount } from '@/features/cart/cartSlice';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '#featured', label: 'Featured' },
  { href: '#shop', label: 'Shop' },
  { href: '#live', label: 'Live' },
];

function LiveDot() {
  const connection = useSelector((s) => s.live.connection);
  const live = connection === 'live';
  return (
    <span
      className="hidden items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider sm:inline-flex"
      title={live ? 'Receiving live stock updates' : 'Reconnecting to live updates'}
    >
      <span className="relative flex h-2 w-2">
        {live && <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-success" />}
        <span className={cn('relative inline-flex h-2 w-2 rounded-full', live ? 'bg-success' : 'bg-muted-foreground')} />
      </span>
      {live ? 'Live' : connection === 'connecting' ? 'Connecting' : 'Offline'}
    </span>
  );
}

export default function Navbar() {
  const dispatch = useDispatch();
  const count = useSelector(selectCartCount);
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 48));

  return (
    <motion.header
      initial={{ y: -90, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
      className="fixed inset-x-0 top-0 z-40 px-3 pt-3"
    >
      <motion.nav
        aria-label="Main"
        animate={{ maxWidth: scrolled ? 880 : 1240 }}
        transition={{ type: 'spring', stiffness: 160, damping: 24 }}
        className={cn(
          'mx-auto flex items-center justify-between rounded-full border px-3 transition-[background-color,box-shadow,height,border-color] duration-300 sm:px-4',
          scrolled
            ? 'h-14 border-border bg-background/80 shadow-lg shadow-foreground/5 backdrop-blur-xl'
            : 'h-16 border-transparent bg-transparent',
        )}
      >
        <a href="#top" className="flex items-center gap-2 font-display text-2xl font-extrabold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary">
            <span className="h-3 w-3 rounded-full bg-accent" />
          </span>
          Drift
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:bg-foreground/10 hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <LiveDot />
          <Button size="sm" onClick={() => dispatch(openCart())} aria-label={`Open cart, ${count} items`}>
            <ShoppingBag />
            <span className="hidden sm:inline">Cart</span>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={count}
                initial={{ scale: 1.7, y: -6, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                className="grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-bold text-accent-foreground"
              >
                {count}
              </motion.span>
            </AnimatePresence>
          </Button>
        </div>
      </motion.nav>
    </motion.header>
  );
}
