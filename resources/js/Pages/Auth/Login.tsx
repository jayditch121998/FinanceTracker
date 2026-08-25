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
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
            <Head title="Log in" />
            <form onSubmit={submit} className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <h1 className="mb-4 text-lg font-semibold text-slate-900">Finance Tracker</h1>

                <label className="mb-1 block text-sm text-slate-700">Email</label>
                <input
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    className="mb-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                    autoFocus
                />
                {errors.email && <p className="mb-2 text-xs text-red-600">{errors.email}</p>}

                <label className="mb-1 block text-sm text-slate-700">Password</label>
                <input
                    type="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    className="mb-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
                {errors.password && <p className="mb-2 text-xs text-red-600">{errors.password}</p>}

                <button
                    type="submit"
                    disabled={processing}
                    className="mt-3 w-full rounded bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                    Log in
                </button>
            </form>
        </div>
    );
}
