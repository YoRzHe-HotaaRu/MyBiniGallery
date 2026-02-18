import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import AuthSuccessAnimation from '../components/AuthSuccessAnimation';
import AuthShell from '../components/AuthShell';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { from?: { pathname?: string } } | null;
  const from = state?.from?.pathname || '/';

  const getErrorMessage = (err: unknown, fallback: string) => {
    if (err && typeof err === 'object' && 'message' in err) {
      const message = (err as Record<string, unknown>).message;
      if (typeof message === 'string' && message.trim()) return message;
    }
    return fallback;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setBusy(true);
      setError('');
      setResetSent(false);
      await signInWithEmailAndPassword(auth, email, password);
      setShowSuccess(true);
      setTimeout(() => {
        navigate(from);
      }, 2000);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to login'));
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setBusy(true);
      setError('');
      setResetSent(false);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user document exists
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Create user document if it doesn't exist
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          role: 'user',
          createdAt: Date.now(),
        });
      } else {
        await setDoc(
          userDocRef,
          {
            email: user.email,
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
          },
          { merge: true }
        );
      }

      setShowSuccess(true);
      setTimeout(() => {
        navigate(from);
      }, 2000);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to sign in with Google'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle={
        <span>
          Don’t have an account?{' '}
          <Link to="/signup" className="font-semibold text-pink-700 hover:text-pink-800">
            Create one
          </Link>
        </span>
      }
      sideTitle="Save favourites. Leave comments. Build your collection."
      sideSubtitle="Sign in to continue where you left off and join the conversation."
      sideBullets={[
        'Like and comment on waifus in real time',
        'Keep favourites synced to your account',
        'Admin tools stay protected behind roles',
      ]}
    >
      <AuthSuccessAnimation isVisible={showSuccess} message="Welcome Back!" type="signin" />
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="email-address" className="block text-sm font-semibold text-gray-700">
              Email
            </label>
            <div className="mt-2 relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white/80 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="you@example.com"
                disabled={busy}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                Password
              </label>
              <button
                type="button"
                onClick={async () => {
                  if (!email.trim()) {
                    setError('Enter your email to reset your password');
                    return;
                  }
                  setResetBusy(true);
                  setError('');
                  setResetSent(false);
                  try {
                    await sendPasswordResetEmail(auth, email.trim());
                    setResetSent(true);
                  } catch (err: unknown) {
                    setError(getErrorMessage(err, 'Failed to send reset email'));
                  } finally {
                    setResetBusy(false);
                  }
                }}
                className="text-sm font-semibold text-pink-700 hover:text-pink-800 disabled:opacity-60"
                disabled={busy || resetBusy}
              >
                {resetBusy ? 'Sending…' : 'Forgot password?'}
              </button>
            </div>
            <div className="mt-2 relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 bg-white/80 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="••••••••"
                disabled={busy}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                disabled={busy}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {resetSent && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Password reset email sent.
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          disabled={busy}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-pink-600 text-white py-3 font-semibold shadow-sm shadow-pink-600/30 hover:bg-pink-700 hover:shadow-pink-600/40 active:bg-pink-800 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Sign in
        </motion.button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white/70 text-gray-500">or</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="button"
          onClick={handleGoogleSignIn}
          disabled={busy}
          className="w-full inline-flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-3 font-semibold text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-60"
        >
          <img
            className="h-5 w-5"
            src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg"
            alt=""
          />
          Continue with Google
        </motion.button>
      </form>
    </AuthShell>
  );
}
