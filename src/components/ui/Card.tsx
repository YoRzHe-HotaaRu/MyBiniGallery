import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Card({
    className,
    children,
}: {
    className?: string;
    children: ReactNode;
}) {
    return (
        <div
            className={cn(
                'rounded-2xl border border-white/60 bg-white/80 backdrop-blur shadow-[0_20px_55px_-35px_rgba(236,72,153,0.35)]',
                className
            )}
        >
            {children}
        </div>
    );
}

export function CardHeader({
    title,
    subtitle,
    actions,
    className,
}: {
    title: ReactNode;
    subtitle?: ReactNode;
    actions?: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn('flex items-start justify-between gap-4', className)}>
            <div>
                <div className="text-lg font-extrabold text-gray-900">{title}</div>
                {subtitle ? <div className="mt-1 text-sm text-gray-600">{subtitle}</div> : null}
            </div>
            {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
    );
}
