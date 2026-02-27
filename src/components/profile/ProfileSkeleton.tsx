import React from 'react';
import { Card, Skeleton } from '@/components/ui';

export const ProfileSkeleton: React.FC = () => {
    return (
        <Card className="p-8">
            <div className="space-y-4">
                <Skeleton className="h-7 w-56" />
                <Skeleton className="h-5 w-72" />
            </div>
        </Card>
    );
};
