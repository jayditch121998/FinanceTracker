# Finance Tracker

Personal finance tracker — Laravel + Inertia + React. Single-user, manual entry only.

Scope for v1 is defined in [docs/v1-scope.md](docs/v1-scope.md). Read that before adding
anything not already listed there.

---

## Stack

| Layer    | Tech                                              |
| -------- | ------------------------------------------------- |
| Backend  | PHP 8.3+, Laravel 13, Inertia.js (server adapter) |
| Frontend | React 19 + TypeScript, Inertia.js React adapter   |
| Styling  | Tailwind CSS v4 (via `@tailwindcss/vite`)         |
| Build    | Vite 8, `laravel-vite-plugin`                     |
| Database | SQLite by default (MySQL/PostgreSQL optional)     |
| Tests    | PHPUnit 12                                        |
| Linting  | Laravel Pint (PHP)                                |

---

## Prerequisites

Install these before you start:

- **PHP 8.3, 8.4 or 8.5** with the extensions `pdo_sqlite`, `sqlite3`, `mbstring`,
  `openssl`, `dom`, `curl`, `libxml`, `fileinfo`, `zip`
- **Composer 2.x** — https://getcomposer.org/download/
- **Node.js 20.19+ or 22.12+** (required by Vite 8) and **npm 10+**
- **Git**

Check your versions:

```bash
php -v
php -m          # confirm pdo_sqlite and sqlite3 are listed
composer -V
node -v
npm -v
```

<details>
<summary><strong>Installing the prerequisites per OS</strong></summary>

**Windows** — the simplest route is [Laravel Herd](https://herd.laravel.com/windows),
which bundles PHP, Composer and a local web server. Otherwise:

1. Download PHP 8.3+ (Thread Safe, x64) from https://windows.php.net/download/
2. Unzip to `C:\php` and add that folder to your `PATH`
3. Copy `php.ini-development` to `php.ini` and uncomment:
   ```ini
   extension_dir = "ext"
   extension=pdo_sqlite
   extension=sqlite3
   extension=mbstring
   extension=openssl
   extension=curl
   extension=fileinfo
   extension=zip
   ```
4. Install Composer: https://getcomposer.org/Composer-Setup.exe
5. Install Node LTS: https://nodejs.org/

**macOS**

```bash
brew install php composer node
```

**Ubuntu / Debian**

```bash
sudo apt update
sudo apt install php8.3-cli php8.3-sqlite3 php8.3-mbstring php8.3-xml php8.3-curl php8.3-zip unzip git
curl -sS https://getcomposer.org/installer | php && sudo mv composer.phar /usr/local/bin/composer
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt install nodejs
```

</details>

---

## Local setup

### Quick start (one command)

From a clean checkout:

```bash
git clone <your-repo-url> FinanceTracker
cd FinanceTracker
composer setup
```

`composer setup` runs `composer install`, copies `.env.example` → `.env`, generates the
app key, runs migrations, installs npm packages and builds the frontend assets.

It does **not** seed the database, so follow it with the seeder to get a login and the
default categories:

```bash
php artisan db:seed
```

Then start the dev servers — see [Running it](#running-it).

### Step by step (recommended the first time)

**1. Clone and enter the project**

```bash
git clone <your-repo-url> FinanceTracker
cd FinanceTracker
```

**2. Install PHP dependencies**

```bash
composer install
```

**3. Create your environment file**

```bash
# macOS / Linux / Git Bash
cp .env.example .env

# Windows (PowerShell)
Copy-Item .env.example .env
```

**4. Generate the application key**

```bash
php artisan key:generate
```

This fills in `APP_KEY` in `.env`. Without it, sessions and encryption fail.

**5. Create the SQLite database file**

```bash
# macOS / Linux / Git Bash
touch database/database.sqlite

# Windows (PowerShell)
New-Item -ItemType File database/database.sqlite
```

The file is git-ignored (see `database/.gitignore`), so every checkout keeps its own
local data.

**6. Run migrations and seed the starting data**

```bash
php artisan migrate --seed
```

This creates the `users`, `categories`, `transactions`, `sessions`, `cache` and `jobs`
tables, then seeds one user plus the default income/expense categories.

**7. Install frontend dependencies**

```bash
npm install
```

**8. Start it** — see below.

---

## Running it

You need **two processes**: the PHP web server and the Vite dev server.

**Option A — one command** (runs both together):

```bash
composer run dev
```

**Option B — two terminals:**

```bash
# Terminal 1 — Laravel
php artisan serve

# Terminal 2 — Vite (hot reload for React/Tailwind)
npm run dev
```

Then open **http://127.0.0.1:8000**.

### Seeded login

| Field    | Value                       |
| -------- | --------------------------- |
| Email    | `balansijayditch@gmail.com` |
| Password | `password`                  |

> **Change this after your first login.** There is no "change password" screen in v1, so
> use Tinker:
>
> ```bash
> php artisan tinker
> ```
>
> ```php
> App\Models\User::first()->update(['password' => 'your-new-password']);
> ```
>
> The `password` attribute is hash-cast on the `User` model, so pass the plain text — it
> gets hashed for you.

To use a different email or name, edit
[database/seeders/DatabaseSeeder.php](database/seeders/DatabaseSeeder.php) before running
the seeder.

---

## Environment configuration

Everything lives in `.env`, which is never committed. The defaults in `.env.example` are
tuned for local development and need no changes for a normal SQLite setup.

| Variable           | Default                 | Notes                                          |
| ------------------ | ----------------------- | ---------------------------------------------- |
| `APP_NAME`         | `Finance Tracker`       | Shown in the browser title                     |
| `APP_ENV`          | `local`                 | Use `production` when deploying                |
| `APP_KEY`          | *(empty)*               | Generated by `php artisan key:generate`        |
| `APP_DEBUG`        | `true`                  | Set to `false` outside local                   |
| `APP_URL`          | `http://localhost:8000` | Must match how you actually reach the app      |
| `DB_CONNECTION`    | `sqlite`                | Switch to `mysql` / `pgsql` if you prefer      |
| `SESSION_DRIVER`   | `database`              | Sessions live in the `sessions` table          |
| `CACHE_STORE`      | `database`              | Needs the `cache` table (created by migrations)|
| `QUEUE_CONNECTION` | `database`              | Nothing is queued in v1                        |
| `MAIL_MAILER`      | `log`                   | Mail is written to `storage/logs/laravel.log`  |

### Using MySQL instead of SQLite (optional)

SQLite is the default and is plenty for a single-user app. If you'd rather use MySQL,
create an empty database and set in `.env`:

```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=finance_tracker
DB_USERNAME=root
DB_PASSWORD=
```

Then re-run `php artisan migrate --seed`.

---

## Everyday commands

```bash
# Development
composer run dev                 # Laravel server + Vite together
php artisan serve                # Laravel server only (http://127.0.0.1:8000)
npm run dev                      # Vite dev server with hot reload
npm run build                    # Production asset build into public/build

# Database
php artisan migrate              # Apply new migrations
php artisan migrate:fresh --seed # Drop everything and rebuild (destroys local data)
php artisan db:seed              # Re-run seeders (safe: uses firstOrCreate)
php artisan tinker               # Interactive REPL against the app

# Quality
php artisan test                 # Run the PHPUnit suite (in-memory SQLite)
composer test                    # Clears config, then runs the tests
./vendor/bin/pint                # Format PHP to Laravel's style
npx tsc --noEmit                 # Type-check the React/TypeScript code

# Debugging
php artisan pail                 # Tail application logs live
php artisan route:list           # See every registered route
php artisan optimize:clear       # Clear config/route/view caches when things act stale
```

---

## Project structure

```
app/
  Http/Controllers/
    Auth/AuthenticatedSessionController.php   # login / logout
    DashboardController.php                   # monthly totals + category breakdown
    TransactionController.php                 # transaction CRUD
    CategoryController.php                    # category CRUD
  Http/Middleware/HandleInertiaRequests.php   # shared Inertia props
  Models/                                     # User, Category, Transaction
database/
  migrations/                                 # users, cache, jobs, categories, transactions
  seeders/DatabaseSeeder.php                  # seeded user + default categories
resources/
  css/app.css                                 # Tailwind v4 entrypoint
  js/app.tsx                                  # Inertia + React entrypoint
  js/Layouts/AppLayout.tsx                    # shell: nav, flash messages
  js/Pages/                                   # Dashboard, Transactions, Categories, Auth/Login
  views/app.blade.php                         # the single Blade root view
routes/web.php                                # all HTTP routes
docs/                                         # scope, PM log, ADRs, QA checklist
tests/                                        # PHPUnit Feature + Unit tests
```

### Routes

| Method | URI                  | Name                     |
| ------ | -------------------- | ------------------------ |
| GET    | `/`                  | redirects to `dashboard` |
| GET    | `/login`             | `login`                  |
| POST   | `/login`             | —                        |
| POST   | `/logout`            | `logout`                 |
| GET    | `/dashboard`         | `dashboard`              |
| GET    | `/transactions`      | `transactions.index`     |
| POST   | `/transactions`      | `transactions.store`     |
| PATCH  | `/transactions/{id}` | `transactions.update`    |
| DELETE | `/transactions/{id}` | `transactions.destroy`   |
| GET    | `/categories`        | `categories.index`       |
| POST   | `/categories`        | `categories.store`       |
| PATCH  | `/categories/{id}`   | `categories.update`      |
| DELETE | `/categories/{id}`   | `categories.destroy`     |

Everything except `/` and `/login` sits behind the `auth` middleware.

---

## Testing

```bash
php artisan test
```

Tests run against an **in-memory SQLite database** (`phpunit.xml` sets
`DB_DATABASE=:memory:`), so they never touch `database/database.sqlite`. CI runs the same
suite on PHP 8.3, 8.4 and 8.5 — see
[.github/workflows/tests.yml](.github/workflows/tests.yml).

Before calling a milestone "done", walk through
[docs/qa-checklist.md](docs/qa-checklist.md).

---

## Troubleshooting

**`could not find driver` / `Database file at path ... does not exist`**
The SQLite extension isn't enabled, or the database file is missing. Enable `pdo_sqlite`
in `php.ini`, then create `database/database.sqlite` (step 5 above).

**`No application encryption key has been specified.`**
Run `php artisan key:generate`.

**Blank page, or `Vite manifest not found at: public/build/manifest.json`**
Vite isn't running and no build exists. Either run `npm run dev` (development) or
`npm run build` (to serve pre-built assets).

**Styles or components don't update on save**
Make sure `npm run dev` is running in its own terminal and you're loading the page over
the same host as `APP_URL`.

**`crypto.hash is not a function` (or similar) on `npm run dev`**
Your Node is too old for Vite 8. Upgrade to Node 20.19+ or 22.12+.

**Permission errors writing logs or cache (macOS/Linux)**

```bash
chmod -R ug+rw storage bootstrap/cache
```

**Changes in `.env` aren't taking effect**
Run `php artisan optimize:clear`, then restart `php artisan serve`.

**Port 8000 is already in use**

```bash
php artisan serve --port=8001
```

Then update `APP_URL` in `.env` to match.

---

## Deploying (brief)

This is a personal, single-user app; a small VPS or any PHP host works.

```bash
composer install --no-dev --optimize-autoloader
npm ci && npm run build
php artisan migrate --force
php artisan config:cache && php artisan route:cache && php artisan view:cache
```

Set `APP_ENV=production`, `APP_DEBUG=false` and a real `APP_URL`, and keep `APP_KEY`
stable — changing it invalidates existing sessions and encrypted values. Point the web
server's document root at `public/`. If you stay on SQLite, make sure
`database/database.sqlite` is writable by the web server user and is included in your
backups.

---

## What's built (v1 scope)

- Session-based login with a single seeded user
- Categories: seeded income + expense defaults, add/edit/delete at `/categories`
- Transactions: add/edit/delete, filtered by month, at `/transactions`
- Dashboard: income vs. expense totals and a per-category expense breakdown for the
  selected month, at `/dashboard`

## What's deliberately not built yet

See "Explicitly out of scope for v1" in [docs/v1-scope.md](docs/v1-scope.md) —
bank/e-wallet sync, CSV import, budgets, bills, multi-currency, mobile app,
reports/export, multi-user. Don't build these until v1 has been used for real for 2 weeks.

---

## Project docs

- [docs/v1-scope.md](docs/v1-scope.md) — the BA one-pager: problem, scope, success criteria
- [docs/pm-log.md](docs/pm-log.md) — dated log of what shipped, updated weekly (Friday check-in)
- [docs/adr.md](docs/adr.md) — short log of real architectural decisions
- [docs/qa-checklist.md](docs/qa-checklist.md) — run this before calling a milestone "done"
