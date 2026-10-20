import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { ArrowLeft, LogOut, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductTable from '@/components/admin/ProductTable';
import OrdersTable from '@/components/admin/OrdersTable';
import ProductFormSheet from '@/components/admin/ProductFormSheet';
import DeleteProductDialog from '@/components/admin/DeleteProductDialog';
import {
  fetchAdminOrders,
  fetchAdminProducts,
  logout,
  saveProduct,
  selectAdminStats,
  toRequest,
} from '@/features/admin/adminSlice';
import { cn, formatINR } from '@/lib/utils';

function Stat({ label, value, tone }) {
  return (
    <div className="rounded-[1.5rem] border bg-card p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn('mt-2 font-display text-3xl font-extrabold tracking-tight tabular-nums', tone)}>{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { products, productsStatus, productsError, orders, ordersStatus, ordersError } = useSelector((s) => s.admin);
  const connection = useSelector((s) => s.live.connection);
  const catalogVersion = useSelector((s) => s.live.catalogVersion);
  const stats = useSelector(selectAdminStats);

  const [tab, setTab] = useState('products');
  const [form, setForm] = useState({ open: false, product: null });
  const [toDelete, setToDelete] = useState(null);

  // initial load, and again whenever the live stream reports a catalogue change or a reconnect
  useEffect(() => {
    dispatch(fetchAdminProducts());
    dispatch(fetchAdminOrders());
  }, [dispatch, catalogVersion]);

  const categories = useMemo(() => [...new Set(products.map((p) => p.category))].sort(), [products]);

  const restock = async (product, amount) => {
    try {
      await dispatch(saveProduct({ id: product.id, data: { ...toRequest(product), stock: product.stock + amount } })).unwrap();
      toast.success(`+${amount} stock for ${product.name}`);
    } catch (err) {
      toast.error(err?.message || 'Could not update stock');
    }
  };

  const refresh = () => {
    dispatch(fetchAdminProducts());
    dispatch(fetchAdminOrders());
  };

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <a href="#" aria-label="Back to the shop" className="grid h-9 w-9 place-items-center rounded-full hover:bg-foreground/10">
              <ArrowLeft className="h-4 w-4" />
            </a>
            <span className="font-display text-xl font-extrabold tracking-tight">Drift admin</span>
            <span className="hidden items-center gap-2 rounded-full bg-secondary px-3 py-1 text-[11px] font-bold uppercase tracking-wider sm:inline-flex">
              <span className={cn('h-2 w-2 rounded-full', connection === 'live' ? 'bg-success' : 'bg-muted-foreground')} />
              {connection === 'live' ? 'Live' : 'Offline'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={refresh} aria-label="Refresh data">
              <RefreshCw className={cn(productsStatus === 'loading' && 'animate-spin')} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button size="sm" variant="outline" onClick={() => dispatch(logout())}>
              <LogOut /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="container pt-8">
        <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-extrabold leading-none tracking-[-0.03em]">Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">Manage the catalogue and see what customers ordered. Every change goes live instantly.</p>

        <section aria-label="Summary" className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <Stat label="Products" value={stats.products} />
          <Stat label="Units in stock" value={stats.units.toLocaleString('en-IN')} />
          <Stat label="Low / out of stock" value={stats.lowStock} tone={stats.lowStock ? 'text-destructive' : undefined} />
          <Stat label="Inventory value" value={formatINR(stats.inventoryValue)} />
          <Stat label="Orders" value={stats.orders} />
          <Stat label="Revenue" value={formatINR(stats.revenue)} />
        </section>

        <div role="tablist" aria-label="Admin sections" className="mb-5 mt-10 inline-flex gap-1 rounded-full bg-secondary p-1">
          {[
            ['products', `Products (${stats.products})`],
            ['orders', `Orders (${stats.orders})`],
          ].map(([id, label]) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={cn(
                'rounded-full px-5 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                tab === id ? 'bg-primary text-primary-foreground' : 'text-foreground/70 hover:text-foreground',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'products' ? (
          productsStatus === 'failed' && products.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed px-6 py-16 text-center">
              <p className="font-semibold text-destructive">{productsError}</p>
              <Button className="mt-4" onClick={refresh}>
                Try again
              </Button>
            </div>
          ) : (
            <ProductTable
              products={products}
              categories={categories}
              loading={productsStatus === 'loading' || productsStatus === 'idle'}
              onAdd={() => setForm({ open: true, product: null })}
              onEdit={(p) => setForm({ open: true, product: p })}
              onDelete={setToDelete}
              onRestock={restock}
            />
          )
        ) : (
          <OrdersTable orders={orders} status={ordersStatus} error={ordersError} />
        )}
      </main>

      <ProductFormSheet open={form.open} product={form.product} categories={categories} onClose={() => setForm((f) => ({ ...f, open: false }))} />
      <DeleteProductDialog product={toDelete} onClose={() => setToDelete(null)} />
    </div>
  );
}
