import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Waifu, Anime } from '../types';
import { Loader, ArrowLeft, Calendar, Image as ImageIcon, Heart } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useFavouritesStore } from '../store/favouritesStore';

export default function WaifuDetail() {
  const { id } = useParams<{ id: string }>();
  const [waifu, setWaifu] = useState<Waifu | null>(null);
  const [anime, setAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { user } = useAuthStore();
  const { isFavourite, toggleFavourite } = useFavouritesStore();
  const navigate = useNavigate();
  const location = useLocation();

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin h-8 w-8 text-pink-500" />
      </div>
    );
  }

  if (!waifu) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">Waifu not found.</p>
        <Link to="/waifus" className="text-pink-600 hover:underline mt-2 inline-block">
          Back to Gallery
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link to="/waifus" className="inline-flex items-center text-gray-500 hover:text-pink-600 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Gallery
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Main Image Section */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl overflow-hidden shadow-lg bg-white p-2">
            <img
              src={waifu.imageUrl}
              alt={waifu.name}
              className="w-full h-auto rounded-xl object-cover"
            />
          </div>
        </div>

        {/* Info Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{waifu.name}</h1>
              <Link 
                to={`/waifus?anime=${anime?.id}`} 
                className="text-xl text-pink-600 hover:text-pink-700 font-medium"
              >
                {anime?.title || 'Unknown Series'}
              </Link>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  navigate('/login', { state: { from: location }, replace: false });
                  return;
                }
                toggleFavourite(user.uid, waifu.id);
              }}
              className="mt-1 w-11 h-11 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center hover:bg-pink-50 transition-colors"
              aria-label="Toggle favourite"
            >
              <Heart
                className={`h-6 w-6 ${isFavourite(waifu.id) ? 'text-pink-600 fill-pink-600' : 'text-gray-500'}`}
              />
            </button>
          </div>

          <div className="prose prose-pink max-w-none text-gray-600">
            <p className="whitespace-pre-wrap leading-relaxed text-lg">{waifu.description}</p>
          </div>

          {waifu.age && (
            <div className="flex items-center text-gray-500 bg-gray-50 px-4 py-3 rounded-lg inline-block w-fit">
              <Calendar className="h-5 w-5 mr-2 text-pink-500" />
              <span className="font-medium">Age: {waifu.age}</span>
            </div>
          )}
        </div>
      </div>

      {/* Gallery Section */}
      {waifu.gallery && waifu.gallery.length > 0 && (
        <div className="border-t border-gray-200 pt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <ImageIcon className="h-6 w-6 mr-2 text-pink-500" />
            Gallery
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {waifu.gallery.map((image, index) => (
              <div 
                key={index} 
                className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer shadow-sm hover:shadow-md"
                onClick={() => setSelectedImage(image)}
              >
                <img
                  src={image}
                  alt={`${waifu.name} gallery ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox for Gallery */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Full size"
            className="max-w-full max-h-full rounded-lg shadow-2xl"
          />
          <button 
            className="absolute top-4 right-4 text-white hover:text-gray-300"
            onClick={() => setSelectedImage(null)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
