import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Film } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Anime, Waifu } from '../types';
import { Card } from '../components/ui';

export default function Home() {
  const heroWallpapers = [
    '/banner/photo_2026-02-17_16-46-19.jpg',
    '/banner/photo_2026-02-17_16-46-56.jpg',
    '/banner/photo_2026-02-17_16-46-59.jpg',
    '/banner/photo_2026-02-17_16-47-02.jpg',
    '/banner/photo_2026-02-17_16-52-00.jpg',
    '/banner/photo_2026-02-17_16-52-28.jpg',
    '/banner/photo_2026-02-17_16-53-59.jpg',
  ];

  const [heroIndex, setHeroIndex] = useState(0);
  const [recentWaifus, setRecentWaifus] = useState<Waifu[]>([]);
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  useEffect(() => {
    const id = window.setInterval(() => {
      setHeroIndex((i) => (i + 1) % heroWallpapers.length);
    }, 8000);
    return () => window.clearInterval(id);
  }, [heroWallpapers.length]);

  useEffect(() => {
    const fetchRecent = async () => {
      setLoadingRecent(true);
      try {
        const [animeSnapshot, waifuSnapshot] = await Promise.all([
          getDocs(query(collection(db, 'anime'))),
          getDocs(query(collection(db, 'waifus'), orderBy('createdAt', 'desc'), limit(6))),
        ]);

        setAnimes(
          animeSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Anime, 'id'>),
          }))
        );
        setRecentWaifus(
          waifuSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Waifu, 'id'>),
          }))
        );
      } catch (err) {
        console.error('Error fetching recent waifus:', err);
      } finally {
        setLoadingRecent(false);
      }
    };

    fetchRecent();
  }, []);

  const animeNameById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const a of animes) map[a.id] = a.title;
    return map;
  }, [animes]);

  const SparkHeart = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 21s-7-4.35-9.5-9.04C.73 8.6 2.53 5.5 6 5.5c1.76 0 3.2.86 4 2.02.8-1.16 2.24-2.02 4-2.02 3.47 0 5.27 3.1 3.5 6.46C19 16.65 12 21 12 21Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M18.5 3.5l.6 1.7 1.7.6-1.7.6-.6 1.7-.6-1.7-1.7-.6 1.7-.6.6-1.7Zm-11 0l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z"
        fill="currentColor"
      />
    </svg>
  );

  return (
    <div className="space-y-16">
      {/* Hero Section */}
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

      <section>
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 text-white flex items-center justify-center shadow-sm">
              <SparkHeart className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Recently Added Waifus</h2>
              <p className="text-sm text-gray-500">Fresh drops in the gallery</p>
            </div>
          </div>
          <Link to="/waifus" className="text-pink-600 hover:text-pink-700 font-medium">
            View all
          </Link>
        </div>

        {loadingRecent ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-[3/4] bg-gray-100" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {recentWaifus.map((waifu) => (
              <Link
                key={waifu.id}
                to={`/waifu/${waifu.id}`}
                className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="aspect-[3/4] relative overflow-hidden">
                  <img
                    src={waifu.imageUrl}
                    alt={waifu.name}
                    className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-3">
                  <p className="font-semibold text-gray-900 truncate group-hover:text-pink-600 transition-colors">
                    {waifu.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {animeNameById[waifu.animeId] ?? 'Unknown Series'}
                  </p>
                </div>
              </Link>
            ))}

            {recentWaifus.length === 0 && (
              <Card className="col-span-full text-center py-10">
                <p className="text-gray-500">No waifus yet. Add some from the admin panel.</p>
              </Card>
            )}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-600 text-white flex items-center justify-center shadow-sm shadow-pink-600/30">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Browse by Anime</h2>
              <p className="text-sm text-gray-500">Jump into a series, then explore the waifus inside</p>
            </div>
          </div>
          <Link to="/anime" className="text-pink-600 hover:text-pink-700 font-medium">
            View all
          </Link>
        </div>

        {loadingRecent ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-[16/9] bg-gray-100" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {animes.slice(0, 6).map((anime) => (
              <Link key={anime.id} to={`/waifus?anime=${anime.id}`} className="group block">
                <Card className="overflow-hidden">
                  <div className="aspect-[16/9] relative">
                    {anime.coverImage ? (
                      <img
                        src={anime.coverImage}
                        alt={anime.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gray-100" />
                    )}
                    <div className="absolute inset-0 bg-black/35 group-hover:bg-black/45 transition-colors" />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <div className="text-white font-extrabold text-lg leading-tight truncate">
                        {anime.title}
                      </div>
                      <div className="mt-1 inline-flex items-center gap-2 text-white/85 text-sm font-semibold">
                        View waifus
                        <span className="translate-x-0 group-hover:translate-x-0.5 transition-transform">→</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}

            {animes.length === 0 ? (
              <Card className="col-span-full p-8 text-center">
                <div className="text-lg font-extrabold text-gray-900">No anime yet</div>
                <div className="mt-2 text-sm text-gray-600">
                  Add an anime first, then start building out waifu collections.
                </div>
              </Card>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
