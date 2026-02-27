import React from 'react';
import { Card, Skeleton } from '@/components/ui';

export const WaifuDetailSkeleton: React.FC = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <Card className="overflow-hidden lg:col-span-1">
                <Skeleton className="aspect-[3/4] w-full rounded-none" />
            </Card>
            <Card className="lg:col-span-2 p-6 space-y-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                        <Skeleton className="h-9 w-64" />
                        <Skeleton className="h-5 w-48" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-11 w-24 rounded-full" />
                        <Skeleton className="h-11 w-11 rounded-full" />
                    </div>
                </div>
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-11/12" />
                <Skeleton className="h-5 w-10/12" />
            </Card>
        </div>
    );
};
