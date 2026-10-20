import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

const TEXT =
  'We stock fewer things, and we count every one. Each drop is small, each unit is real, and the shelf rewrites itself the moment someone else gets there first.';

// words that get the accent underline once they light up
const HIGHLIGHT = new Set(['count', 'real,', 'rewrites']);

function Word({ word, progress, range }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  const lit = HIGHLIGHT.has(word);

  return (
    <span className="relative mr-[0.28em] inline-block">
      <motion.span style={{ opacity }} className={cn('relative z-10 inline-block', lit && 'text-foreground')}>
        {word}
      </motion.span>
      {lit && (
        <motion.span
          aria-hidden="true"
          style={{ opacity }}
          className="absolute inset-x-0 bottom-[0.06em] h-[0.16em] rounded-full bg-accent"
        />
      )}
    </span>
  );
}

/** Text that "lights up" word by word as the section scrolls through the viewport. */
export default function Manifesto() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.55'] });
  const words = TEXT.split(' ');

  return (
    <section ref={ref} className="container py-24 sm:py-36">
      <p className="mb-8 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">The idea</p>
      <p className="max-w-5xl font-display text-[clamp(2rem,5.2vw,4.5rem)] font-bold leading-[1.08] tracking-[-0.03em]">
        {words.map((word, i) => {
          const start = i / words.length;
          const end = start + 1 / words.length;
          return <Word key={i} word={word} progress={scrollYProgress} range={[start, end]} />;
        })}
      </p>
    </section>
  );
}
