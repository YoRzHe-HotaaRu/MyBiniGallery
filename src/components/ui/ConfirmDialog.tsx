import React, { ReactNode, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';
import { Card } from './Card';

export function ConfirmDialog({
    open,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    danger,
    onConfirm,
    onClose,
}: {
    open: boolean;
    title: ReactNode;
    description?: ReactNode;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
    onConfirm: () => void | Promise<void>;
    onClose: () => void;
}) {
    const cancelRef = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKeyDown);
        cancelRef.current?.focus();
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [open, onClose]);

    const portalTarget = useMemo(() => document.body, []);

    return createPortal(
        <AnimatePresence>
            {open ? (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) onClose();
                    }}
                >
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        className="relative w-full max-w-md"
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.18 }}
                    >
                        <Card className="p-6">
                            <div className="text-lg font-extrabold text-gray-900">{title}</div>
                            {description ? (
                                <div className="mt-2 text-sm text-gray-600">{description}</div>
                            ) : null}
                            <div className="mt-6 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    ref={cancelRef}
                                    onClick={onClose}
                                    className="h-10 px-4 rounded-xl border border-gray-200 bg-white text-gray-900 font-semibold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                                >
                                    {cancelText}
                                </button>
                                <Button
                                    type="button"
                                    variant={danger ? 'danger' : 'primary'}
                                    className="h-10"
                                    onClick={async () => {
                                        await onConfirm();
                                        onClose();
                                    }}
                                >
                                    {confirmText}
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                </motion.div>
            ) : null}
        </AnimatePresence>,
        portalTarget
    );
}
