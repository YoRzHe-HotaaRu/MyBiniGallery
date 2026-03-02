// @/src/pages/WaifuDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { ArrowLeft } from 'lucide-react';
import { db } from '@/config/firebase';
import { Waifu, Anime } from '@/types';
import { useWaifuComments } from '@/hooks/useWaifuComments';
import { EmptyState } from '@/components/ui';
import { WaifuDetailSkeleton } from '@/components/waifus/WaifuDetailSkeleton';
import { WaifuInfoCard } from '@/components/waifus/WaifuInfoCard';
import { WaifuGalleryCard } from '@/components/waifus/WaifuGalleryCard';
import { WaifuCommentsCard } from '@/components/waifus/WaifuCommentsCard';
import { WaifuImageViewer } from '@/components/waifus/WaifuImageViewer';

export default function WaifuDetail() {
  const { id } = useParams<{ id: string }>();
  const [waifu, setWaifu] = useState<Waifu | null>(null);
  const [anime, setAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { comments } = useWaifuComments(id);

  useEffect(() => {
    if (id) {
      fetchWaifu(id);
    }
  }, [id]);

  const fetchWaifu = async (waifuId: string) => {
    try {
      const waifuDoc = await getDoc(doc(db, 'waifus', waifuId));
      if (waifuDoc.exists()) {
        const waifuData = waifuDoc.data() as Waifu;
        setWaifu({ id: waifuDoc.id, ...waifuData });

        // Fetch Anime details
        if (waifuData.animeId) {
          const animeDoc = await getDoc(doc(db, 'anime', waifuData.animeId));
          if (animeDoc.exists()) {
            setAnime({ id: animeDoc.id, ...animeDoc.data() } as Anime);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching waifu:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/waifus"
          className="inline-flex items-center gap-2 h-11 px-4 rounded-xl font-semibold text-gray-800 hover:bg-white/70 transition border border-white/60 bg-white/60 backdrop-blur shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      {loading ? (
        <WaifuDetailSkeleton />
      ) : !waifu ? (
        <EmptyState
          title="Waifu not found"
          description="This waifu might have been removed."
          action={
            <Link
              to="/waifus"
              className="h-11 px-5 rounded-xl font-semibold text-white bg-pink-600 hover:bg-pink-700 active:bg-pink-800 inline-flex items-center justify-center shadow-sm shadow-pink-600/30 hover:shadow-pink-600/40 transition focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
            >
              Back to gallery
            </Link>
          }
        />
      ) : (
        <>
          <WaifuInfoCard waifu={waifu} anime={anime} commentCount={comments.length} />

          <WaifuGalleryCard waifu={waifu} onSelectImage={setSelectedImage} />

          <WaifuCommentsCard waifuId={waifu.id} />
        </>
      )}

      <WaifuImageViewer selectedImage={selectedImage} onClose={() => setSelectedImage(null)} />
    </div>
  );
}
