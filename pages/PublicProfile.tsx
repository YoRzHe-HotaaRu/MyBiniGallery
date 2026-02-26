// @/src/pages/PublicProfile.tsx
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { collectionGroup, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { PublicUserProfile, Waifu } from '@/types';
import { EmptyState, PageHeader } from '@/components/ui';
import { ProfileSkeleton } from '@/components/profile/ProfileSkeleton';
import { ProfileBasicInfo } from '@/components/profile/ProfileBasicInfo';
import { ProfileStatsCard } from '@/components/profile/ProfileStatsCard';
import { ProfileShowcase } from '@/components/profile/ProfileShowcase';

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
  const createdAtLabel =
    typeof profile?.createdAt === 'number' ? new Date(profile.createdAt).toLocaleDateString() : '—';
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
        <ProfileSkeleton />
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
            <ProfileBasicInfo
              initials={initials}
              titleName={titleName}
              createdAtLabel={createdAtLabel}
              photoURL={profile.photoURL}
            />

            <ProfileStatsCard
              statsLoading={statsLoading}
              likesGiven={likesGiven}
              commentsGiven={commentsGiven}
              topCommentedWaifuId={topCommentedWaifuId}
              topCommentedWaifu={topCommentedWaifu}
              topCommentedCount={topCommentedCount}
            />
          </div>

          <div className="space-y-6 lg:col-span-2">
            <ProfileShowcase
              showcaseLoading={showcaseLoading}
              showcaseWaifus={showcaseWaifus}
            />
          </div>
        </div>
      )}
    </div>
  );
}
