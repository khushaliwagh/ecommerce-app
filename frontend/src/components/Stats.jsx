import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { selectProductCount, selectTotalStock } from '@/features/products/productsSlice';

/** Counts up the first time it scrolls into view, then springs to every new live value. */
function AnimatedNumber({ value }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const source = useMotionValue(0);
  const spring = useSpring(source, { stiffness: 70, damping: 18 });
  const text = useTransform(spring, (v) => Math.round(v).toLocaleString('en-IN'));

  useEffect(() => {
    if (inView) source.set(value);
  }, [inView, value, source]);

  return <motion.span ref={ref}>{text}</motion.span>;
}

function Stat({ value, label, hint, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.2, 0.8, 0.2, 1] }}
      className="border-t border-primary-foreground/20 pt-6"
    >
      <p className="font-display text-[clamp(3.5rem,8vw,6.5rem)] font-extrabold leading-none tracking-[-0.04em] tabular-nums">
        <AnimatedNumber value={value} />
      </p>
      <p className="mt-4 text-lg font-bold">{label}</p>
      <p className="mt-1 text-sm text-primary-foreground/60">{hint}</p>
    </motion.div>
  );
}

export default function Stats() {
  const products = useSelector(selectProductCount);
  const units = useSelector(selectTotalStock);
  const purchases = useSelector((s) => s.live.purchasesSeen);

  return (
    <section id="live" className="mt-10 rounded-t-[2.5rem] bg-primary text-primary-foreground sm:rounded-t-[4rem]">
      <div className="container py-20 sm:py-28">
        <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground/60">
          <span className="h-2 w-2 animate-pulse rounded-full bg-accent" /> Live right now
        </p>
        <h2 className="mb-14 max-w-3xl font-display text-[clamp(2rem,5vw,4rem)] font-extrabold leading-[1.02] tracking-[-0.03em]">
          These numbers move while you watch. <span className="text-accent">No refresh.</span>
        </h2>
        <div className="grid gap-10 md:grid-cols-3">
          <Stat value={products} label="Products on the shelf" hint="Loaded from the Spring Boot API" delay={0} />
          <Stat value={units} label="Units in stock" hint="Drops as orders land, rises on restock" delay={0.1} />
          <Stat value={purchases} label="Purchases seen this visit" hint="Streamed to you over Server-Sent Events" delay={0.2} />
        </div>
      </div>
    </section>
  );
}
