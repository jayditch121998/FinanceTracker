<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class BudgetController extends Controller
{
    public function index(Request $request): Response
    {
        $month = $request->string('month')->toString() ?: now()->format('Y-m');
        $start = Carbon::createFromFormat('Y-m', $month)->startOfMonth();
        $end = $start->copy()->endOfMonth();
        $previousMonth = $start->copy()->subMonth()->format('Y-m');

        $user = $request->user();

        $budgets = $user->budgets()->where('month', $month)->pluck('amount', 'category_id');

        $spent = $user->transactions()
            ->where('type', 'expense')
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->selectRaw('category_id, SUM(amount) as total')
            ->groupBy('category_id')
            ->pluck('total', 'category_id');

        $rows = $user->categories()
            ->where('type', 'expense')
            ->orderBy('name')
            ->get()
            ->map(fn ($category) => [
                'category_id' => $category->id,
                'name' => $category->name,
                'color' => $category->color,
                'budget' => isset($budgets[$category->id]) ? (float) $budgets[$category->id] : null,
                'spent' => (float) ($spent[$category->id] ?? 0),
            ]);

        return Inertia::render('Budgets/Index', [
            'month' => $month,
            'rows' => $rows,
            'canCopyPrevious' => $budgets->isEmpty()
                && $user->budgets()->where('month', $previousMonth)->exists(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'month' => ['required', 'date_format:Y-m'],
            'category_id' => [
                'required',
                Rule::exists('categories', 'id')->where('user_id', $user->id)->where('type', 'expense'),
            ],
            'amount' => ['nullable', 'numeric', 'min:0'],
        ]);

        $key = ['category_id' => $validated['category_id'], 'month' => $validated['month']];

        // A blank amount clears the budget for that category/month.
        if ($validated['amount'] === null || $validated['amount'] === '') {
            $user->budgets()->where($key)->delete();
        } else {
            $user->budgets()->updateOrCreate($key, ['amount' => $validated['amount']]);
        }

        return back()->with('success', 'Budget saved.');
    }

    public function copyPrevious(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'month' => ['required', 'date_format:Y-m'],
        ]);

        $user = $request->user();
        $month = $validated['month'];
        $previousMonth = Carbon::createFromFormat('Y-m', $month)->startOfMonth()->subMonth()->format('Y-m');

        $copied = 0;
        foreach ($user->budgets()->where('month', $previousMonth)->get() as $budget) {
            $created = $user->budgets()->firstOrCreate(
                ['category_id' => $budget->category_id, 'month' => $month],
                ['amount' => $budget->amount],
            );
            $copied += $created->wasRecentlyCreated ? 1 : 0;
        }

        return back()->with('success', "Copied {$copied} budgets from last month.");
    }
}
