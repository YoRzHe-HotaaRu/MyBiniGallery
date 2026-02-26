// @/src/pages/Home.tsx
import { useEffect, useMemo, useState } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Anime } from '@/types';
import { HeroSection } from '@/components/home/HeroSection';
import { RecentWaifusSection } from '@/components/home/RecentWaifusSection';
import { AnimeBrowseSection } from '@/components/home/AnimeBrowseSection';

export default function Home() {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loadingAnime, setLoadingAnime] = useState(true);

  useEffect(() => {
    const fetchAnimes = async () => {
      setLoadingAnime(true);
      try {
        const animeSnapshot = await getDocs(query(collection(db, 'anime')));
        setAnimes(
          animeSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Anime, 'id'>),
          }))
        );
      } catch (err) {
        console.error('Error fetching animes:', err);
      } finally {
        setLoadingAnime(false);
      }
    };

    fetchAnimes();
  }, []);

  const animeNameById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const a of animes) map[a.id] = a.title;
    return map;
  }, [animes]);

  return (
    <div className="space-y-16">
      <HeroSection />
      <RecentWaifusSection animeNameById={animeNameById} />
      <AnimeBrowseSection animes={animes} loading={loadingAnime} />
    </div>
  );
}
