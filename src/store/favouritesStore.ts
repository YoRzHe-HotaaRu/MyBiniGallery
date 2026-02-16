import { create } from 'zustand';
import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface FavouritesState {
  ids: Record<string, true>;
  loading: boolean;
  loadForUser: (uid: string) => Promise<void>;
  clear: () => void;
  isFavourite: (waifuId: string) => boolean;
  toggleFavourite: (uid: string, waifuId: string) => Promise<void>;
}

export const useFavouritesStore = create<FavouritesState>((set, get) => ({
  ids: {},
  loading: false,
  clear: () => set({ ids: {}, loading: false }),
  isFavourite: (waifuId) => Boolean(get().ids[waifuId]),
  loadForUser: async (uid) => {
    set({ loading: true });
    try {
      const snap = await getDocs(collection(db, 'users', uid, 'favourites'));
      const ids: Record<string, true> = {};
      snap.forEach((d) => {
        ids[d.id] = true;
      });
      set({ ids, loading: false });
    } catch (err) {
      console.error('Error loading favourites:', err);
      set({ ids: {}, loading: false });
    }
  },
  toggleFavourite: async (uid, waifuId) => {
    const ref = doc(db, 'users', uid, 'favourites', waifuId);
    const isFav = Boolean(get().ids[waifuId]);
    set((s) => {
      const ids = { ...s.ids };
      if (isFav) delete ids[waifuId];
      else ids[waifuId] = true;
      return { ids };
    });

    try {
      if (isFav) {
        await deleteDoc(ref);
      } else {
        await setDoc(ref, { createdAt: Date.now() });
      }
    } catch (err) {
      console.error('Error updating favourite:', err);
      set((s) => {
        const ids = { ...s.ids };
        if (isFav) ids[waifuId] = true;
        else delete ids[waifuId];
        return { ids };
      });
    }
  },
}));

