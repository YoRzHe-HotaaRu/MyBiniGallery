import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Waifu } from '../types';
import { useAuthStore } from '../store/authStore';
import { useFavouritesStore } from '../store/favouritesStore';
import { Loader, Heart } from 'lucide-react';

export default function Favourites() {
  const { user } = useAuthStore();
  const { ids, loading: loadingIds, toggleFavourite, isFavourite } = useFavouritesStore();
  const [waifus, setWaifus] = useState<Waifu[]>([]);
  const [loadingWaifus, setLoadingWaifus] = useState(true);

  const favouriteIds = useMemo(() => Object.keys(ids), [ids]);

  useEffect(() => {
    const fetchWaifus = async () => {
      setLoadingWaifus(true);
      try {
        const docs = await Promise.all(
          favouriteIds.map(async (id) => {
            const snap = await getDoc(doc(db, 'waifus', id));
            if (!snap.exists()) return null;
            return { id: snap.id, ...(snap.data() as Omit<Waifu, 'id'>) };
          })
        );
        setWaifus(docs.filter(Boolean) as Waifu[]);
      } catch (err) {
        console.error('Error fetching favourite waifus:', err);
        setWaifus([]);
      } finally {
        setLoadingWaifus(false);
      }
    };

    fetchWaifus();
  }, [favouriteIds]);

  const loading = loadingIds || loadingWaifus;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin h-8 w-8 text-pink-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Favourites</h1>
        <Link to="/waifus" className="text-pink-600 hover:text-pink-700 font-medium">
          Browse waifus
        </Link>
      </div>

      {waifus.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">No favourites yet.</p>
          <Link to="/waifus" className="text-pink-600 hover:underline mt-2 inline-block">
            Go to Waifu Gallery
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {waifus.map((waifu) => (
            <Link
              key={waifu.id}
              to={`/waifu/${waifu.id}`}
              className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="aspect-[3/4] relative overflow-hidden">
                <img
                  src={waifu.imageUrl}
                  alt={waifu.name}
                  className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                  decoding="async"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!user) return;
                    toggleFavourite(user.uid, waifu.id);
                  }}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                  aria-label="Toggle favourite"
                >
                  <Heart
                    className={`h-5 w-5 ${
                      isFavourite(waifu.id) ? 'text-pink-600 fill-pink-600' : 'text-gray-500'
                    }`}
                  />
                </button>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-pink-600 transition-colors truncate">
                  {waifu.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

