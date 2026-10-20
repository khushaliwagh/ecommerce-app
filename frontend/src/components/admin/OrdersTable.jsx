import { Fragment, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Inbox } from 'lucide-react';
import { cn, formatINR } from '@/lib/utils';

const fmt = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

export default function OrdersTable({ orders, status, error }) {
  const [open, setOpen] = useState(null);

  if (status === 'failed') {
    return <p className="rounded-[1.5rem] border border-dashed px-6 py-16 text-center text-sm text-destructive">{error}</p>;
  }
  if (orders.length === 0) {
    return (
      <div className="grid place-items-center gap-3 rounded-[1.5rem] border border-dashed px-6 py-16 text-center text-sm text-muted-foreground">
        <Inbox className="h-8 w-8" />
        {status === 'loading' || status === 'idle' ? 'Loading orders…' : 'No orders yet. They show up here when customers check out.'}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[1.5rem] border bg-card">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <th className="px-4 py-3">Order</th>
            <th className="px-4 py-3">Placed</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">City</th>
            <th className="px-4 py-3">Items</th>
            <th className="px-4 py-3 text-right">Total</th>
            <th className="w-10 px-2 py-3" />
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => {
            const isOpen = open === o.id;
            return (
              <Fragment key={o.id}>
                <tr className="cursor-pointer border-b hover:bg-muted/40" onClick={() => setOpen(isOpen ? null : o.id)}>
                  <td className="px-4 py-3 font-bold">#{o.id}</td>
                  <td className="px-4 py-3 text-muted-foreground">{fmt.format(new Date(o.createdAt))}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{o.customerName}</p>
                    <p className="text-xs text-muted-foreground">{o.email}</p>
                  </td>
                  <td className="px-4 py-3">{o.city}</td>
                  <td className="px-4 py-3 tabular-nums">{o.items.reduce((n, i) => n + i.quantity, 0)}</td>
                  <td className="px-4 py-3 text-right font-bold tabular-nums">{formatINR(o.total)}</td>
                  <td className="px-2 py-3">
                    <button type="button" aria-label={isOpen ? 'Hide details' : 'Show details'} aria-expanded={isOpen} className="grid h-8 w-8 place-items-center rounded-full hover:bg-foreground/10">
                      <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
                    </button>
                  </td>
                </tr>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <tr className="border-b bg-muted/30">
                      <td colSpan={7} className="p-0">
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="grid gap-6 px-6 py-5 sm:grid-cols-2">
                            <div>
                              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Deliver to</p>
                              <p className="font-semibold">{o.customerName}</p>
                              <p>{o.address}</p>
                              <p>
                                {o.city} {o.postalCode}
                              </p>
                              <p className="mt-1 text-muted-foreground">
                                {o.phone} · {o.email}
                              </p>
                            </div>
                            <div>
                              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Items</p>
                              <ul className="space-y-1">
                                {o.items.map((i) => (
                                  <li key={i.productId} className="flex justify-between gap-4">
                                    <span>
                                      {i.quantity} × {i.productName}
                                    </span>
                                    <span className="font-semibold tabular-nums">{formatINR(i.unitPrice * i.quantity)}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </motion.div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
