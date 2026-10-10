<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class BudgetTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private Category $groceries;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();

        $this->user = User::factory()->create();
        $this->groceries = $this->user->categories()->create(['name' => 'Groceries', 'type' => 'expense', 'color' => '#22c55e']);
    }

    public function test_index_shows_budget_and_spent_per_expense_category(): void
    {
        $this->user->categories()->create(['name' => 'Salary', 'type' => 'income', 'color' => '#000000']);
        $this->user->budgets()->create(['category_id' => $this->groceries->id, 'month' => '2026-10', 'amount' => 5000]);
        $this->user->transactions()->create(['category_id' => $this->groceries->id, 'type' => 'expense', 'amount' => 1200, 'date' => '2026-10-05']);
        $this->user->transactions()->create(['category_id' => $this->groceries->id, 'type' => 'expense', 'amount' => 999, 'date' => '2026-09-30']);

        $this->actingAs($this->user)
            ->get('/budgets?month=2026-10')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Budgets/Index')
                ->has('rows', 1)
                ->where('rows.0.name', 'Groceries')
                ->where('rows.0.budget', 5000)
                ->where('rows.0.spent', 1200)
                ->where('canCopyPrevious', false));
    }

    public function test_update_creates_changes_and_clears_a_budget(): void
    {
        $payload = ['month' => '2026-10', 'category_id' => $this->groceries->id];

        $this->actingAs($this->user)->put('/budgets', $payload + ['amount' => 3000])->assertSessionHasNoErrors();
        $this->actingAs($this->user)->put('/budgets', $payload + ['amount' => 4500])->assertSessionHasNoErrors();
        $this->assertDatabaseCount('budgets', 1);
        $this->assertDatabaseHas('budgets', ['category_id' => $this->groceries->id, 'month' => '2026-10', 'amount' => 4500]);

        $this->actingAs($this->user)->put('/budgets', $payload + ['amount' => null])->assertSessionHasNoErrors();
        $this->assertDatabaseCount('budgets', 0);
    }

    public function test_cannot_budget_another_users_category(): void
    {
        $other = User::factory()->create();
        $theirs = $other->categories()->create(['name' => 'Rent', 'type' => 'expense', 'color' => '#000000']);

        $this->actingAs($this->user)
            ->put('/budgets', ['month' => '2026-10', 'category_id' => $theirs->id, 'amount' => 100])
            ->assertSessionHasErrors('category_id');
    }

    public function test_copy_previous_month(): void
    {
        $this->user->budgets()->create(['category_id' => $this->groceries->id, 'month' => '2026-09', 'amount' => 5000]);

        $this->actingAs($this->user)
            ->get('/budgets?month=2026-10')
            ->assertInertia(fn (Assert $page) => $page->where('canCopyPrevious', true));

        $this->actingAs($this->user)->post('/budgets/copy-previous', ['month' => '2026-10']);

        $this->assertDatabaseHas('budgets', ['category_id' => $this->groceries->id, 'month' => '2026-10', 'amount' => 5000]);
    }

    public function test_dashboard_includes_budget_totals(): void
    {
        $this->user->budgets()->create(['category_id' => $this->groceries->id, 'month' => '2026-10', 'amount' => 5000]);
        $this->user->transactions()->create(['category_id' => $this->groceries->id, 'type' => 'expense', 'amount' => 6000, 'date' => '2026-10-05']);

        $this->actingAs($this->user)
            ->get('/dashboard?month=2026-10')
            ->assertInertia(fn (Assert $page) => $page
                ->where('totalBudget', 5000)
                ->where('byCategory.0.budget', 5000)
                ->where('byCategory.0.total', 6000));
    }
}
