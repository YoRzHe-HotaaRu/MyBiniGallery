import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, Send, Trash2 } from 'lucide-react';
import { Button, Card, CardHeader, ConfirmDialog, Skeleton, Textarea } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { useWaifuComments } from '@/hooks/useWaifuComments';

interface WaifuCommentsCardProps {
    waifuId: string;
}

export const WaifuCommentsCard: React.FC<WaifuCommentsCardProps> = ({ waifuId }) => {
    const { user } = useAuthStore();
    const location = useLocation();
    const { comments, loading: commentsLoading, addComment, deleteComment } = useWaifuComments(waifuId);

    const [commentText, setCommentText] = useState('');
    const [commentBusy, setCommentBusy] = useState(false);
    const [commentError, setCommentError] = useState('');
    const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        setCommentError('');
        if (!commentText.trim() || !user) return;
        setCommentBusy(true);
        try {
            await addComment({
                uid: user.uid,
                authorName: user.displayName?.trim() || 'User',
                text: commentText,
            });
            setCommentText('');
        } catch {
            setCommentError('Failed to post comment');
        } finally {
            setCommentBusy(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!commentToDelete) return;
        setCommentError('');
        try {
            await deleteComment(commentToDelete);
        } catch {
            setCommentError('Failed to delete comment');
        } finally {
            setCommentToDelete(null);
        }
    };

    return (
        <>
            <Card className="p-6 sm:p-8">
                <CardHeader
                    title={
                        <span className="inline-flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-pink-600" />
                            Comments
                        </span>
                    }
                    subtitle={user ? 'Be kind. Keep it fun.' : 'Sign in to like and comment.'}
                    actions={
                        !user ? (
                            <Link
                                to="/login"
                                state={{ from: location }}
                                className="h-10 px-4 rounded-xl font-semibold text-white bg-pink-600 hover:bg-pink-700 active:bg-pink-800 inline-flex items-center justify-center shadow-sm shadow-pink-600/30 hover:shadow-pink-600/40 transition focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                            >
                                Sign in
                            </Link>
                        ) : null
                    }
                />

                {commentError ? (
                    <div className="mt-4 text-sm font-semibold text-red-600">{commentError}</div>
                ) : null}

                {user ? (
                    <form className="mt-6" onSubmit={handlePostComment}>
                        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
                            <Textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                rows={3}
                                placeholder="Write a comment…"
                                maxLength={500}
                                disabled={commentBusy}
                            />
                            <Button type="submit" disabled={commentBusy || !commentText.trim()} className="sm:mt-0">
                                <Send className="h-4 w-4" />
                                Post
                            </Button>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">{commentText.trim().length}/500</div>
                    </form>
                ) : null}

                <div className="mt-6 space-y-3">
                    {commentsLoading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Card key={i} className="p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-40" />
                                            <Skeleton className="h-3 w-28" />
                                        </div>
                                        <Skeleton className="h-8 w-8 rounded-xl" />
                                    </div>
                                    <div className="mt-3 space-y-2">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-10/12" />
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : comments.length === 0 ? (
                        <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm text-gray-600">
                            No comments yet.
                        </div>
                    ) : (
                        comments.map((c) => {
                            const canDelete = Boolean(user && (user.role === 'admin' || c.uid === user.uid));
                            return (
                                <Card key={c.id} className="p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <Link
                                                to={`/user/${c.uid}`}
                                                className="group relative inline-flex items-center gap-2 text-sm font-extrabold text-gray-900 hover:text-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 rounded-md"
                                            >
                                                {c.authorName?.trim() || 'Anonymous'}
                                                <span className="pointer-events-none absolute left-0 top-full mt-2 hidden w-64 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-[0_18px_45px_-30px_rgba(236,72,153,0.35)] group-hover:block z-10">
                                                    <span className="block text-xs font-semibold text-gray-600">
                                                        View profile
                                                    </span>
                                                    <span className="mt-1 block text-xs text-gray-500">
                                                        Check their stats + top 3 showcase.
                                                    </span>
                                                </span>
                                            </Link>
                                            <div className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString()}</div>
                                        </div>
                                        {canDelete ? (
                                            <button
                                                type="button"
                                                onClick={() => setCommentToDelete(c.id)}
                                                className="h-9 w-9 rounded-xl inline-flex items-center justify-center text-gray-600 hover:text-red-600 hover:bg-red-50 transition"
                                                aria-label="Delete comment"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        ) : null}
                                    </div>
                                    <div className="mt-3 text-sm text-gray-800 whitespace-pre-wrap">{c.text}</div>
                                </Card>
                            );
                        })
                    )}
                </div>
            </Card>

            <ConfirmDialog
                open={Boolean(commentToDelete)}
                title="Delete comment?"
                description="This cannot be undone."
                confirmText="Delete"
                danger
                onClose={() => setCommentToDelete(null)}
                onConfirm={handleDeleteConfirm}
            />
        </>
    );
};
