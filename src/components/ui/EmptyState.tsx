import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card } from './Card';

export function EmptyState({
    title,
    description,
    action,
    className,
}: {
    title: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
    className?: string;
}) {
    return (
        <Card className={cn('p-8 text-center', className)}>
            <div className="text-lg font-extrabold text-gray-900">{title}</div>
            {description ? <div className="mt-2 text-sm text-gray-600">{description}</div> : null}
            {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
        </Card>
    );
}
