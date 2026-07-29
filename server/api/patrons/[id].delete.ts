import { z } from 'zod'
import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

const ParamsSchema = z.object({
  id: z.coerce.number().int()
})

export default eventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, ParamsSchema.parse)
  // Delete Patron
  const deletedPatrons = await db.delete(schema.patrons).where(
    eq(schema.patrons.id, id)
  ).returning()

  const deletedPatron = deletedPatrons[0]
  if (!deletedPatron) {
    throw createError({
      statusCode: 404,
      message: 'Patron not found'
    })
  }
  return deletedPatron
})
