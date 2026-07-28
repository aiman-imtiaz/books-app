import { z } from 'zod'
import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'

const ParamsSchema = z.object({
    id: z.coerce.number().int()
})

export default eventHandler(async (event) => {
    const { id } = await getValidatedRouterParams(event, ParamsSchema.parse)
    // Update transaction with return date
    const updatedTransactions = await db.update(schema.transactions).set({
        returnDate: new Date()
    }).where(
        eq(schema.transactions.id, id)
    ).returning()

    const transaction = updatedTransactions[0]
    if (!transaction) {
        throw createError({
            statusCode: 404,
            message: 'Transaction not found'
        })
    }
    return transaction
})
