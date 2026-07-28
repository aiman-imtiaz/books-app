# Library Management System

A library management application built with Nuxt, PostgreSQL, and Drizzle ORM for managing books, patrons, and loan transactions.

## Features

- 📚 Book catalog management (add, remove, view)
- 👥 Patron management with membership IDs
- 📋 Loan and return transaction tracking
- 📊 Transaction history by book or patron
- 🎨 Clean, modern UI with Nuxt UI
- 🗄️ PostgreSQL database with Drizzle ORM
- ✅ Type-safe API with Zod validation

## Tech Stack

- **Frontend**: Nuxt 4, Vue 3, Tailwind CSS, Nuxt UI
- **Backend**: Nuxt Server Routes
- **Database**: PostgreSQL with Drizzle ORM
- **Validation**: Zod
- **TypeScript**: Full type safety

## Setup

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database running locally or remotely

### Installation

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

3. Create a `.env` file with your database URL:
```bash
cp .env.example .env
# Edit .env and set DATABASE_URL to your PostgreSQL connection string
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
├── drizzle.config.ts        # Drizzle ORM configuration
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

### Transactions
- `GET /api/transactions` - List all transactions
- `GET /api/transactions/[id]` - Get a specific transaction
- `POST /api/transactions/loan` - Create a loan event
- `PATCH /api/transactions/[id].return` - Return a book
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

## License

MIT

```bash [Terminal]
npm create nuxt@latest -- -t ui
```

## Deploy your own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-name=starter&repository-url=https%3A%2F%2Fgithub.com%2Fnuxt-ui-templates%2Fstarter&demo-image=https%3A%2F%2Fui.nuxt.com%2Fassets%2Ftemplates%2Fnuxt%2Fstarter-dark.png&demo-url=https%3A%2F%2Fstarter-template.nuxt.dev%2F&demo-title=Nuxt%20Starter%20Template&demo-description=A%20minimal%20template%20to%20get%20started%20with%20Nuxt%20UI.)

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

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Renovate integration

Install [Renovate GitHub app](https://github.com/apps/renovate/installations/select_target) on your repository and you are good to go.
