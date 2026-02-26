// @/src/pages/Login.tsx
import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/config/firebase';
import AuthSuccessAnimation from '@/components/auth/AuthSuccessAnimation';
import AuthShell from '@/components/auth/AuthShell';
import { EmailLoginForm } from '@/components/auth/EmailLoginForm';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { AuthDivider } from '@/components/auth/AuthDivider';

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

  const handleResetPassword = async () => {
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

      <div className="space-y-5">
        <EmailLoginForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          busy={busy}
          onSubmit={handleSubmit}
          onResetPassword={handleResetPassword}
          resetBusy={resetBusy}
          resetSent={resetSent}
          error={error}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
        />

        <AuthDivider />

        <GoogleSignInButton
          busy={busy}
          onClick={handleGoogleSignIn}
        />
      </div>
    </AuthShell>
  );
}
