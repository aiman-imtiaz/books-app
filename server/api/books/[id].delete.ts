import { z } from 'zod'
import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

const ParamsSchema = z.object({
  id: z.coerce.number().int()
})

export default eventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, ParamsSchema.parse)
  // Delete book
  const deletedBooks = await db.delete(schema.books).where(
    eq(schema.books.id, id)
  ).returning()

  const deletedBook = deletedBooks[0]
  if (!deletedBook) {
    throw createError({
      statusCode: 404,
      message: 'Book not found'
    })
  }
  return deletedBook
})
