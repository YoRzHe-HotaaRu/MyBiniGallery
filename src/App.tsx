import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './config/firebase';
import { useAuthStore } from './store/authStore';
import AppRoutes from './AppRoutes';
import { User } from './types';

function App() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Fetch user role from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          const userData = (userDoc.data() ?? {}) as Partial<User>;
          
          const role: User['role'] = userData.role === 'admin' ? 'admin' : 'user';
          const createdAt = typeof userData.createdAt === 'number' ? userData.createdAt : Date.now();
          const displayName =
            typeof userData.displayName === 'string'
              ? userData.displayName
              : firebaseUser.displayName ?? undefined;
          const photoURL =
            typeof userData.photoURL === 'string' ? userData.photoURL : firebaseUser.photoURL ?? undefined;

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email ?? '',
            role,
            createdAt,
            displayName,
            photoURL,
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
