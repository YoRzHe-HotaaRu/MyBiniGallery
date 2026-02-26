import React from 'react';
import { Link } from 'react-router-dom';
import { User as UserIcon } from 'lucide-react';
import { Button, Card, Input, Skeleton } from '@/components/ui';

interface UserAccountCardProps {
    user: any;
    initials: string;
    profileLoading: boolean;
    displayName: string;
    setDisplayName: (name: string) => void;
    savingProfile: boolean;
    onSaveProfile: () => void;
}

export const UserAccountCard: React.FC<UserAccountCardProps> = ({
    user,
    initials,
    profileLoading,
    displayName,
    setDisplayName,
    savingProfile,
    onSaveProfile,
}) => {
    return (
        <Card className="p-6">
            <div className="flex items-start gap-4">
                {user.photoURL ? (
                    <img
                        src={user.photoURL}
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
                    <div className="text-lg font-extrabold text-gray-900">Account</div>
                    <div className="mt-1 text-sm text-gray-600">
                        Signed in as <span className="font-semibold">{user.displayName?.trim() || 'User'}</span>
                    </div>
                </div>
            </div>

            <div className="mt-6 space-y-3">
                {profileLoading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-11 w-32" />
                    </div>
                ) : (
                    <>
                        <div>
                            <div className="text-sm font-semibold text-gray-700">Username</div>
                            <div className="mt-2">
                                <Input
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="Pick a username"
                                    maxLength={32}
                                    left={<UserIcon className="h-4 w-4" />}
                                    disabled={savingProfile}
                                />
                            </div>
                            <div className="mt-2 text-xs text-gray-500">This is what people see on your comments.</div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                className="h-11"
                                disabled={savingProfile || displayName.trim().length < 2 || displayName.trim() === (user.displayName?.trim() || '')}
                                onClick={onSaveProfile}
                            >
                                Save username
                            </Button>
                            <Link
                                to="/favourites"
                                className="h-11 px-4 rounded-xl font-semibold text-gray-900 border border-gray-200 bg-white hover:bg-gray-50 inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                            >
                                View favourites
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </Card>
    );
};
