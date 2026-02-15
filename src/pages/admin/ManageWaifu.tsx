import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { Anime, Waifu } from '../../types';
import { Plus, Trash2, Loader, Image as ImageIcon } from 'lucide-react';

export default function ManageWaifu() {
  const [waifus, setWaifus] = useState<Waifu[]>([]);
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [animeId, setAnimeId] = useState('');
  const [age, setAge] = useState('');
  const [description, setDescription] = useState('');
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState<FileList | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch Anime for dropdown
      const animeQ = query(collection(db, 'anime'), orderBy('title', 'asc'));
      const animeSnapshot = await getDocs(animeQ);
      setAnimes(animeSnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Anime)));

      // Fetch Waifus
      const waifuQ = query(collection(db, 'waifus'), orderBy('createdAt', 'desc'));
      const waifuSnapshot = await getDocs(waifuQ);
      setWaifus(waifuSnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Waifu)));
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMainImage(e.target.files[0]);
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setGalleryImages(e.target.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !animeId || !description || !mainImage) {
      setError('Please fill in all required fields');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Upload Main Image
      const mainImageUrl = await uploadToCloudinary(mainImage);

      // Upload Gallery Images
      const galleryUrls: string[] = [];
      if (galleryImages) {
        for (let i = 0; i < galleryImages.length; i++) {
          const url = await uploadToCloudinary(galleryImages[i]);
          galleryUrls.push(url);
        }
      }

      await addDoc(collection(db, 'waifus'), {
        name,
        animeId,
        age,
        description,
        imageUrl: mainImageUrl,
        gallery: galleryUrls,
        createdAt: Date.now(),
      });

      // Reset Form
      setName('');
      setAnimeId('');
      setAge('');
      setDescription('');
      setMainImage(null);
      setGalleryImages(null);
      
      // Reset file inputs
      (document.getElementById('main-image') as HTMLInputElement).value = '';
      (document.getElementById('gallery-images') as HTMLInputElement).value = '';

      fetchData(); // Refresh list
    } catch (err) {
      console.error('Error adding waifu:', err);
      setError('Failed to add waifu');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this waifu?')) {
      try {
        await deleteDoc(doc(db, 'waifus', id));
        setWaifus(waifus.filter(w => w.id !== id));
      } catch (err) {
        console.error('Error deleting waifu:', err);
      }
    }
  };

  const getAnimeName = (id: string) => {
    return animes.find(a => a.id === id)?.title || 'Unknown Anime';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin h-8 w-8 text-pink-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Manage Waifus</h1>

      {/* Add New Waifu Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Waifu</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 border p-2"
                placeholder="Character Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Anime Series</label>
              <select
                value={animeId}
                onChange={(e) => setAnimeId(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 border p-2"
              >
                <option value="">Select Anime</option>
                {animes.map(anime => (
                  <option key={anime.id} value={anime.id}>{anime.title}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Age (Optional)</label>
            <input
              type="text"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 border p-2"
              placeholder="e.g. 17"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 border p-2"
              placeholder="Character bio..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Main Image</label>
              <input
                id="main-image"
                type="file"
                accept="image/*"
                onChange={handleMainImageChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gallery Images</label>
              <input
                id="gallery-images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
              />
            </div>
          </div>
          
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={uploading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Uploading...
              </>
            ) : (
              <>
                <Plus className="-ml-1 mr-2 h-4 w-4" />
                Add Waifu
              </>
            )}
          </button>
        </form>
      </div>

      {/* Waifu List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Existing Waifus</h2>
        </div>
        <ul className="divide-y divide-gray-200">
          {waifus.map((waifu) => (
            <li key={waifu.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center space-x-4">
                <img
                  src={waifu.imageUrl}
                  alt={waifu.name}
                  className="h-16 w-16 object-cover rounded-full border-2 border-pink-200"
                />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{waifu.name}</h3>
                  <p className="text-sm text-gray-500">{getAnimeName(waifu.animeId)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {waifu.gallery?.length > 0 && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full flex items-center">
                    <ImageIcon className="h-3 w-3 mr-1" />
                    {waifu.gallery.length}
                  </span>
                )}
                <button
                  onClick={() => handleDelete(waifu.id)}
                  className="text-red-600 hover:text-red-900 p-2"
                  title="Delete"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </li>
          ))}
          {waifus.length === 0 && (
            <li className="p-6 text-center text-gray-500">No waifus found. Add one above!</li>
          )}
        </ul>
      </div>
    </div>
  );
}