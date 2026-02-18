import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { Anime } from '../../types';
import { ArrowLeft, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, Card, CardHeader, ConfirmDialog, Input, PageHeader, Skeleton, Textarea } from '../../components/ui';

export default function ManageAnime() {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Anime | null>(null);
  const [animeToDelete, setAnimeToDelete] = useState<Anime | null>(null);

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
    const target = animes.find((a) => a.id === id) ?? null;
    setAnimeToDelete(target);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Manage Anime"
        subtitle="Create and maintain the anime catalog."
        actions={
          <Link
            to="/admin"
            className="h-11 px-4 rounded-xl font-semibold text-gray-800 hover:bg-white/70 transition border border-white/60 bg-white/60 backdrop-blur shadow-sm inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        }
      />

      {/* Add / Edit Anime Form */}
      <Card className="p-6 sm:p-8">
        <CardHeader
          title={editing ? 'Edit Anime' : 'Add New Anime'}
          subtitle="Cover image is required for new series."
          actions={
            editing ? (
              <Button type="button" variant="ghost" onClick={cancelEdit} className="h-10">
                <X className="h-4 w-4" />
                Cancel
              </Button>
            ) : null
          }
        />
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Naruto" className="mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Brief description…"
              className="mt-1"
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

          <Button
            type="submit"
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
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
          </Button>
        </form>
      </Card>

      {/* Anime List */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="text-lg font-extrabold text-gray-900">Existing Anime</div>
          <div className="text-sm text-gray-600">Click edit to update details.</div>
        </div>
        {loading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <Skeleton className="h-16 w-16 rounded-xl" />
                  <div className="min-w-0 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-72" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-9 w-9 rounded-xl" />
                  <Skeleton className="h-9 w-9 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {animes.map((anime) => (
              <li key={anime.id} className="p-6 flex items-center justify-between gap-4 hover:bg-gray-50/70">
                <div className="flex items-center gap-4 min-w-0">
                  <img src={anime.coverImage} alt={anime.title} className="h-16 w-16 object-cover rounded-xl" />
                  <div className="min-w-0">
                    <div className="text-base font-extrabold text-gray-900 truncate">{anime.title}</div>
                    <div className="text-sm text-gray-600 line-clamp-1">{anime.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => startEdit(anime)}
                    className="h-9 w-9 rounded-xl inline-flex items-center justify-center text-gray-700 hover:bg-white transition border border-transparent hover:border-gray-200"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(anime.id)}
                    className="h-9 w-9 rounded-xl inline-flex items-center justify-center text-gray-700 hover:bg-red-50 hover:text-red-700 transition"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
            {animes.length === 0 ? (
              <li className="p-6 text-center text-gray-600">No anime series found. Add one above!</li>
            ) : null}
          </ul>
        )}
      </Card>

      <ConfirmDialog
        open={Boolean(animeToDelete)}
        title="Delete anime?"
        description="This will remove the series. Waifus referencing it may become orphaned."
        confirmText="Delete"
        danger
        onClose={() => setAnimeToDelete(null)}
        onConfirm={async () => {
          if (!animeToDelete) return;
          try {
            await deleteDoc(doc(db, 'anime', animeToDelete.id));
            setAnimes((prev) => prev.filter((a) => a.id !== animeToDelete.id));
          } catch (err) {
            console.error('Error deleting anime:', err);
          }
        }}
      />
    </div>
  );
}
