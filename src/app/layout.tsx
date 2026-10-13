import { ToastProvider } from '@/components/toast';
import { HIDE_AMOUNTS_KEY } from '@/lib/privacy';
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
    themeColor: '#f6f4ef',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
    return (
        // The script below may add data-hide-amounts before React hydrates, hence suppressHydrationWarning.
        <html lang="en" className={jakarta.variable} suppressHydrationWarning>
            <head>
                {/* Apply "hide amounts" before first paint so real numbers never flash on screen. */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `try{if(localStorage.getItem('${HIDE_AMOUNTS_KEY}')==='1')document.documentElement.setAttribute('data-hide-amounts','')}catch(e){}`,
                    }}
                />
            </head>
            <body>
                <ToastProvider>{children}</ToastProvider>
            </body>
        </html>
    );
}
