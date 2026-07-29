import { z } from 'zod'
import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

const ParamsSchema = z.object({
  id: z.coerce.number().int()
})

export default eventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, ParamsSchema.parse)

  const deletedPatron = await db.transaction(async (tx) => {
    // Remove dependent transactions first to satisfy the FK constraint
    await tx.delete(schema.transactions).where(
      eq(schema.transactions.patronId, id)
    )

    const deletedPatrons = await tx.delete(schema.patrons).where(
      eq(schema.patrons.id, id)
    ).returning()

    return deletedPatrons[0]
  })

  if (!deletedPatron) {
    throw createError({
      statusCode: 404,
      message: 'Patron not found'
    })
  }
  return deletedPatron
})
