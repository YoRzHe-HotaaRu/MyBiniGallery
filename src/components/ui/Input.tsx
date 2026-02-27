import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Input({
    className,
    left,
    right,
    ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
    left?: ReactNode;
    right?: ReactNode;
}) {
    return (
        <div className={cn('relative', className)}>
            {left ? (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {left}
                </div>
            ) : null}
            <input
                className={cn(
                    'w-full rounded-xl border border-gray-200 bg-white/80 shadow-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent',
                    left ? 'pl-10 pr-4 py-3' : 'px-4 py-3',
                    right ? 'pr-12' : null
                )}
                {...props}
            />
            {right ? (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">{right}</div>
            ) : null}
        </div>
    );
}
