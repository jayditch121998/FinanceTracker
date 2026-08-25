<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $month = $request->string('month')->toString() ?: now()->format('Y-m');
        $start = Carbon::createFromFormat('Y-m', $month)->startOfMonth();
        $end = $start->copy()->endOfMonth();

        $user = $request->user();

        $transactions = $user->transactions()
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->get();

        $totalIncome = (float) $transactions->where('type', 'income')->sum('amount');
        $totalExpense = (float) $transactions->where('type', 'expense')->sum('amount');

        $byCategory = $transactions->where('type', 'expense')
            ->load('category')
            ->groupBy('category.name')
            ->map(fn ($group) => [
                'category' => $group->first()->category->name,
                'color' => $group->first()->category->color,
                'total' => (float) $group->sum('amount'),
            ])
            ->values()
            ->sortByDesc('total')
            ->values();

        return Inertia::render('Dashboard', [
            'month' => $month,
            'totalIncome' => $totalIncome,
            'totalExpense' => $totalExpense,
            'net' => $totalIncome - $totalExpense,
            'byCategory' => $byCategory,
            'transactionCount' => $transactions->count(),
        ]);
    }
}
