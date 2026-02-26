import { useCallback, useEffect, useMemo, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface UseWaifuLikesResult {
  count: number;
  liked: boolean;
  toggle: () => Promise<void>;
}

export function useWaifuLikes(waifuId: string | undefined, uid: string | undefined): UseWaifuLikesResult {
  const [count, setCount] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (!waifuId) return;

    const likesRef = collection(db, 'waifus', waifuId, 'likes');
    const unsub = onSnapshot(likesRef, (snap) => {
      setCount(snap.size);
      setLiked(Boolean(uid && snap.docs.some((d) => d.id === uid)));
    });

    return () => unsub();
  }, [waifuId, uid]);

  const toggle = useCallback(async () => {
    if (!waifuId || !uid) return;

    const likeRef = doc(db, 'waifus', waifuId, 'likes', uid);
    const willLike = !liked;
    setLiked(willLike);
    setCount((c) => (willLike ? c + 1 : Math.max(0, c - 1)));

    try {
      if (willLike) {
        await setDoc(likeRef, { uid, createdAt: Date.now() });
      } else {
        await deleteDoc(likeRef);
      }
    } catch (err) {
      setLiked(!willLike);
      setCount((c) => (willLike ? Math.max(0, c - 1) : c + 1));
      throw err;
    }
  }, [waifuId, uid, liked]);

  return useMemo(() => ({ count, liked, toggle }), [count, liked, toggle]);
}

