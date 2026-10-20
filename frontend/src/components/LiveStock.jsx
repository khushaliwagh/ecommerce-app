import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Stock pill that reacts to live updates: it rings green when stock goes up
 * and red when it goes down, then settles.
 */
export default function LiveStock({ stock, className }) {
  const previous = useRef(stock);
  const [change, setChange] = useState(null);

  useEffect(() => {
    if (previous.current === stock) return undefined;
    setChange(stock < previous.current ? 'down' : 'up');
    previous.current = stock;
    const t = setTimeout(() => setChange(null), 1500);
    return () => clearTimeout(t);
  }, [stock]);

  const soldOut = stock <= 0;
  const low = stock > 0 && stock <= 5;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-card/95 px-2.5 py-1 text-[11px] font-bold text-foreground shadow-sm ring-2 ring-transparent transition-shadow duration-500',
        change === 'down' && 'ring-destructive/70',
        change === 'up' && 'ring-success/70',
        className,
      )}
      aria-live="polite"
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          soldOut ? 'bg-destructive' : low ? 'animate-pulse bg-accent' : 'bg-success',
        )}
      />
      {soldOut ? 'Sold out' : low ? `Only ${stock} left` : `${stock} in stock`}
    </span>
  );
}
