import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/config/firebase';
import AuthSuccessAnimation from '@/components/auth/AuthSuccessAnimation';
import AuthShell from '@/components/auth/AuthShell';
import { EmailSignupForm } from '@/components/auth/EmailSignupForm';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { AuthDivider } from '@/components/auth/AuthDivider';

export default function CreateAccount() {
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

      await setDoc(doc(db, 'publicUsers', user.uid), {
        uid: user.uid,
        displayName: name,
        photoURL: user.photoURL || '',
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
      const existingCreatedAt =
        userDoc.exists() && typeof (userDoc.data() as { createdAt?: unknown }).createdAt === 'number'
          ? ((userDoc.data() as { createdAt?: number }).createdAt as number)
          : null;

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

      await setDoc(
        doc(db, 'publicUsers', user.uid),
        {
          uid: user.uid,
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          createdAt: existingCreatedAt ?? Date.now(),
          updatedAt: Date.now(),
        },
        { merge: true }
      );

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

      <div className="space-y-5">
        <EmailSignupForm
          email={email}
          setEmail={setEmail}
          displayName={displayName}
          setDisplayName={setDisplayName}
          password={password}
          setPassword={setPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          busy={busy}
          onSubmit={handleSubmit}
          error={error}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          showConfirmPassword={showConfirmPassword}
          setShowConfirmPassword={setShowConfirmPassword}
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
