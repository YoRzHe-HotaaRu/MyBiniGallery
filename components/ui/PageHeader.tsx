import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function PageHeader({
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
        <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
            <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
                    {title}
                </h1>
                {subtitle ? <p className="mt-2 text-sm sm:text-base text-gray-600">{subtitle}</p> : null}
            </div>
            {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
    );
}
