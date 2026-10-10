import { ToastProvider } from '@/components/toast';
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
        <html lang="en" className={jakarta.variable}>
            <body>
                <ToastProvider>{children}</ToastProvider>
            </body>
        </html>
    );
}
