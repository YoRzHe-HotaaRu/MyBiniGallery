// @/src/pages/AnimeList.tsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Anime } from '@/types';
import { Search } from 'lucide-react';
import { Card, EmptyState, Input, PageHeader, Skeleton } from '@/components/ui';
import { AnimeCard } from '@/components/anime/AnimeCard';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AnimeList() {
  const { t } = useLanguage();
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
        title={t.animeList.title}
        subtitle={t.animeList.subtitle}
        actions={
          <div className="w-full sm:w-80">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.animeList.searchPlaceholder}
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
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>

          {filteredAnimes.length === 0 ? (
            <EmptyState
              title={t.animeList.notFoundTitle}
              description={t.animeList.notFoundDesc}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
