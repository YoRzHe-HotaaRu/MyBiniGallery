// @/src/locales/en.ts
export const en = {
    nav: {
        home: 'Home',
        anime: 'Anime',
        waifus: 'Waifus',
        favourites: 'Favourites',
        admin: 'Admin',
        signIn: 'Sign in',
        createAccount: 'Create account',
        profile: 'Profile',
        signOut: 'Sign out',
        active: 'Active',
    },
    hero: {
        title: 'Welcome to',
        subtitle: 'Your ultimate gallery for anime waifus. Discover, collect, and admire your favorite characters in one place.',
        browseAnime: 'Browse Anime',
        exploreWaifus: 'Explore Waifus',
    },
    recentWaifus: {
        title: 'Recently Added Waifus',
        subtitle: 'Fresh drops in the gallery',
        viewAll: 'View all',
        unknownSeries: 'Unknown Series',
        empty: 'No waifus yet. Add some from the admin panel.',
    },
    animeBrowse: {
        title: 'Browse by Anime',
        subtitle: 'Jump into a series, then explore the waifus inside',
        viewAll: 'View all',
        viewWaifus: 'View waifus',
        noAnimeTitle: 'No anime yet',
        noAnimeDesc: 'Add an anime first, then start building out waifu collections.',
    },
    animeList: {
        title: 'Anime Series',
        subtitle: 'Pick a series to explore its waifu gallery.',
        searchPlaceholder: 'Search anime…',
        notFoundTitle: 'No anime found',
        notFoundDesc: 'Try a different search term.',
    },
};

export type Translations = typeof en;
