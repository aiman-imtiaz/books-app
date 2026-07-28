import type { books, patrons, transactions } from '@nuxthub/db/schema'

// Select types (for reading data)
export type Book = typeof books.$inferSelect
export type Patron = typeof patrons.$inferSelect
export type Transaction = typeof transactions.$inferSelect

// Insert types (for creating data)
export type NewBook = typeof books.$inferInsert
export type NewPatron = typeof patrons.$inferInsert
export type NewTransaction = typeof transactions.$inferInsert
