import { ReactNode, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';

interface AuthShellProps {
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
  sideTitle: string;
  sideSubtitle: string;
  sideBullets: string[];
  sideImageUrl?: string;
}

export default function AuthShell({
  title,
  subtitle,
  children,
  sideTitle,
  sideSubtitle,
  sideBullets,
  sideImageUrl,
}: AuthShellProps) {
  const selectedImage = useMemo(
    () => sideImageUrl ?? '/banner/photo_2026-02-17_16-52-28.jpg',
    [sideImageUrl]
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-white to-purple-50" />
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-pink-400/20 blur-3xl" />
      <div className="absolute -bottom-28 -right-24 h-80 w-80 rounded-full bg-purple-400/20 blur-3xl" />

      <div className="relative min-h-screen grid grid-cols-1 lg:grid-cols-2">
        <div className="hidden lg:block relative">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${selectedImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/50 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          <div className="relative h-full p-12 flex flex-col">
            <Link to="/" className="inline-flex items-center gap-3 text-white w-fit">
              <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                <Heart className="h-9 w-9 text-pink-400 fill-pink-400" />
              </motion.div>
              <span className="text-2xl font-extrabold tracking-tight">My Bini</span>
            </Link>

            <div className="mt-auto space-y-5 max-w-lg">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 text-white px-4 py-2 border border-white/15 backdrop-blur">
                <Sparkles className="h-4 w-4 text-pink-300" />
                <span className="text-sm font-medium">Your personal gallery</span>
              </div>
              <h2 className="text-4xl font-extrabold text-white leading-tight">{sideTitle}</h2>
              <p className="text-white/85 text-lg leading-relaxed">{sideSubtitle}</p>
              <ul className="space-y-2 text-white/90">
                {sideBullets.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-pink-400 shrink-0" />
                    <span className="text-sm leading-6">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="relative flex items-center justify-center px-4 py-12 sm:px-6">
          <div className="w-full max-w-md">
            <div className="lg:hidden mb-8">
              <Link to="/" className="inline-flex items-center gap-3 text-gray-900 w-fit">
                <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                  <Heart className="h-9 w-9 text-pink-600 fill-pink-600" />
                </motion.div>
                <span className="text-2xl font-extrabold tracking-tight">My Bini</span>
              </Link>
            </div>

            <div className="bg-white/85 backdrop-blur rounded-2xl border border-white/60 shadow-[0_20px_55px_-25px_rgba(236,72,153,0.35)]">
              <div className="p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{title}</h1>
                    <div className="mt-2 text-sm text-gray-600">{subtitle}</div>
                  </div>
                  <div className="hidden sm:flex items-center justify-center h-11 w-11 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 text-white shadow-sm">
                    <Heart className="h-5 w-5 fill-white" />
                  </div>
                </div>

                <div className="mt-8">{children}</div>
              </div>
            </div>

            <p className="mt-6 text-xs text-gray-500 text-center">
              By continuing, you agree to keep things respectful and community-friendly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

