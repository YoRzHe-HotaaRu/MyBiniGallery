import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Waifu, Anime } from '../types';
import { ArrowLeft, Calendar, Image as ImageIcon, Heart, MessageSquare, Send, ThumbsUp, Trash2, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useFavouritesStore } from '../store/favouritesStore';
import { useWaifuComments } from '../hooks/useWaifuComments';
import { useWaifuLikes } from '../hooks/useWaifuLikes';
import { Button, Card, CardHeader, ConfirmDialog, EmptyState, Skeleton, Textarea } from '../components/ui';

export default function WaifuDetail() {
  const { id } = useParams<{ id: string }>();
  const [waifu, setWaifu] = useState<Waifu | null>(null);
  const [anime, setAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commentBusy, setCommentBusy] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [likeError, setLikeError] = useState('');
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const { user } = useAuthStore();
  const { isFavourite, toggleFavourite } = useFavouritesStore();
  const { comments, loading: commentsLoading, addComment, deleteComment } = useWaifuComments(id);
  const { count: likeCount, liked, toggle: toggleLike } = useWaifuLikes(id, user?.uid);
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="overflow-hidden lg:col-span-1">
            <Skeleton className="aspect-[3/4] w-full rounded-none" />
          </Card>
          <Card className="lg:col-span-2 p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-5 w-48" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-11 w-24 rounded-full" />
                <Skeleton className="h-11 w-11 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-11/12" />
            <Skeleton className="h-5 w-10/12" />
          </Card>
        </div>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="overflow-hidden lg:col-span-1">
              <div className="relative">
                <img
                  src={waifu.imageUrl}
                  alt={waifu.name}
                  className="w-full h-auto object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>
            </Card>

            <Card className="lg:col-span-2 p-6 sm:p-8 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">{waifu.name}</h1>
                  <div className="mt-2">
                    <Link
                      to={`/waifus?anime=${anime?.id}`}
                      className="text-sm sm:text-base font-semibold text-pink-700 hover:text-pink-800"
                    >
                      {anime?.title || 'Unknown Series'}
                    </Link>
                  </div>
                </div>

                <div className="mt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!user) {
                        navigate('/login', { state: { from: location }, replace: false });
                        return;
                      }
                      setLikeError('');
                      try {
                        await toggleLike();
                      } catch {
                        setLikeError('Failed to update like');
                      }
                    }}
                    className="h-11 px-3 rounded-full bg-white shadow-sm border border-gray-100 inline-flex items-center gap-2 hover:bg-pink-50 transition-colors"
                    aria-label="Toggle like"
                  >
                    <ThumbsUp className={`h-5 w-5 ${liked ? 'text-pink-600 fill-pink-600' : 'text-gray-600'}`} />
                    <span className="text-sm font-semibold text-gray-800 tabular-nums">{likeCount}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!user) {
                        navigate('/login', { state: { from: location }, replace: false });
                        return;
                      }
                      toggleFavourite(user.uid, waifu.id);
                    }}
                    className="w-11 h-11 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center hover:bg-pink-50 transition-colors"
                    aria-label="Toggle favourite"
                  >
                    <Heart className={`h-6 w-6 ${isFavourite(waifu.id) ? 'text-pink-600 fill-pink-600' : 'text-gray-600'}`} />
                  </button>
                </div>
              </div>

              {(likeError || commentError) ? (
                <div className="text-sm font-semibold text-red-600">{likeError || commentError}</div>
              ) : null}

              <div className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">
                {waifu.description}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {waifu.age ? (
                  <div className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800">
                    <Calendar className="h-4 w-4 text-pink-600" />
                    Age: {waifu.age}
                  </div>
                ) : null}
                <div className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800">
                  <MessageSquare className="h-4 w-4 text-pink-600" />
                  {comments.length} comments
                </div>
              </div>
            </Card>
          </div>

          {waifu.gallery && waifu.gallery.length > 0 ? (
            <Card className="p-6 sm:p-8">
              <CardHeader
                title={
                  <span className="inline-flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-pink-600" />
                    Gallery
                  </span>
                }
                subtitle="Tap an image to view it full-size."
              />

              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {waifu.gallery.map((image, index) => (
                  <button
                    key={index}
                    type="button"
                    className="group relative aspect-square rounded-2xl overflow-hidden border border-white/60 bg-white shadow-sm hover:shadow-md transition"
                    onClick={() => setSelectedImage(image)}
                    aria-label={`Open gallery image ${index + 1}`}
                  >
                    <img
                      src={image}
                      alt={`${waifu.name} gallery ${index + 1}`}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </button>
                ))}
              </div>
            </Card>
          ) : null}

          <Card className="p-6 sm:p-8">
            <CardHeader
              title={
                <span className="inline-flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-pink-600" />
                  Comments
                </span>
              }
              subtitle={user ? 'Be kind. Keep it fun.' : 'Sign in to like and comment.'}
              actions={
                !user ? (
                  <Link
                    to="/login"
                    state={{ from: location }}
                    className="h-10 px-4 rounded-xl font-semibold text-white bg-pink-600 hover:bg-pink-700 active:bg-pink-800 inline-flex items-center justify-center shadow-sm shadow-pink-600/30 hover:shadow-pink-600/40 transition focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                  >
                    Sign in
                  </Link>
                ) : null
              }
            />

            {user ? (
              <form
                className="mt-6"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setCommentError('');
                  setLikeError('');
                  if (!commentText.trim()) return;
                  setCommentBusy(true);
                  try {
                    await addComment({
                      uid: user.uid,
                      authorName: user.displayName?.trim() || 'User',
                      text: commentText,
                    });
                    setCommentText('');
                  } catch {
                    setCommentError('Failed to post comment');
                  } finally {
                    setCommentBusy(false);
                  }
                }}
              >
                <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
                  <Textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={3}
                    placeholder="Write a comment…"
                    maxLength={500}
                    disabled={commentBusy}
                  />
                  <Button type="submit" disabled={commentBusy || !commentText.trim()} className="sm:mt-0">
                    <Send className="h-4 w-4" />
                    Post
                  </Button>
                </div>
                <div className="mt-2 text-xs text-gray-500">{commentText.trim().length}/500</div>
              </form>
            ) : null}

            <div className="mt-6 space-y-3">
              {commentsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-28" />
                        </div>
                        <Skeleton className="h-8 w-8 rounded-xl" />
                      </div>
                      <div className="mt-3 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-10/12" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : comments.length === 0 ? (
                <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm text-gray-600">
                  No comments yet.
                </div>
              ) : (
                comments.map((c) => {
                  const canDelete = Boolean(user && (user.role === 'admin' || c.uid === user.uid));
                  return (
                    <Card key={c.id} className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-extrabold text-gray-900">
                            {c.authorName?.trim() || 'Anonymous'}
                          </div>
                          <div className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString()}</div>
                        </div>
                        {canDelete ? (
                          <button
                            type="button"
                            onClick={() => setCommentToDelete(c.id)}
                            className="h-9 w-9 rounded-xl inline-flex items-center justify-center text-gray-600 hover:text-red-600 hover:bg-red-50 transition"
                            aria-label="Delete comment"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : null}
                      </div>
                      <div className="mt-3 text-sm text-gray-800 whitespace-pre-wrap">{c.text}</div>
                    </Card>
                  );
                })
              )}
            </div>
          </Card>
        </>
      )}

      <ConfirmDialog
        open={Boolean(commentToDelete)}
        title="Delete comment?"
        description="This cannot be undone."
        confirmText="Delete"
        danger
        onClose={() => setCommentToDelete(null)}
        onConfirm={async () => {
          if (!commentToDelete) return;
          setCommentError('');
          try {
            await deleteComment(commentToDelete);
          } catch {
            setCommentError('Failed to delete comment');
          }
        }}
      />

      {selectedImage ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl w-full">
            <img
              src={selectedImage}
              alt="Full size"
              className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
            />
            <button
              type="button"
              className="absolute -top-3 -right-3 h-10 w-10 rounded-2xl bg-white text-gray-900 shadow-lg flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
              aria-label="Close image"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
