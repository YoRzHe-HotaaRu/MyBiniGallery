import { useCallback, useEffect, useMemo, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../config/firebase';
import { WaifuComment } from '../types';

interface AddCommentInput {
  uid: string;
  authorEmail: string;
  authorName?: string;
  text: string;
}

interface UseWaifuCommentsResult {
  comments: WaifuComment[];
  loading: boolean;
  addComment: (input: AddCommentInput) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
}

export function useWaifuComments(waifuId: string | undefined): UseWaifuCommentsResult {
  const [comments, setComments] = useState<WaifuComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!waifuId) {
      setComments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const commentsRef = collection(db, 'waifus', waifuId, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const next: WaifuComment[] = snap.docs.map((d) => ({
          id: d.id,
          waifuId,
          ...(d.data() as Omit<WaifuComment, 'id' | 'waifuId'>),
        }));
        setComments(next);
        setLoading(false);
      },
      () => {
        setComments([]);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [waifuId]);

  const addComment = useCallback(
    async (input: AddCommentInput) => {
      if (!waifuId) return;
      const text = input.text.trim();
      if (!text) return;

      const commentsRef = collection(db, 'waifus', waifuId, 'comments');
      await addDoc(commentsRef, {
        uid: input.uid,
        authorEmail: input.authorEmail,
        authorName: input.authorName ?? '',
        text,
        createdAt: Date.now(),
      });
    },
    [waifuId]
  );

  const deleteComment = useCallback(
    async (commentId: string) => {
      if (!waifuId) return;
      await deleteDoc(doc(db, 'waifus', waifuId, 'comments', commentId));
    },
    [waifuId]
  );

  return useMemo(() => ({ comments, loading, addComment, deleteComment }), [comments, loading, addComment, deleteComment]);
}

