<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'balansijayditch@gmail.com'],
            ['name' => 'Jayditch', 'password' => 'password'],
        );

        $expenseCategories = [
            ['name' => 'Food', 'color' => '#f97316'],
            ['name' => 'Transport', 'color' => '#0ea5e9'],
            ['name' => 'Bills & Utilities', 'color' => '#ef4444'],
            ['name' => 'Shopping', 'color' => '#a855f7'],
            ['name' => 'Health', 'color' => '#22c55e'],
            ['name' => 'Entertainment', 'color' => '#eab308'],
            ['name' => 'Other Expense', 'color' => '#64748b'],
        ];

        $incomeCategories = [
            ['name' => 'Salary', 'color' => '#10b981'],
            ['name' => 'Freelance Income', 'color' => '#14b8a6'],
            ['name' => 'Other Income', 'color' => '#84cc16'],
        ];

        foreach ($expenseCategories as $category) {
            Category::firstOrCreate(
                ['user_id' => $user->id, 'name' => $category['name'], 'type' => 'expense'],
                ['color' => $category['color']],
            );
        }

        foreach ($incomeCategories as $category) {
            Category::firstOrCreate(
                ['user_id' => $user->id, 'name' => $category['name'], 'type' => 'income'],
                ['color' => $category['color']],
            );
        }
    }
}
