import { z } from 'zod'
import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

const ParamsSchema = z.object({
  bookId: z.coerce.number().int()
})

export default eventHandler(async (event) => {
  const { bookId } = await getValidatedRouterParams(event, ParamsSchema.parse)
  // Get transaction history for a book
  const transactions = await db.select().from(schema.transactions).where(
    eq(schema.transactions.bookId, bookId)
  )

  return transactions
})
