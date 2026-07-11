import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Button } from './button';

export function MobileSheet({
  open,
  onClose,
  title,
  children,
  side = 'right',
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  side?: 'left' | 'right';
}) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] md:hidden">
      <button
        type="button"
        aria-label="Close menu"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          'absolute top-0 flex h-full w-[min(100vw-3rem,320px)] flex-col border-border bg-card shadow-2xl',
          side === 'right' ? 'right-0 border-l' : 'left-0 border-r',
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
          {title ? <p className="font-display font-semibold">{title}</p> : <span />}
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}
