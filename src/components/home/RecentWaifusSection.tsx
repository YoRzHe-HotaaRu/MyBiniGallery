import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Waifu } from '../../types';
import { Card } from '../ui';
import { SparkHeart } from '../icons/SparkHeart';

export function RecentWaifusSection({ animeNameById }: { animeNameById: Record<string, string> }) {
    const [recentWaifus, setRecentWaifus] = useState<Waifu[]>([]);
    const [loadingRecent, setLoadingRecent] = useState(true);

    useEffect(() => {
        const fetchRecent = async () => {
            setLoadingRecent(true);
            try {
                const waifuSnapshot = await getDocs(
                    query(collection(db, 'waifus'), orderBy('createdAt', 'desc'), limit(6))
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

    return (
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
    );
}
