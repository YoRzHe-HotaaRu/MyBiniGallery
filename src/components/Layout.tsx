import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import PageTransition from './PageTransition';
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useFavouritesStore } from '../store/favouritesStore';

export default function Layout() {
  const location = useLocation();
  const { user, loading } = useAuthStore();
  const { loadForUser, clear } = useFavouritesStore();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      clear();
      return;
    }
    loadForUser(user.uid);
  }, [user, loading, loadForUser, clear]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait" initial={false}>
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>
    </div>
  );
}

