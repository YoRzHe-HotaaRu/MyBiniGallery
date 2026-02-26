import React from 'react';
import { Calendar } from 'lucide-react';
import { Card } from '@/components/ui';

interface ProfileBasicInfoProps {
    initials: string;
    titleName: string;
    createdAtLabel: string;
    photoURL?: string;
}

export const ProfileBasicInfo: React.FC<ProfileBasicInfoProps> = ({
    initials,
    titleName,
    createdAtLabel,
    photoURL,
}) => {
    return (
        <Card className="p-6">
            <div className="flex items-start gap-4">
                {photoURL ? (
                    <img
                        src={photoURL}
                        alt=""
                        className="h-14 w-14 rounded-2xl object-cover"
                        referrerPolicy="no-referrer"
                    />
                ) : (
                    <div className="h-14 w-14 rounded-2xl bg-pink-600 text-white flex items-center justify-center font-extrabold shadow-sm shadow-pink-600/30">
                        {initials}
                    </div>
                )}
                <div className="flex-1">
                    <div className="text-lg font-extrabold text-gray-900">{titleName}</div>
                    <div className="mt-1 text-sm text-gray-600">Public profile</div>
                </div>
            </div>

            <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Calendar className="h-4 w-4 text-pink-600" />
                        Account created
                    </div>
                    <div className="text-sm font-extrabold text-gray-900">{createdAtLabel}</div>
                </div>
            </div>
        </Card>
    );
};
