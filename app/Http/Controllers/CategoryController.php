<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Categories/Index', [
            'categories' => $request->user()->categories()->orderBy('type')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:income,expense'],
            'color' => ['required', 'string', 'max:7'],
        ]);

        $request->user()->categories()->create($validated);

        return back()->with('success', 'Category added.');
    }

    public function update(Request $request, Category $category): RedirectResponse
    {
        $this->authorizeOwnership($request, $category);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'color' => ['required', 'string', 'max:7'],
        ]);

        $category->update($validated);

        return back()->with('success', 'Category updated.');
    }

    public function destroy(Request $request, Category $category): RedirectResponse
    {
        $this->authorizeOwnership($request, $category);

        if ($category->transactions()->exists()) {
            return back()->with('error', 'Cannot delete a category that has transactions.');
        }

        $category->delete();

        return back()->with('success', 'Category deleted.');
    }

    private function authorizeOwnership(Request $request, Category $category): void
    {
        abort_unless($category->user_id === $request->user()->id, 403);
    }
}
