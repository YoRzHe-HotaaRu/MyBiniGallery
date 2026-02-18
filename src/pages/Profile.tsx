import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { collectionGroup, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { useAuthStore } from '../store/authStore';
import { useFavouritesStore } from '../store/favouritesStore';
import { Waifu } from '../types';
import { Calendar, Heart, MessageSquare, ThumbsUp, User as UserIcon } from 'lucide-react';
import { Button, Card, EmptyState, Input, PageHeader, Select, Skeleton } from '../components/ui';

function normalizeShowcaseSlots(ids: string[] | undefined) {
  const safe = Array.isArray(ids) ? ids.filter((v) => typeof v === 'string') : [];
  return [safe[0] ?? '', safe[1] ?? '', safe[2] ?? ''];
}

export default function Profile() {
  const { user, setUser } = useAuthStore();
  const { ids: favouriteIdsMap } = useFavouritesStore();

  const favouriteIds = useMemo(() => Object.keys(favouriteIdsMap), [favouriteIdsMap]);

  const [profileLoading, setProfileLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [waifusLoading, setWaifusLoading] = useState(true);
  const [error, setError] = useState('');

  const [displayName, setDisplayName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [likesGiven, setLikesGiven] = useState(0);
  const [commentsGiven, setCommentsGiven] = useState(0);
  const [topCommentedWaifuId, setTopCommentedWaifuId] = useState<string | null>(null);
  const [topCommentedCount, setTopCommentedCount] = useState(0);
  const [topCommentedWaifu, setTopCommentedWaifu] = useState<Waifu | null>(null);

  const [showcaseSlots, setShowcaseSlots] = useState<string[]>(['', '', '']);
  const [savedShowcaseSlots, setSavedShowcaseSlots] = useState<string[]>(['', '', '']);
  const [savingShowcase, setSavingShowcase] = useState(false);

  const [favouriteWaifus, setFavouriteWaifus] = useState<Waifu[]>([]);

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.displayName?.trim() || '');
  }, [user]);

  useEffect(() => {
    const run = async () => {
      if (!user) return;
      setProfileLoading(true);
      setError('');
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        const data = (snap.data() ?? {}) as Record<string, unknown>;
        const name = typeof data.displayName === 'string' ? data.displayName : '';
        const slots = normalizeShowcaseSlots(data.showcaseWaifuIds as string[] | undefined);
        if (name.trim()) setDisplayName(name.trim());
        setShowcaseSlots(slots);
        setSavedShowcaseSlots(slots);
      } catch {
        setError('Could not load your profile details.');
      } finally {
        setProfileLoading(false);
      }
    };

    run();
  }, [user]);

  useEffect(() => {
    const run = async () => {
      if (!user) return;
      setStatsLoading(true);
      setError('');
      try {
        const likesSnap = await getDocs(query(collectionGroup(db, 'likes'), where('uid', '==', user.uid)));
        setLikesGiven(likesSnap.size);

        const commentsSnap = await getDocs(query(collectionGroup(db, 'comments'), where('uid', '==', user.uid)));
        setCommentsGiven(commentsSnap.size);

        const counts: Record<string, number> = {};
        commentsSnap.forEach((d) => {
          const waifuId = d.ref.parent.parent?.id;
          if (!waifuId) return;
          counts[waifuId] = (counts[waifuId] ?? 0) + 1;
        });

        const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        const [bestId, bestCount] = entries[0] ?? [];
        setTopCommentedWaifuId(bestId ?? null);
        setTopCommentedCount(typeof bestCount === 'number' ? bestCount : 0);
      } catch (err: unknown) {
        console.error('Profile stats error:', err);
        const code = (err as { code?: unknown })?.code;
        const message = (err as { message?: unknown })?.message;
        const codeText = typeof code === 'string' ? code : '';
        const messageText = typeof message === 'string' ? message : '';

        if (codeText === 'failed-precondition' || messageText.toLowerCase().includes('index')) {
          setError(
            'Stats need a Firestore index. In Firebase console → Firestore Database → Indexes: add collection-group indexes for likes(uid) and comments(uid).'
          );
        } else if (codeText === 'permission-denied') {
          setError('Stats are blocked by Firestore rules. Allow reads for waifus/*/likes and waifus/*/comments.');
        } else {
          setError(codeText ? `Could not load your stats right now. (${codeText})` : 'Could not load your stats right now.');
        }
        setLikesGiven(0);
        setCommentsGiven(0);
        setTopCommentedWaifuId(null);
        setTopCommentedCount(0);
      } finally {
        setStatsLoading(false);
      }
    };

    run();
  }, [user]);

  useEffect(() => {
    const run = async () => {
      if (!topCommentedWaifuId) {
        setTopCommentedWaifu(null);
        return;
      }
      try {
        const snap = await getDoc(doc(db, 'waifus', topCommentedWaifuId));
        if (!snap.exists()) {
          setTopCommentedWaifu(null);
          return;
        }
        setTopCommentedWaifu({ id: snap.id, ...(snap.data() as Omit<Waifu, 'id'>) });
      } catch {
        setTopCommentedWaifu(null);
      }
    };

    run();
  }, [topCommentedWaifuId]);

  useEffect(() => {
    const run = async () => {
      if (!user) return;
      setWaifusLoading(true);
      try {
        const docs = await Promise.all(
          favouriteIds.slice(0, 60).map(async (id) => {
            const snap = await getDoc(doc(db, 'waifus', id));
            if (!snap.exists()) return null;
            return { id: snap.id, ...(snap.data() as Omit<Waifu, 'id'>) };
          })
        );
        const list = (docs.filter(Boolean) as Waifu[]).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        setFavouriteWaifus(list);
      } catch {
        setFavouriteWaifus([]);
      } finally {
        setWaifusLoading(false);
      }
    };

    run();
  }, [user, favouriteIds]);

  const isShowcaseDirty = useMemo(() => {
    return JSON.stringify(showcaseSlots) !== JSON.stringify(savedShowcaseSlots);
  }, [showcaseSlots, savedShowcaseSlots]);

  if (!user) return null;

  const createdAtLabel = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—';
  const initials = (user.displayName?.trim() || user.email || 'U')[0]?.toUpperCase() || 'U';

  return (
    <div className="space-y-8">
      <PageHeader
        title="Profile"
        subtitle="Your stats, your favourites, your vibe."
        actions={
          <Link
            to="/waifus"
            className="h-11 px-5 rounded-xl font-semibold text-white bg-pink-600 hover:bg-pink-700 active:bg-pink-800 inline-flex items-center justify-center shadow-sm shadow-pink-600/30 hover:shadow-pink-600/40 transition focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
          >
            Browse waifus
          </Link>
        }
      />

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="space-y-6 lg:col-span-1">
          <Card className="p-6">
            <div className="flex items-start gap-4">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt=""
                  className="h-14 w-14 rounded-2xl object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="h-14 w-14 rounded-2xl bg-pink-600 text-white flex items-center justify-center font-extrabold shadow-sm shadow-pink-600/30">
                  {initials}
                </div>
              )}
              <div className="flex-1">
                <div className="text-lg font-extrabold text-gray-900">Account</div>
                <div className="mt-1 text-sm text-gray-600">
                  Signed in as <span className="font-semibold">{user.displayName?.trim() || 'User'}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {profileLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-11 w-32" />
                </div>
              ) : (
                <>
                  <div>
                    <div className="text-sm font-semibold text-gray-700">Username</div>
                    <div className="mt-2">
                      <Input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Pick a username"
                        maxLength={32}
                        left={<UserIcon className="h-4 w-4" />}
                        disabled={savingProfile}
                      />
                    </div>
                    <div className="mt-2 text-xs text-gray-500">This is what people see on your comments.</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      className="h-11"
                      disabled={savingProfile || displayName.trim().length < 2 || displayName.trim() === (user.displayName?.trim() || '')}
                      onClick={async () => {
                        const name = displayName.trim();
                        if (name.length < 2) return;
                        setSavingProfile(true);
                        setError('');
                        try {
                          if (auth.currentUser) {
                            await updateProfile(auth.currentUser, { displayName: name });
                          }
                          await setDoc(
                            doc(db, 'users', user.uid),
                            { displayName: name, updatedAt: Date.now() },
                            { merge: true }
                          );
                          setUser({ ...user, displayName: name });
                        } catch {
                          setError('Could not update your username right now.');
                        } finally {
                          setSavingProfile(false);
                        }
                      }}
                    >
                      Save username
                    </Button>
                    <Link
                      to="/favourites"
                      className="h-11 px-4 rounded-xl font-semibold text-gray-900 border border-gray-200 bg-white hover:bg-gray-50 inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                    >
                      View favourites
                    </Link>
                  </div>
                </>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-lg font-extrabold text-gray-900">Stats</div>
            <div className="mt-4 space-y-3">
              {statsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-5 w-1/2" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Calendar className="h-4 w-4 text-pink-600" />
                      Account created
                    </div>
                    <div className="text-sm font-extrabold text-gray-900">{createdAtLabel}</div>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Heart className="h-4 w-4 text-pink-600" />
                      Favourites saved
                    </div>
                    <div className="text-sm font-extrabold text-gray-900 tabular-nums">{favouriteIds.length}</div>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <ThumbsUp className="h-4 w-4 text-pink-600" />
                      Likes given
                    </div>
                    <div className="text-sm font-extrabold text-gray-900 tabular-nums">{likesGiven}</div>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <MessageSquare className="h-4 w-4 text-pink-600" />
                      Comments posted
                    </div>
                    <div className="text-sm font-extrabold text-gray-900 tabular-nums">{commentsGiven}</div>
                  </div>
                  <div className="pt-3 border-t border-gray-100">
                    <div className="text-sm font-semibold text-gray-700">Most commented waifu</div>
                    {topCommentedWaifuId && topCommentedWaifu ? (
                      <Link
                        to={`/waifu/${topCommentedWaifuId}`}
                        className="mt-2 inline-flex items-center justify-between gap-3 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 hover:bg-gray-50 transition"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-extrabold text-gray-900 truncate">{topCommentedWaifu.name}</div>
                          <div className="text-xs text-gray-600">{topCommentedCount} comments</div>
                        </div>
                        <div className="text-sm font-extrabold text-pink-700">Open</div>
                      </Link>
                    ) : (
                      <div className="mt-2 text-sm text-gray-600">No comment history yet.</div>
                    )}
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-extrabold text-gray-900">Top 3 showcase</div>
                <div className="mt-1 text-sm text-gray-600">Pick up to 3 favourites to pin on your profile.</div>
              </div>
              <Button
                type="button"
                className="h-10"
                disabled={savingShowcase || !isShowcaseDirty}
                onClick={async () => {
                  const next = Array.from(new Set(showcaseSlots.filter(Boolean))).slice(0, 3);
                  const normalized = normalizeShowcaseSlots(next);
                  setSavingShowcase(true);
                  setError('');
                  try {
                    await setDoc(
                      doc(db, 'users', user.uid),
                      { showcaseWaifuIds: next, updatedAt: Date.now() },
                      { merge: true }
                    );
                    setShowcaseSlots(normalized);
                    setSavedShowcaseSlots(normalized);
                    setUser({ ...user, showcaseWaifuIds: next });
                  } catch {
                    setError('Could not save your showcase right now.');
                  } finally {
                    setSavingShowcase(false);
                  }
                }}
              >
                Save showcase
              </Button>
            </div>

            {waifusLoading ? (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="aspect-square w-full rounded-none" />
                    <div className="p-4">
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : favouriteWaifus.length === 0 ? (
              <EmptyState
                className="mt-6"
                title="No favourites to showcase yet"
                description="Favourite a few waifus first, then come back and pin your top 3 here."
                action={
                  <Link
                    to="/waifus"
                    className="h-11 px-5 rounded-xl font-semibold text-white bg-pink-600 hover:bg-pink-700 active:bg-pink-800 inline-flex items-center justify-center shadow-sm shadow-pink-600/30 hover:shadow-pink-600/40 transition focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                  >
                    Browse waifus
                  </Link>
                }
              />
            ) : (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {showcaseSlots.map((slotId, idx) => {
                  const waifu = favouriteWaifus.find((w) => w.id === slotId) ?? null;
                  const otherSelected = new Set(showcaseSlots.filter(Boolean));
                  if (slotId) otherSelected.delete(slotId);
                  const options = favouriteWaifus.filter((w) => !otherSelected.has(w.id));

                  return (
                    <div key={idx} className="space-y-3">
                      <Card className="overflow-hidden">
                        <div className="aspect-square relative bg-gray-100">
                          {waifu ? (
                            <>
                              <img
                                src={waifu.imageUrl}
                                alt={waifu.name}
                                className="absolute inset-0 w-full h-full object-cover object-top"
                                loading="lazy"
                                decoding="async"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
                              <div className="absolute inset-x-0 bottom-0 p-4">
                                <div className="text-white font-extrabold truncate">{waifu.name}</div>
                              </div>
                            </>
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-gray-500">
                              Pick a waifu
                            </div>
                          )}
                        </div>
                      </Card>

                      <Select
                        value={slotId}
                        onChange={(e) => {
                          const next = [...showcaseSlots];
                          next[idx] = e.target.value;
                          setShowcaseSlots(next);
                        }}
                        disabled={savingShowcase}
                      >
                        <option value="">None</option>
                        {options.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.name}
                          </option>
                        ))}
                      </Select>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
