import { useLayoutEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from 'framer-motion';
import { Plus, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import ProductImage from '@/components/ProductImage';
import LiveStock from '@/components/LiveStock';
import { useAddToCart } from '@/hooks/useAddToCart';
import { selectFeaturedProducts } from '@/features/products/productsSlice';
import { formatINR } from '@/lib/utils';

const CARD = 'relative aspect-[4/5] h-[58vh] max-h-[560px] flex-none overflow-hidden rounded-[2rem]';

function FeaturedCard({ product, index, onAdd }) {
  return (
    <article className={`${CARD} group bg-card shadow-xl shadow-foreground/10`}>
      <ProductImage
        src={product.imageUrl}
        alt={product.name}
        className="absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-5">
        <div className="flex gap-2">
          <span className="grid h-7 min-w-7 place-items-center rounded-full bg-card/95 px-2 text-[11px] font-bold">
            {String(index + 1).padStart(2, '0')}
          </span>
          {product.badge && <Badge variant="accent">{product.badge}</Badge>}
        </div>
        <LiveStock stock={product.stock} />
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-white">
        <div className="min-w-0">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">{product.category}</p>
          <h3 className="font-display text-2xl font-extrabold leading-tight tracking-tight">{product.name}</h3>
          <p className="mt-2 flex items-center gap-3 text-sm">
            <span className="text-lg font-bold">{formatINR(product.price)}</span>
            <span className="flex items-center gap-1 text-white/80">
              <Star className="h-3.5 w-3.5 fill-accent text-accent" /> {product.rating.toFixed(1)}
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => onAdd(product)}
          disabled={product.stock < 1}
          aria-label={`Add ${product.name} to cart`}
          className="grid h-12 w-12 flex-none place-items-center rounded-full bg-accent text-accent-foreground transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white active:scale-95 disabled:opacity-40"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
    </article>
  );
}

/**
 * Pinned section: vertical scrolling drives a horizontal track of featured products.
 * The section is exactly as tall as the horizontal distance + one viewport, so the
 * sideways motion tracks the scroll wheel 1:1.
 */
export default function FeaturedShowcase() {
  const items = useSelector(selectFeaturedProducts);
  const status = useSelector((s) => s.products.featuredStatus);
  const addToCart = useAddToCart();

  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const [shift, setShift] = useState(0);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });
  const x = useTransform(smooth, [0, 1], [0, -shift]);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const n = Math.max(items.length, 1);
    setActive(Math.min(n - 1, Math.round(v * (n - 1))));
  });

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    const measure = () => setShift(Math.max(0, track.scrollWidth - document.documentElement.clientWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [items.length, status]);

  const loading = status === 'idle' || status === 'loading';
  const failed = status === 'failed';

  return (
    <section
      id="featured"
      ref={sectionRef}
      style={{ height: `calc(100vh + ${shift}px)` }}
      className="relative"
    >
      <div className="sticky top-0 flex h-screen flex-col justify-center gap-8 overflow-hidden pt-16">
        <div className="container flex items-end justify-between gap-6">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Featured drops</p>
            <h2 className="font-display text-[clamp(2rem,4.5vw,3.75rem)] font-extrabold leading-none tracking-[-0.03em]">
              Keep scrolling.
              <br />
              <span className="text-outline">It moves sideways.</span>
            </h2>
          </div>
          {items.length > 0 && (
            <div className="hidden text-right sm:block">
              <p className="font-display text-5xl font-extrabold tabular-nums tracking-tight">
                {String(active + 1).padStart(2, '0')}
                <span className="text-2xl text-muted-foreground"> / {String(items.length).padStart(2, '0')}</span>
              </p>
            </div>
          )}
        </div>

        <div className="relative">
          <motion.div ref={trackRef} style={{ x }} className="flex w-max gap-6 px-[max(1.25rem,5vw)]">
            {items.map((p, i) => (
              <FeaturedCard key={p.id} product={p} index={i} onAdd={addToCart} />
            ))}
            {loading && items.length === 0 &&
              [0, 1, 2, 3].map((i) => <Skeleton key={i} className={`${CARD} rounded-[2rem]`} />)}
            {failed && items.length === 0 && (
              <div className={`${CARD} grid place-items-center border border-dashed border-foreground/25 p-8 text-center text-muted-foreground`}>
                Couldn&apos;t load featured drops. Is the API running?
              </div>
            )}
          </motion.div>
        </div>

        <div className="container">
          <div className="h-1 w-full overflow-hidden rounded-full bg-foreground/10">
            <motion.div style={{ scaleX: scrollYProgress }} className="h-full origin-left bg-accent" />
          </div>
        </div>
      </div>
    </section>
  );
}
