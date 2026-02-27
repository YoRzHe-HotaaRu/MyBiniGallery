import React from 'react';
import { Button, Card } from '@/components/ui';

interface UserDangerZoneProps {
    deleteError: string;
    deleteBusy: boolean;
    onDeleteClick: () => void;
}

export const UserDangerZone: React.FC<UserDangerZoneProps> = ({
    deleteError,
    deleteBusy,
    onDeleteClick,
}) => {
    return (
        <Card className="p-6 border border-red-200">
            <div className="text-lg font-extrabold text-gray-900">Danger zone</div>
            <div className="mt-2 text-sm text-gray-600">
                Deleting your account will remove your profile, likes, comments, and favourites. This can’t be undone.
            </div>
            {deleteError ? (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                    {deleteError}
                </div>
            ) : null}
            <div className="mt-5">
                <Button
                    type="button"
                    variant="danger"
                    className="h-11"
                    onClick={onDeleteClick}
                    disabled={deleteBusy}
                >
                    Delete account
                </Button>
            </div>
        </Card>
    );
};
