import { db, schema } from '@nuxthub/db'

export default defineTask({
    meta: {
        name: 'db:seed',
        description: 'Seed database with initial books, patrons, and transactions'
    },
    async run() {
        console.log('Seeding database...')

        // 1. Seed books
        const books = [
            {
                title: 'The Hobbit',
                author: 'J.R.R. Tolkien',
                genre: 'Fantasy',
                isbn: '9780547928227',
                createdAt: new Date()
            },
            {
                title: 'Dune',
                author: 'Frank Herbert',
                genre: 'Science Fiction',
                isbn: '9780441013593',
                createdAt: new Date()
            },
            {
                title: 'The Silent Patient',
                author: 'Alex Michaelides',
                genre: 'Mystery',
                isbn: '9781250301697',
                createdAt: new Date()
            },
            {
                title: 'Educated',
                author: 'Tara Westover',
                genre: 'Memoir',
                isbn: '9780399590504',
                createdAt: new Date()
            },
            {
                title: 'Project Hail Mary',
                author: 'Andy Weir',
                genre: 'Science Fiction',
                isbn: '9780593135204',
                createdAt: new Date()
            },
            {
                title: 'The Guest List',
                author: 'Lucy Foley',
                genre: 'Mystery',
                isbn: '9780062868930',
                createdAt: new Date()
            }
        ]

        const insertedBooks = await db.insert(schema.books).values(books).returning()

        // 2. Seed patrons
        const patrons = [
            {
                name: 'Alice Tan',
                contactDetails: 'alice.tan@example.com',
                membershipId: 'MEM-0001',
                createdAt: new Date()
            },
            {
                name: 'Marcus Lee',
                contactDetails: 'marcus.lee@example.com',
                membershipId: 'MEM-0002',
                createdAt: new Date()
            },
            {
                name: 'Priya Nair',
                contactDetails: 'priya.nair@example.com',
                membershipId: 'MEM-0003',
                createdAt: new Date()
            },
            {
                name: 'Diego Ramirez',
                contactDetails: 'diego.ramirez@example.com',
                membershipId: 'MEM-0004',
                createdAt: new Date()
            }
        ]

        const insertedPatrons = await db.insert(schema.patrons).values(patrons).returning()

        // 3. Seed transactions (some returned, some still on loan)
        const now = Date.now()
        const daysAgo = (n: number) => new Date(now - n * 24 * 60 * 60 * 1000)

        const transactions = [
            {
                bookId: insertedBooks[0]!.id,
                patronId: insertedPatrons[0]!.id,
                loanDate: daysAgo(14),
                returnDate: daysAgo(2),
                createdAt: daysAgo(14)
            },
            {
                bookId: insertedBooks[1]!.id,
                patronId: insertedPatrons[0]!.id,
                loanDate: daysAgo(5),
                returnDate: null,
                createdAt: daysAgo(5)
            },
            {
                bookId: insertedBooks[2]!.id,
                patronId: insertedPatrons[1]!.id,
                loanDate: daysAgo(20),
                returnDate: daysAgo(6),
                createdAt: daysAgo(20)
            },
            {
                bookId: insertedBooks[3]!.id,
                patronId: insertedPatrons[2]!.id,
                loanDate: daysAgo(3),
                returnDate: null,
                createdAt: daysAgo(3)
            },
            {
                bookId: insertedBooks[4]!.id,
                patronId: insertedPatrons[3]!.id,
                loanDate: daysAgo(1),
                returnDate: null,
                createdAt: daysAgo(1)
            }
        ]

        await db.insert(schema.transactions).values(transactions)

        return { result: 'Database seeded successfully' }
    }
})