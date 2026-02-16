import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { Anime } from '../../types';
import { Plus, Trash2, Loader, Pencil, X } from 'lucide-react';

export default function ManageAnime() {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Anime | null>(null);

  useEffect(() => {
    fetchAnimes();
  }, []);

  const fetchAnimes = async () => {
    try {
      const q = query(collection(db, 'anime'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const animeList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Anime, 'id'>),
      }));
      setAnimes(animeList);
    } catch (err) {
      console.error('Error fetching anime:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || (!editing && !coverImage)) {
      setError(editing ? 'Please fill in all fields' : 'Please fill in all fields');
      return;
    }

    setUploading(true);
    setError('');

    try {
      let imageUrl = editing?.coverImage ?? '';
      if (coverImage) {
        imageUrl = await uploadToCloudinary(coverImage);
      }

      if (editing) {
        await updateDoc(doc(db, 'anime', editing.id), {
          title,
          description,
          coverImage: imageUrl,
          updatedAt: Date.now(),
        });
      } else {
        await addDoc(collection(db, 'anime'), {
          title,
          description,
          coverImage: imageUrl,
          createdAt: Date.now(),
        });
      }

      setTitle('');
      setDescription('');
      setCoverImage(null);
      setEditing(null);
      // Reset file input
      const fileInput = document.getElementById('cover-image') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      fetchAnimes();
    } catch (err) {
      console.error('Error saving anime:', err);
      setError(editing ? 'Failed to update anime' : 'Failed to add anime');
    } finally {
      setUploading(false);
    }
  };

  const startEdit = (anime: Anime) => {
    setEditing(anime);
    setTitle(anime.title);
    setDescription(anime.description);
    setCoverImage(null);
    setError('');
    const fileInput = document.getElementById('cover-image') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const cancelEdit = () => {
    setEditing(null);
    setTitle('');
    setDescription('');
    setCoverImage(null);
    setError('');
    const fileInput = document.getElementById('cover-image') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this anime?')) {
      try {
        await deleteDoc(doc(db, 'anime', id));
        setAnimes(animes.filter((anime) => anime.id !== id));
      } catch (err) {
        console.error('Error deleting anime:', err);
      }
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Manage Anime Series</h1>

      {/* Add / Edit Anime Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {editing ? 'Edit Anime' : 'Add New Anime'}
          </h2>
          {editing && (
            <button
              type="button"
              onClick={cancelEdit}
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 border p-2"
              placeholder="e.g. Naruto"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 border p-2"
              placeholder="Brief description..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cover Image {editing ? '(optional)' : ''}
            </label>
            <input
              id="cover-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
            />
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
                Saving...
              </>
            ) : (
              <>
                {editing ? (
                  <Pencil className="-ml-1 mr-2 h-4 w-4" />
                ) : (
                  <Plus className="-ml-1 mr-2 h-4 w-4" />
                )}
                {editing ? 'Save Changes' : 'Add Anime'}
              </>
            )}
          </button>
        </form>
      </div>

      {/* Anime List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Existing Anime</h2>
        </div>
        <ul className="divide-y divide-gray-200">
          {animes.map((anime) => (
            <li key={anime.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center space-x-4">
                <img
                  src={anime.coverImage}
                  alt={anime.title}
                  className="h-16 w-16 object-cover rounded-md"
                />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{anime.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-1">{anime.description}</p>
                </div>
              </div>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => startEdit(anime)}
                  className="text-gray-500 hover:text-pink-600 p-2"
                  title="Edit"
                >
                  <Pencil className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(anime.id)}
                  className="text-red-600 hover:text-red-900 p-2"
                  title="Delete"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </li>
          ))}
          {animes.length === 0 && (
            <li className="p-6 text-center text-gray-500">No anime series found. Add one above!</li>
          )}
        </ul>
      </div>
    </div>
  );
}
