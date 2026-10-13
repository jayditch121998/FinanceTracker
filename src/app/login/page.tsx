import type { Metadata } from 'next';
import LoginForm from './login-form';

export const metadata: Metadata = { title: 'Log in' };

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            <div className="w-full max-w-sm">
                <div className="mb-6 flex flex-col items-center text-center">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand text-xl font-bold text-on-brand">
                        ₱
                    </span>
                    <h1 className="mt-4 text-2xl font-bold tracking-tight">Finance Tracker</h1>
                    <p className="mt-1 text-sm text-muted">Know where your money goes.</p>
                </div>

                <LoginForm />
            </div>
        </div>
    );
}
