import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { useSearchParams, Link } from 'react-router-dom';
import { db } from '../config/firebase';
import { Anime, Waifu } from '../types';
import { Loader, Filter } from 'lucide-react';

export default function WaifuList() {
  const [searchParams] = useSearchParams();
  const animeIdFilter = searchParams.get('anime');

  const [waifus, setWaifus] = useState<Waifu[]>([]);
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [animeIdFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Anime List for names
      const animeQ = query(collection(db, 'anime'));
      const animeSnapshot = await getDocs(animeQ);
      const animeList = animeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Anime));
      setAnimes(animeList);

      // Fetch Waifus
      let waifuQ;
      if (animeIdFilter) {
        waifuQ = query(
          collection(db, 'waifus'), 
          where('animeId', '==', animeIdFilter),
          orderBy('createdAt', 'desc')
        );
      } else {
        waifuQ = query(collection(db, 'waifus'), orderBy('createdAt', 'desc'));
      }

      const waifuSnapshot = await getDocs(waifuQ);
      const waifuList = waifuSnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any),
      })) as Waifu[];
      setWaifus(waifuList);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAnimeName = (id: string) => {
    return animes.find(a => a.id === id)?.title || 'Unknown Series';
  };

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
        <h1 className="text-3xl font-bold text-gray-800">
          {animeIdFilter 
            ? `Waifus from ${getAnimeName(animeIdFilter)}`
            : 'Waifu Gallery'
          }
        </h1>
        {animeIdFilter && (
          <Link 
            to="/waifus" 
            className="flex items-center text-pink-600 hover:text-pink-700"
          >
            <Filter className="h-4 w-4 mr-1" />
            Show All
          </Link>
        )}
      </div>

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
                className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-pink-600 transition-colors truncate">
                {waifu.name}
              </h3>
              <p className="text-sm text-gray-500 truncate">
                {getAnimeName(waifu.animeId)}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {waifus.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">No waifus found in this collection.</p>
          <Link to="/" className="text-pink-600 hover:underline mt-2 inline-block">
            Go back home
          </Link>
        </div>
      )}
    </div>
  );
}
