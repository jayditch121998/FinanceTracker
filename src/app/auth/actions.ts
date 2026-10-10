'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export interface LoginState {
    error: string | null;
    email: string;
}

export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');

    if (!email || !password) {
        return { error: 'Enter your email and password.', email };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        return { error: 'Those credentials don’t match.', email };
    }

    redirect('/dashboard');
}

export async function logout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/login');
}
