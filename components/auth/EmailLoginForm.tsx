import React from 'react';
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmailLoginFormProps {
    email: string;
    setEmail: (val: string) => void;
    password: string;
    setPassword: (val: string) => void;
    busy: boolean;
    onSubmit: (e: React.FormEvent) => void;
    onResetPassword: () => void;
    resetBusy: boolean;
    resetSent: boolean;
    error?: string;
    showPassword: boolean;
    setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
}

export const EmailLoginForm: React.FC<EmailLoginFormProps> = ({
    email,
    setEmail,
    password,
    setPassword,
    busy,
    onSubmit,
    onResetPassword,
    resetBusy,
    resetSent,
    error,
    showPassword,
    setShowPassword,
}) => {
    return (
        <form className="space-y-5" onSubmit={onSubmit}>
            <div className="space-y-4">
                <div>
                    <label htmlFor="email-address" className="block text-sm font-semibold text-gray-700">
                        Email
                    </label>
                    <div className="mt-2 relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            id="email-address"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white/80 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                            placeholder="you@example.com"
                            disabled={busy}
                        />
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between">
                        <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                            Password
                        </label>
                        <button
                            type="button"
                            onClick={onResetPassword}
                            className="text-sm font-semibold text-pink-700 hover:text-pink-800 disabled:opacity-60"
                            disabled={busy || resetBusy}
                        >
                            {resetBusy ? 'Sending…' : 'Forgot password?'}
                        </button>
                    </div>
                    <div className="mt-2 relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 bg-white/80 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                            placeholder="••••••••"
                            disabled={busy}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((s) => !s)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            disabled={busy}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
            </div>

            {resetSent && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    Password reset email sent.
                </div>
            )}

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                    {error}
                </div>
            )}

            <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={busy}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-pink-600 text-white py-3 font-semibold shadow-sm shadow-pink-600/30 hover:bg-pink-700 hover:shadow-pink-600/40 active:bg-pink-800 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-60"
            >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Sign in
            </motion.button>
        </form>
    );
};
