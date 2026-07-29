import { z } from 'zod'
import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

const ParamsSchema = z.object({
  id: z.coerce.number().int()
})

export default eventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, ParamsSchema.parse)

  const deletedBook = await db.transaction(async (tx) => {
    // Remove dependent transactions first to satisfy the FK constraint
    await tx.delete(schema.transactions).where(
      eq(schema.transactions.bookId, id)
    )

    const deletedBooks = await tx.delete(schema.books).where(
      eq(schema.books.id, id)
    ).returning()

    return deletedBooks[0]
  })

  if (!deletedBook) {
    throw createError({
      statusCode: 404,
      message: 'Book not found'
    })
  }
  return deletedBook
})
