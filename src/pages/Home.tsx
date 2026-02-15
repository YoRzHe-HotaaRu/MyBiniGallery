import { Link } from 'react-router-dom';
import { Heart, Search, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const featureStyles = {
    pink: { wrapper: 'bg-pink-100', icon: 'text-pink-600' },
    purple: { wrapper: 'bg-purple-100', icon: 'text-purple-600' },
    blue: { wrapper: 'bg-blue-100', icon: 'text-blue-600' },
  } as const;

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-20 px-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-3xl mx-4">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
          Welcome to <span className="text-pink-600">My Bini</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Your ultimate gallery for anime waifus. Discover, collect, and admire your favorite characters in one place.
        </p>
        <div className="flex justify-center space-x-4">
          <Link to="/anime">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-pink-600 text-white rounded-full font-medium hover:bg-pink-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Browse Anime
            </motion.button>
          </Link>
          <Link to="/waifus">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-white text-pink-600 border-2 border-pink-100 rounded-full font-medium hover:border-pink-200 hover:bg-pink-50 transition-colors"
            >
              Explore Waifus
            </motion.button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12">Why My Bini?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Search, title: 'Easy Discovery', desc: 'Find characters by anime series or search directly for your favorites.', color: 'pink' },
            { icon: Heart, title: 'Curated Collections', desc: 'High-quality images and detailed profiles for every character.', color: 'purple' },
            { icon: Star, title: 'Community Driven', desc: 'Join a community of anime enthusiasts and share your love for waifus.', color: 'blue' }
          ].map((feature, index) => (
            <motion.div 
              key={index}
              className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
              whileHover={{ y: -10 }}
            >
              <div
                className={`w-16 h-16 ${featureStyles[feature.color as keyof typeof featureStyles].wrapper} rounded-full flex items-center justify-center mx-auto mb-4`}
              >
                <feature.icon
                  className={`h-8 w-8 ${featureStyles[feature.color as keyof typeof featureStyles].icon}`}
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
