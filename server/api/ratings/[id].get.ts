import { z } from 'zod'
import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

const ParamsSchema = z.object({
  id: z.coerce.number().int()
})

export default eventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, ParamsSchema.parse)
  // Get transaction history for a book
  const ratings = await db.select().from(schema.ratings).where(
    eq(schema.ratings.bookId, id)
  )

  return ratings
})