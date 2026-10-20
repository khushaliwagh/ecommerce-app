import { useEffect, useState } from 'react';

const read = () => (window.location.hash.startsWith('#/admin') ? 'admin' : 'store');

/** Tiny router: "#/admin" shows the admin dashboard, anything else shows the shop. */
export function useHashRoute() {
  const [route, setRoute] = useState(read);

  useEffect(() => {
    const onChange = () => {
      setRoute(read());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return route;
}
