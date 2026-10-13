'use client';

import { XIcon } from '@/components/icons';
import type { ActionResult } from '@/lib/types';
import { createContext, use, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

interface Toast {
    id: number;
    type: 'success' | 'error';
    text: string;
}

const ToastContext = createContext<((result: ActionResult) => void) | null>(null);

// Shows the outcome of a Server Action as a toast that fades out on its own.
export function ToastProvider({ children }: { children: ReactNode }) {
    const [toast, setToast] = useState<Toast | null>(null);
    const nextId = useRef(0);

    const show = useCallback((result: ActionResult) => {
        nextId.current += 1;
        setToast(
            result.ok
                ? { id: nextId.current, type: 'success', text: result.message }
                : { id: nextId.current, type: 'error', text: result.error },
        );
    }, []);

    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(null), toast.type === 'error' ? 6000 : 3000);
        return () => clearTimeout(timer);
    }, [toast]);

    return (
        <ToastContext value={show}>
            {children}
            {toast && (
                <div className="pointer-events-none fixed inset-x-0 bottom-24 z-30 flex justify-center px-4 sm:bottom-6">
                    <div
                        role="status"
                        className={`pointer-events-auto flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-paper shadow-lg ${
                            toast.type === 'error' ? 'bg-expense' : 'bg-ink'
                        }`}
                    >
                        {toast.text}
                        <button onClick={() => setToast(null)} aria-label="Dismiss" className="opacity-70 hover:opacity-100">
                            <XIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </ToastContext>
    );
}

export function useToast() {
    const show = use(ToastContext);
    if (!show) throw new Error('useToast must be used inside <ToastProvider>');
    return show;
}
