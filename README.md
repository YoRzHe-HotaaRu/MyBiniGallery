# MyBiniGalLery

My Bini is a modern anime + waifu gallery web app where you can browse series, explore character profiles, save favourites, and join the conversation with likes and comments. It’s built with React + TypeScript + Vite, powered by Firebase (Auth + Firestore + Analytics) and Cloudinary for fast image uploads. An admin area is included for managing anime series and waifu entries.

## Screenshots

### Home / Browsing

![Homepage](screenshots/homepage_screen.jpg)

![Anime list](screenshots/anime_page_screen.jpg)

![Waifu gallery](screenshots/waifu_screen_page.jpg)

### Detail / Comments

![Waifu detail](screenshots/waifu_detail_page.jpg)

![Comments](screenshots/gallery_comment_screen.jpg)

## Features

- Browse anime series
- Browse waifu cards and open waifu detail pages
- Favourites, likes, and comments
- Authentication (Email/Password + Google)
- Admin-only routes for managing anime and waifus
- Cloudinary-backed image uploads (cover + waifu images + gallery)
- Page transitions and UI motion with Framer Motion

## Tech Stack

- React 18 + TypeScript
- Vite 6
- React Router
- Tailwind CSS
- Firebase (Auth, Firestore, Analytics)
- Cloudinary uploads (unsigned preset)
- Zustand state management
- Framer Motion animations

## Getting Started

### Prerequisites

- Node.js 18+ (recommended for Vite 6)
- A Firebase project (Auth + Firestore)
- A Cloudinary account (upload preset)

### Install

Using pnpm (recommended because this repo includes a pnpm lockfile):

```bash
pnpm install
```

Or npm:

```bash
npm install
```

### Environment Variables

Create a `.env` file at the project root (it’s ignored by git in this repo) and set:

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...

VITE_CLOUDINARY_CLOUD_NAME=...
VITE_CLOUDINARY_UPLOAD_PRESET=...
```

These keys are used in:

- Firebase config: [firebase.ts](file:///g:/DEVELOPMENT-TRAE/MyBiniGal/src/config/firebase.ts)
- Cloudinary upload helper: [cloudinary.ts](file:///g:/DEVELOPMENT-TRAE/MyBiniGal/src/lib/cloudinary.ts)

### Run the app

```bash
pnpm dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

## Scripts

- `pnpm dev` — start dev server
- `pnpm build` — typecheck + production build
- `pnpm preview` — preview production build locally
- `pnpm lint` — run ESLint
- `pnpm check` — typecheck only

## Firebase Setup Notes

### Authentication

- Enable Email/Password sign-in.
- Enable Google sign-in.

### Firestore collections used

- `users/{uid}`: stores user profile data and `role`
- `anime/{id}`: anime series list
- `waifus/{id}`: waifu entries linked to anime via `animeId`

The user role is read from Firestore and defaults to `user` if missing:

- Auth bootstrap: [App.tsx](file:///g:/DEVELOPMENT-TRAE/MyBiniGal/src/App.tsx)
- Admin guard: [AuthGuard.tsx](file:///g:/DEVELOPMENT-TRAE/MyBiniGal/src/components/AuthGuard.tsx)

### Making a user an admin

In Firestore, set `users/{uid}.role` to `admin`. Admin routes live under `/admin` (see [AppRoutes.tsx](file:///g:/DEVELOPMENT-TRAE/MyBiniGal/src/AppRoutes.tsx)).

## Cloudinary Notes

This app uploads directly from the browser using an unsigned upload preset. Treat the preset as a public capability and configure Cloudinary restrictions appropriately (allowed formats, max size, folder, etc.).

## Project Structure

```
src/
  components/   shared UI + layouts + guards
  config/       firebase setup
  hooks/        reusable hooks (theme)
  lib/          helpers (cloudinary, utils)
  pages/        routes (public + admin)
  store/        zustand stores (auth)
  types/        shared TypeScript types
```
