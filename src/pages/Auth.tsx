import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Lock, ArrowRight, ShieldCheck, User, Phone, MapPin, Globe } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('India');
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
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }
      if (!username.trim()) {
        setError('Username is required');
        setLoading(false);
        return;
      }

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { username: username.trim(), phone, address, country },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
      } else if (signUpData.user) {
        // Update profile with additional info
        setTimeout(async () => {
          await supabase.from('profiles').update({
            phone,
            address,
            country,
          }).eq('user_id', signUpData.user!.id);
        }, 1000);

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
            {mode === 'login' ? 'Sign in to access all features' : 'Fill in your details to get started'}
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-8 shadow-lg max-h-[70vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
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

            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input id="username" placeholder="Your username" value={username} onChange={e => setUsername(e.target.value)} className="pl-11" required />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="pl-11" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="pl-11" required minLength={6} />
              </div>
            </div>

            {mode === 'register' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="pl-11" required minLength={6} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input id="phone" type="tel" placeholder="+91 9876543210" value={phone} onChange={e => setPhone(e.target.value)} className="pl-11" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input id="address" placeholder="Your address" value={address} onChange={e => setAddress(e.target.value)} className="pl-11" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input id="country" placeholder="India" value={country} onChange={e => setCountry(e.target.value)} className="pl-11" />
                  </div>
                </div>
              </>
            )}

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
