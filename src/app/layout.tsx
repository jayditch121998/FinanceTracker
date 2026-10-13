import { ToastProvider } from '@/components/toast';
import { DARK_THEME_COLOR, PREFERENCES_SCRIPT } from '@/lib/preferences';
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
    variable: '--font-jakarta',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: { default: 'Finance Tracker', template: '%s - Finance Tracker' },
    description: 'Know where your money goes.',
};

export const viewport: Viewport = {
    themeColor: DARK_THEME_COLOR,
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
    return (
        // Defaults: dark theme, amounts hidden. The script applies any saved choice before
        // hydration, so these attributes can differ from the server's (hence suppressHydrationWarning).
        <html lang="en" className={jakarta.variable} data-theme="dark" data-hide-amounts="" suppressHydrationWarning>
            <head>
                {/* Apply saved preferences before first paint, so the page never flips after loading. */}
                <script dangerouslySetInnerHTML={{ __html: PREFERENCES_SCRIPT }} />
            </head>
            <body>
                <ToastProvider>{children}</ToastProvider>
            </body>
        </html>
    );
}
