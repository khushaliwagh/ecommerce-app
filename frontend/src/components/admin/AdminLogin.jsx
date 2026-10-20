import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AlertCircle, ArrowLeft, KeyRound, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { adminLogin } from '@/features/admin/adminSlice';

export default function AdminLogin() {
  const dispatch = useDispatch();
  const { authStatus, authError } = useSelector((s) => s.admin);
  const [key, setKey] = useState('');
  const loading = authStatus === 'loading';

  const submit = (e) => {
    e.preventDefault();
    if (key.trim()) dispatch(adminLogin(key.trim()));
  };

  return (
    <div className="grid min-h-screen place-items-center px-5 py-16">
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        className="w-full max-w-sm rounded-[2rem] border bg-card p-8 shadow-xl shadow-foreground/5"
      >
        <span className="mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground">
          <KeyRound className="h-6 w-6" />
        </span>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Admin sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">Enter the admin key to manage products and orders.</p>

        <div className="mt-6 space-y-2">
          <Label htmlFor="admin-key">Admin key</Label>
          <Input
            id="admin-key"
            type="password"
            autoComplete="current-password"
            autoFocus
            value={key}
            onChange={(e) => setKey(e.target.value)}
            aria-invalid={authError ? 'true' : 'false'}
          />
          {authError && (
            <p role="alert" className="flex items-start gap-1.5 text-[13px] font-medium text-destructive">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-none" /> {authError}
            </p>
          )}
        </div>

        <Button type="submit" size="lg" className="mt-6 w-full" disabled={loading || !key.trim()}>
          {loading ? (
            <>
              <Loader2 className="animate-spin" /> Checking…
            </>
          ) : (
            'Sign in'
          )}
        </Button>

        <a href="#" className="mt-5 flex items-center justify-center gap-1.5 text-sm font-semibold text-muted-foreground transition hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to the shop
        </a>
      </motion.form>
    </div>
  );
}
