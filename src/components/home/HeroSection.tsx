import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

export function HeroSection() {
    const heroWallpapers = [
        'https://res.cloudinary.com/dy4hqxkv1/image/upload/v1772128625/ed3f1914-d00f-4ffe-bfdc-9090b21efca4_zl2t3x.jpg',
        'https://res.cloudinary.com/dy4hqxkv1/image/upload/v1772128626/Beatrice_Anime_x6exa5.webp',
        'https://res.cloudinary.com/dy4hqxkv1/image/upload/v1772128625/ef167b40e8f1c806488933e5a9e0cdb6_wtuhwc.jpg',
        'https://res.cloudinary.com/dy4hqxkv1/image/upload/v1772128625/Tanya_in_victory_E01_ryraop.jpg',
        'https://res.cloudinary.com/dy4hqxkv1/image/upload/v1772128625/anime-spy-x-family-anya-forger_169_cu7t5t.jpg'
    ];

    const [heroIndex, setHeroIndex] = useState(0);

    useEffect(() => {
        const id = window.setInterval(() => {
            setHeroIndex((i) => (i + 1) % heroWallpapers.length);
        }, 8000);
        return () => window.clearInterval(id);
    }, [heroWallpapers.length]);

    return (
        <section className="relative overflow-hidden rounded-3xl">
            <div className="absolute inset-0">
                <AnimatePresence initial={false}>
                    <motion.div
                        key={heroIndex}
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${heroWallpapers[heroIndex]})` }}
                        initial={{ opacity: 0, scale: 1.02 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.99 }}
                        transition={{ duration: 0.9, ease: 'easeInOut' }}
                    />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-black/20" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>

            <div className="relative text-center py-20 px-4">
                <h1 className="text-5xl font-extrabold text-white mb-6 drop-shadow">
                    Welcome to <span className="text-pink-400">My Bini</span>
                </h1>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto drop-shadow">
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
                            className="px-8 py-3 bg-white/95 text-pink-700 border-2 border-white/40 rounded-full font-medium hover:bg-white transition-colors"
                        >
                            Explore Waifus
                        </motion.button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
