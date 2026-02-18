import { ReactNode, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold transition focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none';

  const sizes: Record<ButtonSize, string> = {
    sm: 'h-9 px-3 rounded-lg text-sm',
    md: 'h-11 px-4 rounded-xl text-sm',
    lg: 'h-12 px-5 rounded-xl text-base',
  };

  const variants: Record<ButtonVariant, string> = {
    primary:
      'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-sm hover:from-pink-700 hover:to-purple-700',
    secondary:
      'bg-white text-gray-900 border border-gray-200 shadow-sm hover:bg-gray-50',
    ghost: 'bg-transparent text-gray-700 hover:bg-white/70',
    danger:
      'bg-red-600 text-white shadow-sm hover:bg-red-700 focus:ring-red-500',
  };

  return (
    <button
      className={cn(base, sizes[size], variants[variant], className)}
      {...props}
    />
  );
}

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

export function Input({
  className,
  left,
  right,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  left?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className={cn('relative', className)}>
      {left ? (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {left}
        </div>
      ) : null}
      <input
        className={cn(
          'w-full rounded-xl border border-gray-200 bg-white/80 shadow-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent',
          left ? 'pl-10 pr-4 py-3' : 'px-4 py-3',
          right ? 'pr-12' : null
        )}
        {...props}
      />
      {right ? (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">{right}</div>
      ) : null}
    </div>
  );
}

export function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'w-full rounded-xl border border-gray-200 bg-white/80 shadow-sm text-gray-900 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent',
        className
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'w-full rounded-xl border border-gray-200 bg-white/80 shadow-sm text-gray-900 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent',
        className
      )}
      {...props}
    />
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl bg-gray-100', className)} />;
}

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
