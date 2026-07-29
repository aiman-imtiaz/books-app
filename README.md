# Library Management System

A library management application built with Nuxt, PostgreSQL, and Drizzle ORM for managing books, patrons, and loan transactions.

## Features

- 📚 Book catalog management (add, remove, view)
- 👥 Patron management with membership IDs (add, remove, view)
- 📋 Loan and return transaction tracking
- 📊 View Transaction history by book or patron

## Tech Stack

- **Frontend**: Nuxt 4, Vue 3, Tailwind CSS, Nuxt UI
- **Backend**: Nuxt Server Routes
- **Database**: PostgreSQL with Drizzle ORM
- **Validation**: Zod
- **TypeScript**: Full type safety

## Setup

### Prerequisites

- Node.js 18+ and pnpm

### Installation

If no database is provided, NuxtHub uses Drizzle ORM to generate PGLite (embedded PostgreSQL).

1. Clone the repository and install dependencies:
```bash
pnpm install
```

2. Apply migrations and start the development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

3. [OPTIONAL] Seed the database with some dummy data to play around:
   - Press <kbd>Shift</kbd> + <kbd>Option</kbd> + <kbd>D</kbd> in the browser to open dev tools.
   - Toggle to the **Tasks** tab, and you'll see `seed` in the list of tasks. Run it to populate the database.
   - Press <kbd>Shift</kbd> + <kbd>Option</kbd> + <kbd>D</kbd> again to close dev tools.

<img width="1032" height="832" alt="Image" src="https://github.com/user-attachments/assets/aadd6f05-7148-4d31-8576-8135ec464990" />

<details>

<summary> <b><u><font size="+1">Advanced - Provide your own database URL</font></u></b></summary>

### Installation - Advanced

Setup your own database. Refer to [https://orm.drizzle.team/docs/guides/postgresql-local-setup](https://orm.drizzle.team/docs/guides/postgresql-local-setup).

1. Clone the repository and install dependencies:
```bash
pnpm install
```

2. Set up your PostgreSQL database. For local development, you can use Docker:
```bash
docker run --name books-db \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=books \
  -p 5432:5432 \
  -d postgres:latest
```

3. Edit `.env` and set `DATABASE_URL` to your PostgreSQL connection string. `.env.example` already contains the URL that would be generated if the command in Step 2 is ran as is, which means you can just copy that into `.env`:
```bash
cp .env.example .env
```

4. Generate database migrations:
```bash
pnpm db:generate
```

5. Apply migrations and start the development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`
</details>

## Project Structure

```
├── app/
│   ├── pages/
│   │   ├── index.vue        # Home page
│   │   ├── books.vue        # Books catalog
│   │   └── users.vue        # Patrons management
│   └── assets/
├── server/
│   ├── api/
│   │   ├── books/           # Book endpoints
│   │   ├── patrons/         # Patron endpoints
│   │   └── transactions/    # Transaction endpoints
│   └── db/
│       ├── schema.ts        # Database schema
│       ├── index.ts         # Database connection
│       └── migrations/      # Auto-generated migrations
└── nuxt.config.ts           # Nuxt configuration
```

## API Endpoints

### Books
- `GET /api/books` - List all books
- `POST /api/books` - Add a new book
- `DELETE /api/books/[id]` - Remove a book

### Patrons
- `GET /api/patrons` - List all patrons
- `POST /api/patrons` - Add a new patron
- `DELETE /api/patrons/[ID]` - Remove a patron

### Transactions
- `GET /api/transactions` - List all transactions
- `GET /api/transactions/[id]` - Get a specific transaction
- `POST /api/transactions/loan` - Create a loan event
- `PATCH /api/transactions/return/[id]` - Return a book
- `GET /api/transactions/book/[bookId]` - Get transaction history for a book
- `GET /api/transactions/patron/[patronId]` - Get transaction history for a patron

## Database Schema

### Books Table
- `id` - Serial primary key
- `title` - Book title
- `author` - Author name
- `genre` - Book genre
- `isbn` - ISBN number (unique)
- `createdAt` - Creation timestamp

### Patrons Table
- `id` - Serial primary key
- `name` - Patron name
- `contactDetails` - Contact information
- `membershipId` - Membership ID (unique)
- `createdAt` - Creation timestamp

### Transactions Table
- `id` - Serial primary key
- `bookId` - Foreign key to books
- `patronId` - Foreign key to patrons
- `loanDate` - Date of loan
- `returnDate` - Date of return (nullable for active loans)
- `createdAt` - Creation timestamp

## Development

### Generate migrations
```bash
pnpm db:generate
```

### Type checking
```bash
pnpm typecheck
```

### Linting
```bash
pnpm lint
```

## Setup

Make sure to install the dependencies:

```bash
pnpm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

## Production

Build the application for production:

```bash
pnpm build
```

Locally preview production build:

```bash
pnpm preview
```

