import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Lock, ArrowRight, ShieldCheck, User, Phone, MapPin, Globe, UserCog, Users } from 'lucide-react';

type Role = 'client' | 'admin';

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  const [role, setRole] = useState<Role>('client');
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

  const goAfterLogin = async (userId: string) => {
    if (role === 'admin') {
      // Check admin role
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin');
      if (data && data.length > 0) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        // Try to promote first user to admin. Use destructured response (no throw).
        const { error: promoteError } = await supabase.functions.invoke('promote-admin');
        // 403 (admin already exists) returns an error object — that's expected, just ignore it.
        if (!promoteError) {
          const { data: again } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', userId)
            .eq('role', 'admin');
          if (again && again.length > 0) {
            navigate('/admin/dashboard', { replace: true });
            return;
          }
        }
        setError('You do not have admin privileges. Please contact the administrator.');
        await supabase.auth.signOut();
      }
    } else {
      navigate(redirectTo, { replace: true });
    }
  };

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
        setLoading(false);
        return;
      }

      // Auto sign-in (email auto-confirm is enabled)
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError || !signInData.user) {
        setInfo('Account created! Please sign in.');
        setMode('login');
        setLoading(false);
        return;
      }

      // Update profile with extra info
      await supabase.from('profiles').update({ phone, address, country }).eq('user_id', signInData.user.id);

      await goAfterLogin(signInData.user.id);
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setError(error.message);
      } else if (data.user) {
        await goAfterLogin(data.user.id);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-3xl mb-4">
            <ShieldCheck className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {mode === 'login' ? 'Sign in to continue' : 'Fill in your details to get started'}
          </p>
        </div>

        {/* Role selector */}
        <div className="grid grid-cols-2 gap-2 mb-4 p-1 bg-muted rounded-xl">
          <button
            type="button"
            onClick={() => setRole('client')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              role === 'client' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            <Users className="h-4 w-4" /> Client
          </button>
          <button
            type="button"
            onClick={() => setRole('admin')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              role === 'admin' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            <UserCog className="h-4 w-4" /> Admin
          </button>
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

                {role === 'client' && (
                  <>
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
              </>
            )}

            <Button type="submit" variant="hero" size="lg" className="w-full gap-2" disabled={loading}>
              {loading ? 'Please wait...' : (
                <>{mode === 'login' ? `Sign In as ${role === 'admin' ? 'Admin' : 'Client'}` : 'Create Account'} <ArrowRight className="h-5 w-5" /></>
              )}
            </Button>

            {mode === 'login' && (
              <p className="text-center text-sm">
                <a href="/forgot-password" className="text-primary hover:underline">Forgot password?</a>
              </p>
            )}
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
