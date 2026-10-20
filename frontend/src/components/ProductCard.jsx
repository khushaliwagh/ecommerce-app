import { forwardRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Plus, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ProductImage from '@/components/ProductImage';
import LiveStock from '@/components/LiveStock';
import { useAddToCart } from '@/hooks/useAddToCart';
import { formatINR } from '@/lib/utils';

const ProductCard = forwardRef(function ProductCard({ product, index }, ref) {
  const addToCart = useAddToCart();
  const [added, setAdded] = useState(false);
  const soldOut = product.stock < 1;

  useEffect(() => {
    if (!added) return undefined;
    const t = setTimeout(() => setAdded(false), 1300);
    return () => clearTimeout(t);
  }, [added]);

  const handleAdd = () => {
    if (addToCart(product)) setAdded(true);
  };

  return (
    <motion.article
      ref={ref}
      layout
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94 }}
      viewport={{ once: true, margin: '0px 0px -60px 0px' }}
      transition={{ duration: 0.55, delay: (index % 4) * 0.07, ease: [0.2, 0.8, 0.2, 1] }}
      className="group flex flex-col overflow-hidden rounded-[1.5rem] border bg-card transition-shadow duration-300 hover:shadow-xl hover:shadow-foreground/10"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          className={`h-full w-full transition-transform duration-700 group-hover:scale-110 ${soldOut ? 'grayscale' : ''}`}
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          {product.badge ? <Badge variant="accent">{product.badge}</Badge> : <span />}
          <LiveStock stock={product.stock} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-1 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <span>{product.category}</span>
          <span className="flex items-center gap-1 normal-case tracking-normal text-foreground">
            <Star className="h-3.5 w-3.5 fill-accent text-accent" /> {product.rating.toFixed(1)}
          </span>
        </div>
        <h3 className="font-display text-xl font-bold leading-snug tracking-tight">{product.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <p className="font-display text-2xl font-extrabold tracking-tight">{formatINR(product.price)}</p>
          <Button
            size="sm"
            variant={added ? 'accent' : 'default'}
            disabled={soldOut}
            onClick={handleAdd}
            aria-label={`Add ${product.name} to cart`}
          >
            {soldOut ? (
              'Sold out'
            ) : added ? (
              <>
                <Check /> Added
              </>
            ) : (
              <>
                <Plus /> Add
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.article>
  );
});

export default ProductCard;
