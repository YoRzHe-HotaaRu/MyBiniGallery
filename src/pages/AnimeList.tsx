import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Anime } from '../types';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Card, EmptyState, Input, PageHeader, Skeleton } from '../components/ui';

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
      const animeList = querySnapshot.docs.map((snap) => {
        const data = snap.data() as Partial<Omit<Anime, 'id'>>;
        return {
          id: snap.id,
          title: typeof data.title === 'string' ? data.title : 'Untitled',
          description: typeof data.description === 'string' ? data.description : '',
          coverImage: typeof data.coverImage === 'string' ? data.coverImage : '',
          createdAt: typeof data.createdAt === 'number' ? data.createdAt : 0,
        } satisfies Anime;
      });
      setAnimes(animeList);
      setFilteredAnimes(animeList);
    } catch (err) {
      console.error('Error fetching anime:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Anime Series"
        subtitle="Pick a series to explore its waifu gallery."
        actions={
          <div className="w-full sm:w-80">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search anime…"
              left={<Search className="h-4 w-4" />}
            />
          </div>
        }
      />

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-[2/3] w-full rounded-none" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredAnimes.map((anime) => (
              <Link
                key={anime.id}
                to={`/waifus?anime=${anime.id}`}
                className="group block"
              >
                <Card className="overflow-hidden transition-shadow hover:shadow-[0_25px_60px_-35px_rgba(236,72,153,0.40)]">
                  <div className="aspect-[2/3] relative overflow-hidden w-full">
                    <img
                      src={anime.coverImage}
                      alt={anime.title}
                      className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent opacity-85 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <div className="text-white font-extrabold leading-tight line-clamp-2">
                        {anime.title}
                      </div>
                      <div className="mt-1 text-white/80 text-xs line-clamp-2">
                        {anime.description}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {filteredAnimes.length === 0 ? (
            <EmptyState
              title="No anime found"
              description="Try a different search term."
            />
          ) : null}
        </>
      )}
    </div>
  );
}
