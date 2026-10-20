// Mirrors the Bean Validation rules on the backend ProductRequest record.

const num = (v) => (v === '' || v == null ? NaN : Number(v));

export const productRules = {
  name: (v) => {
    const s = v.trim();
    if (!s) return 'Name is required';
    if (s.length < 2 || s.length > 120) return 'Name must be 2-120 characters';
    return '';
  },
  category: (v) => {
    const s = v.trim();
    if (!s) return 'Category is required';
    if (s.length < 2 || s.length > 60) return 'Category must be 2-60 characters';
    return '';
  },
  price: (v) => {
    const n = num(v);
    if (Number.isNaN(n)) return 'Price is required';
    if (n < 1) return 'Price must be at least 1';
    if (n > 9999999) return 'Price is too high';
    if (!/^\d+(\.\d{1,2})?$/.test(String(v).trim())) return 'Price can have at most 2 decimals';
    return '';
  },
  stock: (v) => {
    const n = num(v);
    if (Number.isNaN(n)) return 'Stock is required';
    if (!Number.isInteger(n)) return 'Stock must be a whole number';
    if (n < 0) return 'Stock cannot be negative';
    if (n > 100000) return 'Stock is too high';
    return '';
  },
  rating: (v) => {
    const n = num(v);
    if (Number.isNaN(n)) return 'Rating is required';
    if (n < 0 || n > 5) return 'Rating must be between 0 and 5';
    return '';
  },
  imageUrl: (v) => {
    const s = v.trim();
    if (!s) return '';
    if (s.length > 500) return 'Image URL is too long';
    if (!/^https?:\/\/\S+$/.test(s)) return 'Image must be a full http(s) URL';
    return '';
  },
  description: (v) => (v.length > 1000 ? 'Description can be at most 1000 characters' : ''),
  badge: (v) => (v.trim().length > 40 ? 'Badge can be at most 40 characters' : ''),
};

export const PRODUCT_FIELDS = ['name', 'category', 'price', 'stock', 'rating', 'imageUrl', 'badge', 'description'];

export const validateProductField = (name, value) => (productRules[name] ? productRules[name](String(value ?? '')) : '');

export function validateProduct(values) {
  const errors = {};
  PRODUCT_FIELDS.forEach((f) => {
    const message = validateProductField(f, values[f]);
    if (message) errors[f] = message;
  });
  return errors;
}

/** Form values (strings) -> request body (typed). */
export function toPayload(values) {
  return {
    name: values.name.trim(),
    category: values.category.trim(),
    price: Number(values.price),
    stock: Number(values.stock),
    rating: Number(values.rating),
    imageUrl: values.imageUrl.trim(),
    description: values.description.trim(),
    badge: values.badge.trim(),
    featured: Boolean(values.featured),
  };
}
