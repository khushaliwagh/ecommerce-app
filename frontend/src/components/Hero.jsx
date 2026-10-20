import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, RotateCcw, Truck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductImage from '@/components/ProductImage';
import { cn } from '@/lib/utils';

const photo = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`;

// Hero imagery is static so the landing view looks right even before the API responds.
const STAGE = [
  { id: '1505740420928-5e560c06d30e', alt: 'Over-ear wireless headphones', pos: 'left-0 top-[2%] w-[52%]', rot: -7, depth: -90 },
  { id: '1523275335684-37898b6baf30', alt: 'Smartwatch on a wrist', pos: 'right-0 top-[20%] w-[44%]', rot: 6, depth: -230 },
  { id: '1542291026-7eec264c27ff', alt: 'Red running shoe', pos: 'bottom-0 left-[20%] w-[46%]', rot: -3, depth: -150 },
];

function Line({ children, delay = 0 }) {
  return (
    <span className="block overflow-hidden pb-[0.1em]">
      <motion.span
        className="block"
        initial={{ y: '110%' }}
        animate={{ y: 0 }}
        transition={{ duration: 0.9, delay, ease: [0.2, 0.8, 0.2, 1] }}
      >
        {children}
      </motion.span>
    </span>
  );
}

function StageCard({ item, index, progress }) {
  const y = useTransform(progress, [0, 1], [0, item.depth]);
  const rotate = useTransform(progress, [0, 1], [item.rot, item.rot * -2]);

  return (
    <motion.div
      style={{ y, rotate }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5 + index * 0.15, type: 'spring', stiffness: 90, damping: 16 }}
      className={cn('absolute', item.pos)}
    >
      <div className="aspect-[4/5] overflow-hidden rounded-[1.75rem] border-4 border-card bg-card shadow-2xl shadow-foreground/20">
        <ProductImage src={photo(item.id)} alt={item.alt} className="h-full w-full" />
      </div>
    </motion.div>
  );
}

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });

  const textY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const orbScale = useTransform(scrollYProgress, [0, 1], [0.85, 1.5]);

  return (
    <section id="top" ref={ref} className="relative overflow-hidden pb-24 pt-28 sm:pt-32 lg:pb-32">
      <div className="container grid items-center gap-12 lg:grid-cols-12">
        <motion.div style={{ y: textY, opacity: textOpacity }} className="lg:col-span-7">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-foreground/20 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em]"
          >
            <span className="h-2 w-2 rounded-full bg-accent" /> Autumn drop · live inventory
          </motion.p>

          <h1 className="font-display text-[clamp(3.4rem,9.4vw,8rem)] font-extrabold leading-[0.9] tracking-[-0.04em]">
            <Line delay={0.2}>Objects</Line>
            <Line delay={0.32}>worth the</Line>
            <Line delay={0.44}>
              <span className="relative inline-block">
                <motion.span
                  aria-hidden="true"
                  className="absolute -inset-x-[0.06em] bottom-[0.06em] top-[0.22em] origin-left rounded-full bg-accent"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1, duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
                />
                <span className="relative">scroll.</span>
              </span>
            </Line>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="mt-8 max-w-md text-lg leading-relaxed text-muted-foreground text-balance"
          >
            A small, considered shelf of things people keep. Scroll to explore — stock changes on screen as other
            shoppers buy.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Button asChild size="lg">
              <a href="#shop">
                Shop the drop <ArrowRight />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#featured">See featured</a>
            </Button>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-foreground/70"
          >
            <li className="flex items-center gap-2"><Zap className="h-4 w-4 text-accent" /> Real-time stock</li>
            <li className="flex items-center gap-2"><Truck className="h-4 w-4 text-accent" /> Free shipping</li>
            <li className="flex items-center gap-2"><RotateCcw className="h-4 w-4 text-accent" /> 7-day returns</li>
          </motion.ul>
        </motion.div>

        <div className="relative mx-auto h-[420px] w-full max-w-[440px] sm:h-[520px] sm:max-w-[520px] lg:col-span-5 lg:h-[620px] lg:max-w-none">
          <div className="absolute inset-0 grid place-items-center">
            <motion.div
              aria-hidden="true"
              style={{ scale: orbScale }}
              className="aspect-square w-[82%] rounded-full bg-accent"
            />
          </div>
          {STAGE.map((item, i) => (
            <StageCard key={item.id} item={item} index={i} progress={scrollYProgress} />
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-6 hidden justify-center lg:flex" aria-hidden="true">
        <div className="flex flex-col items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/60">
          Scroll
          <span className="relative h-10 w-px overflow-hidden bg-foreground/20">
            <span className="absolute inset-0 animate-scroll-cue bg-foreground" />
          </span>
        </div>
      </div>
    </section>
  );
}
