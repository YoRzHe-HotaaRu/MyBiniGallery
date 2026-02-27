import React from 'react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export function Button({
    className,
    variant = 'primary',
    size = 'md',
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
}) {
    const base =
        'inline-flex items-center justify-center gap-2 font-semibold transition focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none';

    const sizes: Record<ButtonSize, string> = {
        sm: 'h-9 px-3 rounded-lg text-sm',
        md: 'h-11 px-4 rounded-xl text-sm',
        lg: 'h-12 px-5 rounded-xl text-base',
    };

    const variants: Record<ButtonVariant, string> = {
        primary:
            'bg-pink-600 text-white shadow-sm shadow-pink-600/30 hover:bg-pink-700 hover:shadow-pink-600/40 active:bg-pink-800',
        secondary:
            'bg-white text-gray-900 border border-gray-200 shadow-sm hover:bg-gray-50',
        ghost: 'bg-transparent text-gray-700 hover:bg-white/70',
        danger:
            'bg-red-600 text-white shadow-sm hover:bg-red-700 focus:ring-red-500',
    };

    return (
        <button
            className={cn(base, sizes[size], variants[variant], className)}
            {...props}
        />
    );
}
