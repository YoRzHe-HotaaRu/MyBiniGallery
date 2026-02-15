import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Anime } from '../types';
import { Link } from 'react-router-dom';
import { Loader, Search } from 'lucide-react';

export default function AnimeList() {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [filteredAnimes, setFilteredAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAnimes();
  }, []);

  useEffect(() => {
    const filtered = animes.filter(anime => 
      anime.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAnimes(filtered);
  }, [searchTerm, animes]);

  const fetchAnimes = async () => {
    try {
      const q = query(collection(db, 'anime'), orderBy('title', 'asc'));
      const querySnapshot = await getDocs(q);
      const animeList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as any),
      })) as Anime[];
      setAnimes(animeList);
      setFilteredAnimes(animeList);
    } catch (err) {
      console.error('Error fetching anime:', err);
    } finally {
      setLoading(false);
    }
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
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Anime Series</h1>
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search anime..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredAnimes.map((anime) => (
          <Link
            key={anime.id}
            to={`/waifus?anime=${anime.id}`}
            className="group block bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="aspect-[2/3] relative overflow-hidden w-full">
              <img
                src={anime.coverImage}
                alt={anime.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <p className="p-4 text-white text-sm line-clamp-2">{anime.description}</p>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-pink-600 transition-colors truncate">
                {anime.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>

      {filteredAnimes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No anime found matching your search.</p>
        </div>
      )}
    </div>
  );
}
