import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, LogOut, UserPlus } from 'lucide-react';

interface AuthSuccessAnimationProps {
  isVisible: boolean;
  message: string;
  type: 'signup' | 'signin' | 'signout';
}

export default function AuthSuccessAnimation({ isVisible, message, type }: AuthSuccessAnimationProps) {
  const getIcon = () => {
    switch (type) {
      case 'signup':
        return <UserPlus className="w-16 h-16 text-white" />;
      case 'signin':
        return <CheckCircle className="w-16 h-16 text-white" />;
      case 'signout':
        return <LogOut className="w-16 h-16 text-white" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'signup':
        return 'bg-gradient-to-br from-pink-500 to-rose-600';
      case 'signin':
        return 'bg-gradient-to-br from-green-500 to-emerald-600';
      case 'signout':
        return 'bg-gradient-to-br from-purple-500 to-indigo-600';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`p-8 rounded-2xl shadow-2xl ${getBgColor()} text-white flex flex-col items-center justify-center min-w-[300px]`}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-4 bg-white/20 p-4 rounded-full backdrop-blur-md"
            >
              {getIcon()}
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-center"
            >
              {message}
            </motion.h2>
            
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.4, duration: 1.5 }}
              className="h-1 bg-white/30 mt-6 rounded-full overflow-hidden"
            >
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="h-full bg-white"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
