import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCw, Search, SearchX, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/ProductCard';
import { fetchProducts, selectGridProducts, setFilters } from '@/features/products/productsSlice';
import { cn } from '@/lib/utils';

const SORTS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Top rated' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
];

function useDebounced(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function GridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-[1.5rem] border bg-card">
          <Skeleton className="aspect-square rounded-none" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProductGrid() {
  const dispatch = useDispatch();
  const products = useSelector(selectGridProducts);
  const { status, error, filters, categories } = useSelector((s) => s.products);

  const [query, setQuery] = useState(filters.q);
  const debouncedQuery = useDebounced(query);

  // search box -> filters (debounced)
  useEffect(() => {
    if (debouncedQuery !== filters.q) dispatch(setFilters({ q: debouncedQuery }));
  }, [debouncedQuery, filters.q, dispatch]);

  // any filter change -> async thunk -> GET /api/products?...
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch, filters.category, filters.q, filters.sort]);

  const chips = ['', ...categories];
  const showSkeleton = (status === 'idle' || status === 'loading') && products.length === 0;

  return (
    <section id="shop" className="container py-20 sm:py-28">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        className="mb-10 flex flex-wrap items-end justify-between gap-6"
      >
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">The full shelf</p>
          <h2 className="font-display text-[clamp(2.25rem,5vw,4.5rem)] font-extrabold leading-none tracking-[-0.035em]">
            Everything in stock
          </h2>
        </div>
        <p className="text-sm font-medium text-muted-foreground" aria-live="polite">
          {status === 'succeeded' || products.length > 0
            ? `${products.length} ${products.length === 1 ? 'product' : 'products'}`
            : ' '}
        </p>
      </motion.div>

      {/* toolbar */}
      <div className="sticky top-[4.5rem] z-30 -mx-2 mb-8 rounded-3xl border bg-background/85 p-3 shadow-sm backdrop-blur-xl">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative lg:w-72">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products"
              aria-label="Search products"
              className="pl-11 pr-10"
              maxLength={60}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full hover:bg-foreground/10"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="-mx-1 flex flex-1 gap-1 overflow-x-auto px-1 pb-1 lg:pb-0" role="tablist" aria-label="Categories">
            {chips.map((c) => {
              const active = filters.category === c;
              return (
                <button
                  key={c || 'all'}
                  role="tab"
                  aria-selected={active}
                  onClick={() => dispatch(setFilters({ category: c }))}
                  className={cn(
                    'relative whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    active ? 'text-primary-foreground' : 'text-foreground/70 hover:bg-foreground/10',
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="category-pill"
                      className="absolute inset-0 rounded-full bg-primary"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    />
                  )}
                  <span className="relative">{c || 'All'}</span>
                </button>
              );
            })}
          </div>

          <label className="flex items-center gap-2 text-sm font-semibold">
            <span className="sr-only lg:not-sr-only lg:text-muted-foreground">Sort</span>
            <select
              value={filters.sort}
              onChange={(e) => dispatch(setFilters({ sort: e.target.value }))}
              className="h-11 rounded-xl border border-input bg-card px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* results */}
      {showSkeleton ? (
        <GridSkeleton />
      ) : status === 'failed' && products.length === 0 ? (
        <div className="grid place-items-center rounded-[2rem] border border-dashed border-foreground/25 px-6 py-20 text-center">
          <p className="font-display text-2xl font-bold">We couldn&apos;t load the shelf</p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">{error}</p>
          <Button className="mt-6" onClick={() => dispatch(fetchProducts())}>
            <RefreshCw /> Try again
          </Button>
        </div>
      ) : products.length === 0 ? (
        <div className="grid place-items-center rounded-[2rem] border border-dashed border-foreground/25 px-6 py-20 text-center">
          <SearchX className="mb-4 h-10 w-10 text-muted-foreground" />
          <p className="font-display text-2xl font-bold">Nothing matches that</p>
          <p className="mt-2 text-sm text-muted-foreground">Try a different search or category.</p>
          <Button
            variant="outline"
            className="mt-6"
            onClick={() => {
              setQuery('');
              dispatch(setFilters({ q: '', category: '' }));
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  );
}
