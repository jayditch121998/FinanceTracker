import 'server-only';
import type { PostgrestError } from '@supabase/supabase-js';
import type { z } from 'zod';
import type { ActionResult } from './types';

export function validationError(error: z.ZodError): ActionResult {
    return { ok: false, error: error.issues[0]?.message ?? 'Please check the form and try again.' };
}

// Turn database errors into messages a person can act on. Unknown errors are
// logged on the server and shown generically.
export function databaseError(error: PostgrestError, messages: Partial<Record<string, string>> = {}): ActionResult {
    const known = messages[error.code];
    if (known) return { ok: false, error: known };

    console.error(error);
    return { ok: false, error: 'Something went wrong. Please try again.' };
}

// Postgres error codes used by the actions.
export const PG_UNIQUE_VIOLATION = '23505';
export const PG_FOREIGN_KEY_VIOLATION = '23503';
