import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Film, Sparkles } from 'lucide-react';
import { Card, PageHeader, Skeleton } from '../../components/ui';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [animeCount, setAnimeCount] = useState(0);
  const [waifuCount, setWaifuCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [animeSnap, waifuSnap] = await Promise.all([
          getDocs(collection(db, 'anime')),
          getDocs(collection(db, 'waifus')),
        ]);
        setAnimeCount(animeSnap.size);
        setWaifuCount(waifuSnap.size);
      } catch (e) {
        console.error('Failed to load admin stats:', e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Manage content and keep the collection fresh."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/admin/anime" className="group block">
          <Card className="p-6 transition-shadow group-hover:shadow-[0_25px_60px_-35px_rgba(236,72,153,0.40)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xl font-extrabold text-gray-900">Manage Anime</div>
                <div className="mt-1 text-sm text-gray-600">
                  Add, edit, or remove anime series.
                </div>
              </div>
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-pink-600 to-purple-600 text-white flex items-center justify-center shadow-sm">
                <Film className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800">
              {loading ? <Skeleton className="h-4 w-12" /> : <span className="tabular-nums">{animeCount}</span>}
              <span className="text-gray-600">series</span>
            </div>
          </Card>
        </Link>

        <Link to="/admin/waifus" className="group block">
          <Card className="p-6 transition-shadow group-hover:shadow-[0_25px_60px_-35px_rgba(236,72,153,0.40)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xl font-extrabold text-gray-900">Manage Waifus</div>
                <div className="mt-1 text-sm text-gray-600">
                  Add, edit, or remove waifus.
                </div>
              </div>
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-pink-600 to-purple-600 text-white flex items-center justify-center shadow-sm">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800">
              {loading ? <Skeleton className="h-4 w-12" /> : <span className="tabular-nums">{waifuCount}</span>}
              <span className="text-gray-600">waifus</span>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
