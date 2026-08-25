<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function index(Request $request): Response
    {
        $month = $request->string('month')->toString() ?: now()->format('Y-m');
        $start = Carbon::createFromFormat('Y-m', $month)->startOfMonth();
        $end = $start->copy()->endOfMonth();

        $user = $request->user();

        $transactions = $user->transactions()
            ->with('category')
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->get();

        return Inertia::render('Transactions/Index', [
            'month' => $month,
            'transactions' => $transactions,
            'categories' => $user->categories()->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'type' => ['required', 'in:income,expense'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'date' => ['required', 'date'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        $request->user()->transactions()->create($validated);

        return back()->with('success', 'Transaction added.');
    }

    public function update(Request $request, Transaction $transaction): RedirectResponse
    {
        $this->authorizeOwnership($request, $transaction);

        $validated = $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'type' => ['required', 'in:income,expense'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'date' => ['required', 'date'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        $transaction->update($validated);

        return back()->with('success', 'Transaction updated.');
    }

    public function destroy(Request $request, Transaction $transaction): RedirectResponse
    {
        $this->authorizeOwnership($request, $transaction);

        $transaction->delete();

        return back()->with('success', 'Transaction deleted.');
    }

    private function authorizeOwnership(Request $request, Transaction $transaction): void
    {
        abort_unless($transaction->user_id === $request->user()->id, 403);
    }
}
