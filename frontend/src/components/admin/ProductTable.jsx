import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PackagePlus, Pencil, Search, Star, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProductImage from '@/components/ProductImage';
import { LOW_STOCK } from '@/features/admin/adminSlice';
import { cn, formatINR } from '@/lib/utils';

function StockCell({ stock }) {
  const out = stock <= 0;
  const low = !out && stock <= LOW_STOCK;
  return (
    <span className={cn('inline-flex items-center gap-2 font-bold tabular-nums', out ? 'text-destructive' : low ? 'text-[hsl(24_90%_38%)]' : 'text-success')}>
      <span className={cn('h-2 w-2 rounded-full', out ? 'bg-destructive' : low ? 'bg-accent' : 'bg-success')} />
      {stock}
      {out && <span className="text-xs font-semibold">sold out</span>}
      {low && <span className="text-xs font-semibold">low</span>}
    </span>
  );
}

export default function ProductTable({ products, categories, loading, onAdd, onEdit, onDelete, onRestock }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [lowOnly, setLowOnly] = useState(false);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) =>
        (!category || p.category === category) &&
        (!lowOnly || p.stock <= LOW_STOCK) &&
        (!q || p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q)),
    );
  }, [products, query, category, lowOnly]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative lg:w-72">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products" aria-label="Search products" className="pl-11" />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by category"
          className="h-11 rounded-xl border border-input bg-card px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={lowOnly} onChange={(e) => setLowOnly(e.target.checked)} className="h-4 w-4 accent-[hsl(var(--accent))]" />
          Low stock only
        </label>
        <Button className="lg:ml-auto" variant="accent" onClick={onAdd}>
          <PackagePlus /> Add product
        </Button>
      </div>

      <div className="overflow-x-auto rounded-[1.5rem] border bg-card">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {rows.map((p) => (
                <motion.tr
                  key={p.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="border-b last:border-b-0 hover:bg-muted/40"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <ProductImage src={p.imageUrl} alt={p.name} className="h-12 w-12 flex-none rounded-xl" />
                      <div className="min-w-0">
                        <p className="truncate font-bold">{p.name}</p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                          <span className="text-xs text-muted-foreground">#{p.id}</span>
                          {p.featured && <Badge variant="accent">Featured</Badge>}
                          {p.badge && <Badge variant="outline">{p.badge}</Badge>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                  <td className="px-4 py-3 text-right font-bold tabular-nums">{formatINR(p.price)}</td>
                  <td className="px-4 py-3">
                    <StockCell stock={p.stock} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 font-semibold">
                      <Star className="h-3.5 w-3.5 fill-accent text-accent" /> {p.rating.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="secondary" onClick={() => onRestock(p, 10)} aria-label={`Add 10 stock to ${p.name}`}>
                        +10
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => onEdit(p)} aria-label={`Edit ${p.name}`}>
                        <Pencil />
                      </Button>
                      <Button size="icon" variant="ghost" className="hover:bg-destructive/10 hover:text-destructive" onClick={() => onDelete(p)} aria-label={`Delete ${p.name}`}>
                        <Trash2 />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>

        {rows.length === 0 && (
          <p className="px-6 py-16 text-center text-sm text-muted-foreground">
            {loading ? 'Loading products…' : products.length === 0 ? 'No products yet. Add your first one.' : 'No products match those filters.'}
          </p>
        )}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Showing {rows.length} of {products.length}. Stock numbers update live as customers buy.
      </p>
    </div>
  );
}
