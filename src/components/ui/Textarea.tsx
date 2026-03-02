import React from 'react';
import { cn } from '@/lib/utils';

export function Textarea({
    className,
    ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <textarea
            className={cn(
                'w-full rounded-xl border border-gray-200 bg-white/80 shadow-sm text-gray-900 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent',
                className
            )}
            {...props}
        />
    );
}
