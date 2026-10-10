import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { supabaseEnv } from './env';

// Refreshes the Supabase session cookie on every request and sends signed-out
// visitors to /login. This is only an optimistic check: every Server Action and
// data read verifies the user again, and Row-Level Security guards the data.
export async function updateSession(request: NextRequest) {
    const { url, key } = supabaseEnv();
    let response = NextResponse.next({ request });

    const supabase = createServerClient(url, key, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet, headers) {
                cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                response = NextResponse.next({ request });
                cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
                Object.entries(headers ?? {}).forEach(([name, value]) => response.headers.set(name, value));
            },
        },
    });

    // Don't run code between createServerClient and getClaims(): it can cause random logouts.
    const { data } = await supabase.auth.getClaims();
    const signedIn = Boolean(data?.claims);
    const { pathname } = request.nextUrl;
    const onLogin = pathname === '/login';

    if (!signedIn && !onLogin) {
        return redirectKeepingCookies(request, response, '/login');
    }
    if (signedIn && onLogin) {
        return redirectKeepingCookies(request, response, '/dashboard');
    }

    return response;
}

// A redirect must carry over any refreshed auth cookies, or the session is lost.
function redirectKeepingCookies(request: NextRequest, from: NextResponse, pathname: string) {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    url.search = '';
    const redirect = NextResponse.redirect(url);
    from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
}
