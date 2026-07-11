import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Card } from '@/shared/ui/card';
import { useAuthStore } from '@/entities/user/store';
import { errorMessage } from '@/shared/api/client';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const clearSession = useAuthStore((s) => s.clearSession);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: string })?.from ?? '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
      return;
    }
    clearSession();
  }, [clearSession, from, isAuthenticated, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      toast.error('Enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(trimmedEmail, password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      const ax = err as { response?: { status?: number } };
      if (ax.response?.status === 401) {
        toast.error('Invalid email or password.');
      } else {
        toast.error(errorMessage(err, 'Sign in failed. Please try again.'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container grid min-h-[80vh] place-items-center py-12">
      <Card className="w-full max-w-md p-8">
        <h1 className="font-display text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to continue building.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="login-email">
              Email
            </label>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="login-password">
              Password
            </label>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign in
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          New here?{' '}
          <Link to="/register" className="text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </Card>
    </div>
  );
}
