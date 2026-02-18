import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase';
import { Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck, User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import AuthSuccessAnimation from '../components/AuthSuccessAnimation';
import AuthShell from '../components/AuthShell';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [busy, setBusy] = useState(false);
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
    const name = displayName.trim();
    if (name.length < 2) {
      setError('Username must be at least 2 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setBusy(true);
      setError('');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: name,
        role: 'user', // Default role
        createdAt: Date.now(),
      });

      setShowSuccess(true);
      setTimeout(() => {
        navigate(from);
      }, 2000);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to sign up'));
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setBusy(true);
      setError('');
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
      setError(getErrorMessage(err, 'Failed to sign up with Google'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle={
        <span>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-pink-700 hover:text-pink-800">
            Sign in
          </Link>
        </span>
      }
      sideTitle="Make My Bini yours."
      sideSubtitle="Start saving favourites and joining discussions in a clean, fast gallery experience."
      sideBullets={[
        'Fast sign-in with Email or Google',
        'Your favourites stay synced across devices',
        'Join comments and likes to build community',
      ]}
      sideImageUrl="/banner/photo_2026-02-17_16-46-59.jpg"
    >
      <AuthSuccessAnimation isVisible={showSuccess} message="Account Created!" type="signup" />
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
            <label htmlFor="display-name" className="block text-sm font-semibold text-gray-700">
              Username
            </label>
            <div className="mt-2 relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="display-name"
                name="display-name"
                type="text"
                autoComplete="nickname"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white/80 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Your display name"
                maxLength={32}
                disabled={busy}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
              Password
            </label>
            <div className="mt-2 relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 bg-white/80 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Create a strong password"
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
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
              <ShieldCheck className="h-4 w-4 text-pink-600" />
              Use 8+ characters for best security.
            </div>
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-semibold text-gray-700">
              Confirm password
            </label>
            <div className="mt-2 relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="confirm-password"
                name="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 bg-white/80 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Repeat your password"
                disabled={busy}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                disabled={busy}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

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
          Create account
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
