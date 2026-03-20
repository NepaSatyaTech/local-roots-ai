import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate(redirectTo, { replace: true });
    });
  }, [navigate, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    setError('');
    setInfo('');

    if (mode === 'register') {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) {
        setError(error.message);
      } else {
        setInfo('Account created! Please check your email to confirm, then sign in.');
        setMode('login');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        navigate(redirectTo, { replace: true });
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-3xl mb-4">
            <ShieldCheck className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {mode === 'login' ? 'Sign in to access all features' : 'Register to get started'}
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}
            {info && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm">
                {info}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full gap-2" disabled={loading}>
              {loading ? 'Please wait...' : (
                <>{mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight className="h-5 w-5" /></>
              )}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            {mode === 'login' ? (
              <>No account? <button onClick={() => { setMode('register'); setError(''); setInfo(''); }} className="text-primary hover:underline">Register</button></>
            ) : (
              <>Have an account? <button onClick={() => { setMode('login'); setError(''); setInfo(''); }} className="text-primary hover:underline">Sign in</button></>
            )}
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <a href="/" className="text-primary hover:underline">← Back to Home</a>
        </p>
      </div>
    </div>
  );
};

export default Auth;
