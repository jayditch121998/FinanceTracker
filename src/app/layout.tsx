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
        // Amounts are hidden by default: the server renders data-hide-amounts, and the script
        // below removes it before hydration if you chose to show them (hence suppressHydrationWarning).
        <html lang="en" className={jakarta.variable} data-hide-amounts="" suppressHydrationWarning>
            <head>
                {/* Apply "show amounts" before first paint, so the page never flips after loading. */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `try{if(localStorage.getItem('${HIDE_AMOUNTS_KEY}')==='0')document.documentElement.removeAttribute('data-hide-amounts')}catch(e){}`,
                    }}
                />
            </head>
            <body>
                <ToastProvider>{children}</ToastProvider>
            </body>
        </html>
    );
}
