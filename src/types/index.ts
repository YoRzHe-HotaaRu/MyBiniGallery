export interface Anime {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  createdAt: number;
}

export interface Waifu {
  id: string;
  animeId: string;
  name: string;
  age?: string;
  description: string;
  imageUrl: string;
  gallery: string[];
  createdAt: number;
}

export interface WaifuComment {
  id: string;
  waifuId: string;
  uid: string;
  authorEmail?: string;
  authorName?: string;
  text: string;
  createdAt: number;
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'admin' | 'user';
  createdAt: number;
}
