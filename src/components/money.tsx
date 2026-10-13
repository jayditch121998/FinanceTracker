import { formatCurrency } from '@/lib/format';

// Every amount on screen renders through this, so "hide amounts" can swap them
// all for a mask with CSS (see .money in globals.css). Both versions are in the
// markup and only one is displayed, so each keeps its natural width and alignment.
// Works in Server and Client Components.
export default function Money({ value, className = '' }: { value: number; className?: string }) {
    return (
        <span className={`money ${className}`}>
            <span className="money-value">{formatCurrency(value)}</span>
            <span className="money-mask" aria-label="Hidden amount">
                ₱••••
            </span>
        </span>
    );
}
