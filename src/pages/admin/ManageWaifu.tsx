import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { Anime, Waifu } from '../../types';
import { ArrowLeft, Image as ImageIcon, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, Card, CardHeader, ConfirmDialog, Input, PageHeader, Select, Skeleton, Textarea } from '../../components/ui';

export default function ManageWaifu() {
  const [waifus, setWaifus] = useState<Waifu[]>([]);
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Waifu | null>(null);
  const [waifuToDelete, setWaifuToDelete] = useState<Waifu | null>(null);
  const [galleryItems, setGalleryItems] = useState<
    { id: string; url: string; file: File | null; removed: boolean }[]
  >([]);

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
      setAnimes(animeSnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<Anime, 'id'>) })));

      // Fetch Waifus
      const waifuQ = query(collection(db, 'waifus'), orderBy('createdAt', 'desc'));
      const waifuSnapshot = await getDocs(waifuQ);
      setWaifus(waifuSnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<Waifu, 'id'>) })));
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
      if (editing) {
        const files = Array.from(e.target.files);
        const stamp = Date.now();
        setGalleryItems((prev) => [
          ...prev,
          ...files.map((file, idx) => ({
            id: `new-${stamp}-${idx}`,
            url: '',
            file,
            removed: false,
          })),
        ]);
        e.target.value = '';
        return;
      }
      setGalleryImages(e.target.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !animeId || !description || (!editing && !mainImage)) {
      setError('Please fill in all required fields');
      return;
    }

    setUploading(true);
    setError('');

    try {
      let mainImageUrl = editing?.imageUrl ?? '';
      if (mainImage) {
        mainImageUrl = await uploadToCloudinary(mainImage);
      }

      let galleryUrls: string[] = [];
      if (editing) {
        const active = galleryItems.filter((i) => !i.removed);
        const resolved = await Promise.all(
          active.map(async (i) => {
            if (i.file) return uploadToCloudinary(i.file);
            return i.url;
          })
        );
        galleryUrls = resolved.filter(Boolean);
      } else {
        const uploaded: string[] = [];
        if (galleryImages) {
          for (let i = 0; i < galleryImages.length; i++) {
            const url = await uploadToCloudinary(galleryImages[i]);
            uploaded.push(url);
          }
        }
        galleryUrls = uploaded;
      }

      if (editing) {
        await updateDoc(doc(db, 'waifus', editing.id), {
          name,
          animeId,
          age,
          description,
          imageUrl: mainImageUrl,
          gallery: galleryUrls,
          updatedAt: Date.now(),
        });
      } else {
        await addDoc(collection(db, 'waifus'), {
          name,
          animeId,
          age,
          description,
          imageUrl: mainImageUrl,
          gallery: galleryUrls,
          createdAt: Date.now(),
        });
      }

      // Reset Form
      setName('');
      setAnimeId('');
      setAge('');
      setDescription('');
      setMainImage(null);
      setGalleryImages(null);
      setEditing(null);
      setGalleryItems([]);
      
      // Reset file inputs
      (document.getElementById('main-image') as HTMLInputElement).value = '';
      (document.getElementById('gallery-images') as HTMLInputElement).value = '';

      fetchData(); // Refresh list
    } catch (err) {
      console.error('Error saving waifu:', err);
      setError(editing ? 'Failed to update waifu' : 'Failed to add waifu');
    } finally {
      setUploading(false);
    }
  };

  const startEdit = (waifu: Waifu) => {
    setEditing(waifu);
    setName(waifu.name);
    setAnimeId(waifu.animeId);
    setAge(waifu.age ?? '');
    setDescription(waifu.description);
    setMainImage(null);
    setGalleryImages(null);
    setGalleryItems(
      (waifu.gallery ?? []).map((url, idx) => ({
        id: `existing-${idx}-${url}`,
        url,
        file: null,
        removed: false,
      }))
    );
    setError('');
    (document.getElementById('main-image') as HTMLInputElement).value = '';
    (document.getElementById('gallery-images') as HTMLInputElement).value = '';
  };

  const cancelEdit = () => {
    setEditing(null);
    setName('');
    setAnimeId('');
    setAge('');
    setDescription('');
    setMainImage(null);
    setGalleryImages(null);
    setGalleryItems([]);
    setError('');
    (document.getElementById('main-image') as HTMLInputElement).value = '';
    (document.getElementById('gallery-images') as HTMLInputElement).value = '';
  };

  const handleDelete = async (id: string) => {
    const target = waifus.find((w) => w.id === id) ?? null;
    setWaifuToDelete(target);
  };

  const getAnimeName = (id: string) => {
    return animes.find(a => a.id === id)?.title || 'Unknown Anime';
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Manage Waifus"
          subtitle="Create and maintain waifus and their galleries."
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
        <Card className="p-6 sm:p-8 space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-11 w-36" />
        </Card>
        <Card className="p-6 space-y-4">
          <Skeleton className="h-6 w-56" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <Skeleton className="h-16 w-16 rounded-2xl" />
                <div className="space-y-2 min-w-0">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-9 rounded-xl" />
                <Skeleton className="h-9 w-9 rounded-xl" />
              </div>
            </div>
          ))}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Manage Waifus"
        subtitle="Create and maintain waifus and their galleries."
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

      {/* Add / Edit Waifu Form */}
      <Card className="p-6 sm:p-8">
        <CardHeader
          title={editing ? 'Edit Waifu' : 'Add New Waifu'}
          subtitle="Main image is required for new waifus."
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Character name" className="mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Anime Series</label>
              <Select value={animeId} onChange={(e) => setAnimeId(e.target.value)} className="mt-1">
                <option value="">Select Anime</option>
                {animes.map(anime => (
                  <option key={anime.id} value={anime.id}>{anime.title}</option>
                ))}
              </Select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Age (Optional)</label>
            <Input value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 17" className="mt-1" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Character bio…" className="mt-1" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Main Image {editing ? '(optional)' : ''}
              </label>
              {editing && (
                <div className="mt-2">
                  <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                    {(() => {
                      const src = mainImage ? URL.createObjectURL(mainImage) : editing.imageUrl;
                      return (
                        <img
                          src={src}
                          alt={name}
                          className="w-full h-full object-cover object-top"
                          onLoad={() => {
                            if (mainImage) URL.revokeObjectURL(src);
                          }}
                        />
                      );
                    })()}
                  </div>
                </div>
              )}
              <input
                id="main-image"
                type="file"
                accept="image/*"
                onChange={handleMainImageChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {editing ? 'Gallery Images (add / replace individually)' : 'Gallery Images'}
              </label>
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

          {editing && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">Current Gallery</p>
                <button
                  type="button"
                  onClick={() => setGalleryItems((prev) => prev.map((i) => ({ ...i, removed: true })))}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Remove all
                </button>
              </div>
              {galleryItems.length === 0 ? (
                <div className="text-sm text-gray-600 bg-white/70 border border-gray-200 rounded-2xl p-4">
                  No gallery images.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {galleryItems.map((item) => (
                    <div key={item.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                      <div className="relative aspect-square bg-gray-50">
                        {(() => {
                          const src = item.file ? URL.createObjectURL(item.file) : item.url;
                          return (
                            <img
                              src={src}
                              alt={name}
                              className={`absolute inset-0 w-full h-full object-cover ${item.removed ? 'opacity-30 grayscale' : ''}`}
                              onLoad={() => {
                                if (item.file) URL.revokeObjectURL(src);
                              }}
                            />
                          );
                        })()}
                        {item.removed && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-semibold bg-white/90 px-2 py-1 rounded-xl">
                              Removed
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-2 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setGalleryItems((prev) =>
                              prev.map((i) => (i.id === item.id ? { ...i, removed: !i.removed } : i))
                            )
                          }
                          className="text-xs font-medium text-gray-600 hover:text-gray-900"
                        >
                          {item.removed ? 'Undo' : 'Remove'}
                        </button>
                        <label className="text-xs font-medium text-pink-600 hover:text-pink-700 cursor-pointer">
                          Replace
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setGalleryItems((prev) =>
                                prev.map((i) =>
                                  i.id === item.id ? { ...i, file, removed: false } : i
                                )
                              );
                              e.target.value = '';
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button type="submit" disabled={uploading}>
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
                {editing ? 'Save Changes' : 'Add Waifu'}
              </>
            )}
          </Button>
        </form>
      </Card>

      {/* Waifu List */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="text-lg font-extrabold text-gray-900">Existing Waifus</div>
          <div className="text-sm text-gray-600">Keep names, images, and galleries up to date.</div>
        </div>
        <ul className="divide-y divide-gray-100">
          {waifus.map((waifu) => (
            <li key={waifu.id} className="p-6 flex items-center justify-between gap-4 hover:bg-gray-50/70">
              <div className="flex items-center gap-4 min-w-0">
                <img
                  src={waifu.imageUrl}
                  alt={waifu.name}
                  className="h-16 w-16 object-cover rounded-2xl border border-white/60"
                />
                <div className="min-w-0">
                  <div className="text-base font-extrabold text-gray-900 truncate">{waifu.name}</div>
                  <div className="text-sm text-gray-600 truncate">{getAnimeName(waifu.animeId)}</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {waifu.gallery?.length > 0 && (
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full flex items-center">
                    <ImageIcon className="h-3 w-3 mr-1" />
                    {waifu.gallery.length}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => startEdit(waifu)}
                  className="h-9 w-9 rounded-xl inline-flex items-center justify-center text-gray-700 hover:bg-white transition border border-transparent hover:border-gray-200"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(waifu.id)}
                  className="h-9 w-9 rounded-xl inline-flex items-center justify-center text-gray-700 hover:bg-red-50 hover:text-red-700 transition"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
          {waifus.length === 0 && (
            <li className="p-6 text-center text-gray-500">No waifus found. Add one above!</li>
          )}
        </ul>
      </Card>

      <ConfirmDialog
        open={Boolean(waifuToDelete)}
        title="Delete waifu?"
        description="This will remove the waifu and their gallery."
        confirmText="Delete"
        danger
        onClose={() => setWaifuToDelete(null)}
        onConfirm={async () => {
          if (!waifuToDelete) return;
          try {
            await deleteDoc(doc(db, 'waifus', waifuToDelete.id));
            setWaifus((prev) => prev.filter((w) => w.id !== waifuToDelete.id));
          } catch (err) {
            console.error('Error deleting waifu:', err);
          }
        }}
      />
    </div>
  );
}
