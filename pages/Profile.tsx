// @/src/pages/Profile.tsx
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, collectionGroup, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { deleteUser, updateProfile } from 'firebase/auth';
import { auth, db } from '@/config/firebase';
import { useAuthStore } from '@/store/authStore';
import { useFavouritesStore } from '@/store/favouritesStore';
import { Waifu } from '@/types';
import { PageHeader, ConfirmDialog } from '@/components/ui';
import { UserAccountCard } from '@/components/profile/UserAccountCard';
import { UserStatsCard } from '@/components/profile/UserStatsCard';
import { UserDangerZone } from '@/components/profile/UserDangerZone';
import { UserShowcaseSettings } from '@/components/profile/UserShowcaseSettings';

function normalizeShowcaseSlots(ids: string[] | undefined) {
  const safe = Array.isArray(ids) ? ids.filter((v) => typeof v === 'string') : [];
  return [safe[0] ?? '', safe[1] ?? '', safe[2] ?? ''];
}

function chunk<T>(items: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

export default function Profile() {
  const { user, setUser } = useAuthStore();
  const { ids: favouriteIdsMap } = useFavouritesStore();
  const navigate = useNavigate();

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
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState('');

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
        await setDoc(
          doc(db, 'publicUsers', user.uid),
          {
            uid: user.uid,
            displayName: (name.trim() || user.displayName?.trim() || ''),
            photoURL: user.photoURL || '',
            createdAt: user.createdAt,
            showcaseWaifuIds: slots.filter(Boolean),
            updatedAt: Date.now(),
          },
          { merge: true }
        );
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

  const handleSaveProfile = async () => {
    if (!user) return;
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
      await setDoc(
        doc(db, 'publicUsers', user.uid),
        { uid: user.uid, displayName: name, photoURL: user.photoURL || '', createdAt: user.createdAt, updatedAt: Date.now() },
        { merge: true }
      );
      setUser({ ...user, displayName: name });
    } catch {
      setError('Could not update your username right now.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveShowcase = async () => {
    if (!user) return;
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
      await setDoc(
        doc(db, 'publicUsers', user.uid),
        { uid: user.uid, showcaseWaifuIds: next, updatedAt: Date.now() },
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
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    const current = auth.currentUser;
    if (!current) return;
    setDeleteBusy(true);
    setDeleteError('');
    try {
      const uid = user.uid;

      const favSnap = await getDocs(collection(db, 'users', uid, 'favourites'));
      const favRefs = favSnap.docs.map((d) => d.ref);
      for (const group of chunk(favRefs, 25)) await Promise.all(group.map((r) => deleteDoc(r)));

      const likesSnap = await getDocs(query(collectionGroup(db, 'likes'), where('uid', '==', uid)));
      const likeRefs = likesSnap.docs.map((d) => d.ref);
      for (const group of chunk(likeRefs, 25)) await Promise.all(group.map((r) => deleteDoc(r)));

      const commentsSnap = await getDocs(query(collectionGroup(db, 'comments'), where('uid', '==', uid)));
      const commentRefs = commentsSnap.docs.map((d) => d.ref);
      for (const group of chunk(commentRefs, 25)) await Promise.all(group.map((r) => deleteDoc(r)));

      await deleteDoc(doc(db, 'publicUsers', uid));
      await deleteDoc(doc(db, 'users', uid));

      await deleteUser(current);
      setUser(null);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      console.error('Delete account error:', err);
      const code = (err as { code?: unknown })?.code;
      const message = (err as { message?: unknown })?.message;
      const codeText = typeof code === 'string' ? code : '';
      const messageText = typeof message === 'string' ? message : '';
      if (codeText === 'auth/requires-recent-login') {
        setDeleteError('For security reasons, please sign in again, then try deleting your account.');
      } else if (codeText === 'permission-denied') {
        setDeleteError(
          'Firestore blocked the delete. Publish the latest firestore.rules (users/publicUsers delete enabled) and try again.'
        );
      } else {
        setDeleteError(messageText || 'Could not delete your account right now.');
      }
    } finally {
      setDeleteBusy(false);
    }
  };

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
          <UserAccountCard
            user={user}
            initials={initials}
            profileLoading={profileLoading}
            displayName={displayName}
            setDisplayName={setDisplayName}
            savingProfile={savingProfile}
            onSaveProfile={handleSaveProfile}
          />

          <UserStatsCard
            statsLoading={statsLoading}
            createdAtLabel={createdAtLabel}
            favouriteCount={favouriteIds.length}
            likesGiven={likesGiven}
            commentsGiven={commentsGiven}
            topCommentedWaifuId={topCommentedWaifuId}
            topCommentedWaifu={topCommentedWaifu}
            topCommentedCount={topCommentedCount}
          />

          <UserDangerZone
            deleteError={deleteError}
            deleteBusy={deleteBusy}
            onDeleteClick={() => setDeleteOpen(true)}
          />
        </div>

        <div className="space-y-6 lg:col-span-2">
          <UserShowcaseSettings
            waifusLoading={waifusLoading}
            savingShowcase={savingShowcase}
            isShowcaseDirty={isShowcaseDirty}
            onSaveShowcase={handleSaveShowcase}
            favouriteWaifus={favouriteWaifus}
            showcaseSlots={showcaseSlots}
            setShowcaseSlots={setShowcaseSlots}
          />
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete your account?"
        description="This removes your profile, favourites, likes, and comments. No take-backs."
        confirmText={deleteBusy ? 'Deleting…' : 'Delete account'}
        cancelText="Cancel"
        danger
        onClose={() => {
          if (deleteBusy) return;
          setDeleteOpen(false);
        }}
        onConfirm={handleDeleteAccount}
      />
    </div>
  );
}
