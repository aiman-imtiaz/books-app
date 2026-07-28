import { z } from 'zod'
import { db, schema } from '@nuxthub/db'

const BodySchema = z.object({
  title: z.string().min(1).max(255),
  author: z.string().min(1).max(255),
  genre: z.string().min(1).max(100),
  isbn: z.string().min(1).max(20)
})

export default eventHandler(async (event) => {
  const { title, author, genre, isbn } = await readValidatedBody(event, BodySchema.parse)
  // Insert book
  const books = await db.insert(schema.books).values({
    title,
    author,
    genre,
    isbn,
    createdAt: new Date()
  }).returning()

  return books[0]
})
