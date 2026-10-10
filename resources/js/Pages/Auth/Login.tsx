import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            <Head title="Log in" />

            <div className="w-full max-w-sm">
                <div className="mb-6 flex flex-col items-center text-center">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand text-xl font-bold text-white">
                        ₱
                    </span>
                    <h1 className="mt-4 text-2xl font-bold tracking-tight">Finance Tracker</h1>
                    <p className="mt-1 text-sm text-muted">Know where your money goes.</p>
                </div>

                <form onSubmit={submit} className="card space-y-4 p-6">
                    <div>
                        <label className="label" htmlFor="email">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="field"
                            autoFocus
                        />
                        {errors.email && <p className="mt-1.5 text-xs font-medium text-expense">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="label" htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="field"
                        />
                        {errors.password && (
                            <p className="mt-1.5 text-xs font-medium text-expense">{errors.password}</p>
                        )}
                    </div>

                    <label className="flex items-center gap-2 text-sm text-muted">
                        <input
                            type="checkbox"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="h-4 w-4 rounded accent-brand"
                        />
                        Keep me logged in
                    </label>

                    <button type="submit" disabled={processing} className="btn-primary w-full">
                        Log in
                    </button>
                </form>
            </div>
        </div>
    );
}
