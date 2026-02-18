import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { collectionGroup, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { PublicUserProfile, Waifu } from '../types';
import { Calendar, Heart, MessageSquare, ThumbsUp, User as UserIcon } from 'lucide-react';
import { Card, EmptyState, PageHeader, Skeleton } from '../components/ui';

function normalizeShowcaseSlots(ids: string[] | undefined) {
  const safe = Array.isArray(ids) ? ids.filter((v) => typeof v === 'string') : [];
  return [safe[0] ?? '', safe[1] ?? '', safe[2] ?? ''];
}

export default function PublicProfile() {
  const { uid } = useParams();
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [showcaseLoading, setShowcaseLoading] = useState(true);
  const [error, setError] = useState('');

  const [likesGiven, setLikesGiven] = useState(0);
  const [commentsGiven, setCommentsGiven] = useState(0);
  const [topCommentedWaifuId, setTopCommentedWaifuId] = useState<string | null>(null);
  const [topCommentedCount, setTopCommentedCount] = useState(0);
  const [topCommentedWaifu, setTopCommentedWaifu] = useState<Waifu | null>(null);
  const [showcaseWaifus, setShowcaseWaifus] = useState<(Waifu | null)[]>([null, null, null]);

  const safeUid = typeof uid === 'string' ? uid : '';

  useEffect(() => {
    const run = async () => {
      if (!safeUid) return;
      setProfileLoading(true);
      setError('');
      try {
        const snap = await getDoc(doc(db, 'publicUsers', safeUid));
        if (!snap.exists()) {
          setProfile(null);
          return;
        }
        const data = snap.data() as Omit<PublicUserProfile, 'uid'>;
        setProfile({ uid: snap.id, ...data });
      } catch (err: unknown) {
        console.error('Public profile error:', err);
        setError('Could not load this profile right now.');
        setProfile(null);
      } finally {
        setProfileLoading(false);
      }
    };

    run();
  }, [safeUid]);

  useEffect(() => {
    const run = async () => {
      if (!safeUid) return;
      setStatsLoading(true);
      setError('');
      try {
        const likesSnap = await getDocs(query(collectionGroup(db, 'likes'), where('uid', '==', safeUid)));
        setLikesGiven(likesSnap.size);

        const commentsSnap = await getDocs(query(collectionGroup(db, 'comments'), where('uid', '==', safeUid)));
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
        console.error('Public profile stats error:', err);
        const code = (err as { code?: unknown })?.code;
        const message = (err as { message?: unknown })?.message;
        const codeText = typeof code === 'string' ? code : '';
        const messageText = typeof message === 'string' ? message : '';
        if (codeText === 'failed-precondition' || messageText.toLowerCase().includes('index')) {
          setError('Stats need a Firestore index (collection group index for likes(uid) and comments(uid)).');
        } else if (codeText === 'permission-denied') {
          setError('Stats are blocked by Firestore rules.');
        } else {
          setError(codeText ? `Could not load stats. (${codeText})` : 'Could not load stats.');
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
  }, [safeUid]);

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

  const showcaseIds = useMemo(() => normalizeShowcaseSlots(profile?.showcaseWaifuIds), [profile?.showcaseWaifuIds]);

  useEffect(() => {
    const run = async () => {
      if (!profile) return;
      setShowcaseLoading(true);
      try {
        const docs = await Promise.all(
          showcaseIds.map(async (id) => {
            if (!id) return null;
            const snap = await getDoc(doc(db, 'waifus', id));
            if (!snap.exists()) return null;
            return { id: snap.id, ...(snap.data() as Omit<Waifu, 'id'>) };
          })
        );
        setShowcaseWaifus(docs);
      } catch {
        setShowcaseWaifus([null, null, null]);
      } finally {
        setShowcaseLoading(false);
      }
    };

    run();
  }, [profile, showcaseIds]);

  const titleName = profile?.displayName?.trim() || 'User';
  const createdAtLabel = profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—';
  const initials = (titleName[0] || 'U').toUpperCase();

  return (
    <div className="space-y-8">
      <PageHeader title={profileLoading ? 'Profile' : titleName} subtitle="Public profile" />

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      ) : null}

      {profileLoading ? (
        <Card className="p-8">
          <div className="space-y-4">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-5 w-72" />
          </div>
        </Card>
      ) : !profile ? (
        <EmptyState
          title="Profile not found"
          description="This user might not have a public profile yet."
          action={
            <Link
              to="/"
              className="h-11 px-5 rounded-xl font-semibold text-white bg-pink-600 hover:bg-pink-700 active:bg-pink-800 inline-flex items-center justify-center shadow-sm shadow-pink-600/30 hover:shadow-pink-600/40 transition focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
            >
              Go home
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="space-y-6 lg:col-span-1">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                {profile.photoURL ? (
                  <img
                    src={profile.photoURL}
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
                  <div className="text-lg font-extrabold text-gray-900">{titleName}</div>
                  <div className="mt-1 text-sm text-gray-600">Public profile</div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Calendar className="h-4 w-4 text-pink-600" />
                    Account created
                  </div>
                  <div className="text-sm font-extrabold text-gray-900">{createdAtLabel}</div>
                </div>
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
                  <div className="mt-1 text-sm text-gray-600">Pinned favourites from this user.</div>
                </div>
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Heart className="h-4 w-4 text-pink-600" />
                  <span>Showcase</span>
                </div>
              </div>

              {showcaseLoading ? (
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
              ) : showcaseWaifus.every((w) => !w) ? (
                <EmptyState
                  className="mt-6"
                  title="No showcase waifus yet"
                  description="This user hasn’t pinned any favourites."
                />
              ) : (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {showcaseWaifus.map((waifu, idx) => (
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
                              Empty slot
                            </div>
                          )}
                        </div>
                      </Card>

                      {waifu ? (
                        <Link
                          to={`/waifu/${waifu.id}`}
                          className="h-11 w-full rounded-xl font-semibold text-gray-900 border border-gray-200 bg-white hover:bg-gray-50 inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                        >
                          Open waifu
                        </Link>
                      ) : (
                        <div className="h-11 w-full rounded-xl border border-dashed border-gray-200 text-sm font-semibold text-gray-500 flex items-center justify-center">
                          <UserIcon className="h-4 w-4 mr-2" />
                          No pick
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

