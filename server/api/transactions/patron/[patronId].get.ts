import { z } from 'zod'
import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

const ParamsSchema = z.object({
    patronId: z.coerce.number().int()
})

export default eventHandler(async (event) => {
    const { patronId } = await getValidatedRouterParams(event, ParamsSchema.parse)
    // Get transaction history for a patron
    const transactions = await db.select().from(schema.transactions).where(
        eq(schema.transactions.patronId, patronId)
    )

    return transactions
})
