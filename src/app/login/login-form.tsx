'use client';

import { login, type LoginState } from '@/app/auth/actions';
import { useActionState } from 'react';

const initialState: LoginState = { error: null, email: '' };

export default function LoginForm() {
    const [state, formAction, pending] = useActionState(login, initialState);

    return (
        <form action={formAction} className="card space-y-4 p-6">
            <div>
                <label className="label" htmlFor="email">
                    Email
                </label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    defaultValue={state.email}
                    required
                    autoFocus
                    className="field"
                />
            </div>

            <div>
                <label className="label" htmlFor="password">
                    Password
                </label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="field"
                />
            </div>

            {state.error && <p className="text-xs font-medium text-expense">{state.error}</p>}

            <button type="submit" disabled={pending} className="btn-primary w-full">
                {pending ? 'Logging in…' : 'Log in'}
            </button>
        </form>
    );
}
