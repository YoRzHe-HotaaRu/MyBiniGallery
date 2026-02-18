import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { ChevronDown, Heart, LogOut, Menu, Shield, User as UserIcon, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import AuthSuccessAnimation from './AuthSuccessAnimation';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogout, setShowLogout] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setUserMenuOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (!userMenuRef.current) return;
      if (!userMenuRef.current.contains(target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    setMobileOpen(false);
    setShowLogout(true);
    try {
      await signOut(auth);
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      window.setTimeout(() => setShowLogout(false), 900);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Anime', path: '/anime' },
    { name: 'Waifus', path: '/waifus' },
    ...(user ? [{ name: 'Favourites', path: '/favourites' }] : []),
    ...(user?.role === 'admin' ? [{ name: 'Admin', path: '/admin' }] : []),
  ];

  const activePath = location.pathname;
  const userLabel = user?.displayName?.trim() || user?.email || '';
  const userInitial = (userLabel[0] || 'U').toUpperCase();

  return (
    <header className="sticky top-0 z-50">
      <AuthSuccessAnimation isVisible={showLogout} message="See you later!" type="signout" />
      <div className="absolute inset-0 bg-white/55 backdrop-blur border-b border-white/60 shadow-[0_18px_45px_-35px_rgba(236,72,153,0.35)]" />
      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/70 bg-white/70 text-gray-800 shadow-sm hover:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link to="/" className="flex items-center gap-3 group">
              <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                <Heart className="h-8 w-8 text-pink-600 fill-pink-600" />
              </motion.div>
              <span className="font-extrabold text-xl tracking-tight text-gray-900">
                My <span className="text-pink-700">Bini</span>
              </span>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = activePath === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    'relative px-4 py-2 rounded-xl text-sm font-semibold transition-colors',
                    isActive
                      ? 'text-pink-700 bg-white/80 shadow-sm'
                      : 'text-gray-700 hover:bg-white/70 hover:text-gray-900'
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.name}
                  {isActive ? (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-10 rounded-xl bg-white/80"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {!user ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login">
                  <button className="h-10 px-4 rounded-xl font-semibold text-gray-800 hover:bg-white/70 transition focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2">
                    Sign in
                  </button>
                </Link>
                <Link to="/signup">
                  <button className="h-10 px-4 rounded-xl font-semibold text-white bg-pink-600 shadow-sm shadow-pink-600/30 hover:bg-pink-700 hover:shadow-pink-600/40 active:bg-pink-800 transition focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2">
                    Create account
                  </button>
                </Link>
              </div>
            ) : (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  className="inline-flex items-center gap-3 rounded-2xl border border-white/60 bg-white/75 px-3 py-2 shadow-sm hover:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt=""
                      className="h-8 w-8 rounded-xl object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-pink-600 to-purple-600 text-white flex items-center justify-center font-extrabold">
                      {userInitial}
                    </div>
                  )}
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-extrabold text-gray-900 leading-5 max-w-[180px] truncate">
                      {user.displayName?.trim() || 'Signed in'}
                    </div>
                    <div className="text-xs text-gray-600 leading-4 max-w-[180px] truncate">
                      {user.email}
                    </div>
                  </div>
                  <ChevronDown className={cn('h-4 w-4 text-gray-500 transition-transform', userMenuOpen ? 'rotate-180' : '')} />
                </button>

                <AnimatePresence>
                  {userMenuOpen ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.98 }}
                      transition={{ duration: 0.16 }}
                      className="absolute right-0 mt-2 w-60 rounded-2xl border border-white/60 bg-white/90 backdrop-blur shadow-[0_20px_55px_-35px_rgba(236,72,153,0.35)] overflow-hidden"
                      role="menu"
                    >
                      <div className="p-3 border-b border-gray-100">
                        <div className="text-sm font-extrabold text-gray-900 truncate">{userLabel}</div>
                        <div className="text-xs text-gray-600 truncate">{user.email}</div>
                      </div>
                      <div className="p-2">
                        <Link
                          to="/favourites"
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-gray-800 hover:bg-gray-50"
                          onClick={() => setUserMenuOpen(false)}
                          role="menuitem"
                        >
                          <Heart className="h-4 w-4 text-pink-600" />
                          Favourites
                        </Link>
                        {user.role === 'admin' ? (
                          <Link
                            to="/admin"
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-gray-800 hover:bg-gray-50"
                            onClick={() => setUserMenuOpen(false)}
                            role="menuitem"
                          >
                            <Shield className="h-4 w-4 text-purple-600" />
                            Admin
                          </Link>
                        ) : null}
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-gray-800 hover:bg-gray-50"
                          role="menuitem"
                        >
                          <LogOut className="h-4 w-4 text-gray-600" />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            className="fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/55 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="absolute right-0 top-0 h-full w-[86%] max-w-sm bg-white border-l border-gray-200 shadow-2xl"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 30, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <div className="h-16 px-4 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Heart className="h-7 w-7 text-pink-600 fill-pink-600" />
                  <span className="font-extrabold text-gray-900">My Bini</span>
                </div>
                <button
                  type="button"
                  className="h-10 w-10 rounded-xl border border-gray-200 bg-white text-gray-800 flex items-center justify-center"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4 space-y-2">
                {navLinks.map((l) => {
                  const isActive = activePath === l.path;
                  return (
                    <Link
                      key={l.path}
                      to={l.path}
                      className={cn(
                        'flex items-center justify-between px-4 py-3 rounded-2xl font-semibold',
                        isActive ? 'bg-pink-50 text-pink-800' : 'text-gray-900 hover:bg-gray-50'
                      )}
                      onClick={() => setMobileOpen(false)}
                    >
                      <span>{l.name}</span>
                      {isActive ? <span className="text-xs font-extrabold">Active</span> : null}
                    </Link>
                  );
                })}

                <div className="pt-3 border-t border-gray-100 mt-3 space-y-2">
                  {!user ? (
                    <>
                      <Link
                        to="/login"
                        className="flex items-center gap-2 px-4 py-3 rounded-2xl font-semibold text-gray-900 hover:bg-gray-50"
                        onClick={() => setMobileOpen(false)}
                      >
                        <UserIcon className="h-4 w-4 text-gray-600" />
                        Sign in
                      </Link>
                      <Link
                        to="/signup"
                        className="flex items-center justify-center px-4 py-3 rounded-2xl font-semibold text-white bg-pink-600 shadow-sm shadow-pink-600/30 hover:bg-pink-700 hover:shadow-pink-600/40 active:bg-pink-800 transition focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                        onClick={() => setMobileOpen(false)}
                      >
                        Create account
                      </Link>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 rounded-2xl font-semibold text-gray-900 hover:bg-gray-50"
                    >
                      <LogOut className="h-4 w-4 text-gray-600" />
                      Sign out
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
