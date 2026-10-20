// Frontend validation. These rules deliberately mirror the Bean Validation
// annotations on the Spring Boot OrderRequest record, so users get instant feedback
// while the server remains the source of truth.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const rules = {
  customerName: (v) => {
    const s = v.trim();
    if (!s) return 'Full name is required';
    if (s.length < 2 || s.length > 80) return 'Name must be 2-80 characters';
    return '';
  },
  email: (v) => {
    const s = v.trim();
    if (!s) return 'Email is required';
    if (s.length > 120) return 'Email is too long';
    if (!EMAIL.test(s)) return 'Enter a valid email address';
    return '';
  },
  phone: (v) => {
    if (!v) return 'Phone is required';
    if (!/^[0-9]{10}$/.test(v)) return 'Phone must be exactly 10 digits';
    return '';
  },
  address: (v) => {
    const s = v.trim();
    if (!s) return 'Address is required';
    if (s.length < 5 || s.length > 200) return 'Address must be 5-200 characters';
    return '';
  },
  city: (v) => {
    const s = v.trim();
    if (!s) return 'City is required';
    if (s.length < 2 || s.length > 60) return 'City must be 2-60 characters';
    return '';
  },
  postalCode: (v) => {
    if (!v) return 'PIN code is required';
    if (!/^[0-9]{6}$/.test(v)) return 'PIN code must be 6 digits';
    return '';
  },
};

export const FIELD_ORDER = ['customerName', 'email', 'phone', 'address', 'city', 'postalCode'];

export function validateField(name, value) {
  return rules[name] ? rules[name](value) : '';
}

/** Returns an object containing only the fields that have an error. */
export function validateAll(values) {
  const errors = {};
  FIELD_ORDER.forEach((name) => {
    const message = validateField(name, values[name] ?? '');
    if (message) errors[name] = message;
  });
  return errors;
}
