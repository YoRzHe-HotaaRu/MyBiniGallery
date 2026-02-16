import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { LogOut, User as UserIcon, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import AuthSuccessAnimation from './AuthSuccessAnimation';

export default function Navbar() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = async () => {
    setShowLogout(true);
    setTimeout(async () => {
      try {
        await signOut(auth);
        navigate('/login');
        setShowLogout(false);
      } catch (error) {
        console.error('Error logging out:', error);
        setShowLogout(false);
      }
    }, 2000);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Anime', path: '/anime' },
    { name: 'Waifus', path: '/waifus' },
  ];

  if (user) {
    navLinks.push({ name: 'Favourites', path: '/favourites' });
  }

  if (user?.role === 'admin') {
    navLinks.push({ name: 'Admin Dashboard', path: '/admin' });
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <AuthSuccessAnimation isVisible={showLogout} message="See you later!" type="signout" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Heart className="h-8 w-8 text-pink-500 mr-2 group-hover:fill-pink-500 transition-colors" />
              </motion.div>
              <span className="font-bold text-xl text-pink-600">My Bini</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 border-transparent transition-colors ${
                      isActive ? 'text-pink-600' : 'text-gray-500 hover:text-pink-500'
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute bottom-[-2px] left-0 right-0 h-0.5 bg-pink-500"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-gray-700">
                  <UserIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">{user.email}</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleLogout}
                  className="p-2 rounded-full text-gray-400 hover:text-pink-500 hover:bg-pink-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                </motion.button>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign In
                  </motion.button>
                </Link>
                <Link to="/signup">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-pink-500 text-white hover:bg-pink-600 px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors"
                  >
                    Sign Up
                  </motion.button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
