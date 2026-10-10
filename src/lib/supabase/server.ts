import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseEnv } from './env';

// Create a fresh client per request; never share one across requests.
export async function createClient() {
    // Read cookies first: it marks the render as dynamic before anything else can throw at build time.
    const cookieStore = await cookies();
    const { url, key } = supabaseEnv();

    return createServerClient(url, key, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
                } catch {
                    // Server Components can't set cookies. The proxy refreshes the session, so this is safe to skip.
                }
            },
        },
    });
}
