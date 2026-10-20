import { useRef } from 'react';
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion';
import { Asterisk } from 'lucide-react';

const wrap = (min, max, v) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

const PHRASES = ['Free shipping', 'Live stock', 'New drops weekly', '7-day returns', 'Made to be kept'];

/**
 * A marquee whose speed (and direction) reacts to how fast the page is being scrolled.
 */
function MarqueeRow({ baseVelocity = -2 }) {
  const reduced = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], { clamp: false });
  const x = useTransform(baseX, (v) => `${wrap(-25, -50, v)}%`);
  const direction = useRef(1);

  useAnimationFrame((_, delta) => {
    if (reduced) return;
    let move = direction.current * baseVelocity * (delta / 1000);
    const factor = velocityFactor.get();
    if (factor < 0) direction.current = -1;
    else if (factor > 0) direction.current = 1;
    move += direction.current * move * factor;
    baseX.set(baseX.get() + move);
  });

  const copy = (
    <div className="flex shrink-0 items-center" aria-hidden="true">
      {[...PHRASES, ...PHRASES].map((text, i) => (
        <span key={i} className="flex items-center whitespace-nowrap">
          <span className="px-6 font-display text-4xl font-extrabold uppercase tracking-tight sm:text-6xl">{text}</span>
          <Asterisk className="h-8 w-8 text-accent sm:h-12 sm:w-12" strokeWidth={3} />
        </span>
      ))}
    </div>
  );

  return (
    <div className="flex overflow-hidden whitespace-nowrap">
      <motion.div style={{ x }} className="flex w-max">
        {copy}
        {copy}
        {copy}
        {copy}
      </motion.div>
    </div>
  );
}

export default function VelocityMarquee() {
  return (
    <section aria-label="Shop highlights" className="relative overflow-hidden py-10">
      <div className="-rotate-2 scale-[1.04] space-y-2 bg-primary py-5 text-primary-foreground shadow-xl">
        <MarqueeRow baseVelocity={-2.2} />
        <MarqueeRow baseVelocity={2.2} />
      </div>
    </section>
  );
}
