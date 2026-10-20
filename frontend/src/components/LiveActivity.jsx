import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { PackageCheck } from 'lucide-react';

/** Brief toast-like pill announcing the latest purchase streamed from the server. */
export default function LiveActivity() {
  const latest = useSelector((s) => s.live.feed[0]);
  const [visibleId, setVisibleId] = useState(null);

  useEffect(() => {
    if (!latest) return undefined;
    setVisibleId(latest.id);
    const t = setTimeout(() => setVisibleId(null), 5500);
    return () => clearTimeout(t);
  }, [latest]);

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-40 max-w-[calc(100vw-2rem)] sm:bottom-6 sm:left-6">
      <AnimatePresence>
        {latest && visibleId === latest.id && (
          <motion.div
            key={latest.id}
            role="status"
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="flex items-center gap-3 rounded-2xl border bg-card py-2.5 pl-2.5 pr-5 shadow-xl shadow-foreground/10"
          >
            <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-accent text-accent-foreground">
              <PackageCheck className="h-5 w-5" />
            </span>
            <p className="text-sm leading-snug">
              <span className="font-bold">Someone in {latest.city}</span> just bought
              <br />
              <span className="text-muted-foreground">
                {latest.quantity > 1 ? `${latest.quantity} × ` : ''}
                {latest.productName}
              </span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
