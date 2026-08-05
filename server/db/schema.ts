import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const books = pgTable('books', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  author: text('author').notNull(),
  genre: text('genre').notNull(),
  isbn: text('isbn').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const patrons = pgTable('patrons', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  contactDetails: text('contact_details').notNull(),
  membershipId: text('membership_id').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  bookId: serial('book_id').notNull().references(() => books.id),
  patronId: serial('patron_id').notNull().references(() => patrons.id),
  loanDate: timestamp('loan_date').notNull(),
  returnDate: timestamp('return_date'),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const ratings = pgTable('ratings', {
  id: serial('id').primaryKey(),
  bookId: integer('book_id').notNull().references(() => books.id),
  patronId: integer('patron_id').notNull().references(() => patrons.id),
  rating: integer('rating').notNull()
})

export const booksRelations = relations(books, ({ many }) => ({
  transactions: many(transactions),
  ratings: many(ratings)
}))

export const patronsRelations = relations(patrons, ({ many }) => ({
  transactions: many(transactions)
}))

export const transactionsRelations = relations(transactions, ({ one }) => ({
  book: one(books, {
    fields: [transactions.bookId],
    references: [books.id]
  }),
  patron: one(patrons, {
    fields: [transactions.patronId],
    references: [patrons.id]
  })
}))

export const ratingsRelations = relations(ratings, ({ one }) => ({
  book: one(books, {
    fields: [ratings.bookId],
    references: [books.id]
  }),
  patron: one(patrons, {
    fields: [ratings.patronId],
    references: [patrons.id]
  })
}))
