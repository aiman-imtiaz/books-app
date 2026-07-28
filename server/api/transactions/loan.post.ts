import { z } from 'zod'
import { db, schema } from '@nuxthub/db'

const BodySchema = z.object({
    bookId: z.number().int(),
    patronId: z.number().int()
})

export default eventHandler(async (event) => {
    const { bookId, patronId } = await readValidatedBody(event, BodySchema.parse)
    // Create a loan transaction
    const transactions = await db.insert(schema.transactions).values({
        bookId,
        patronId,
        loanDate: new Date(),
        returnDate: null,
        createdAt: new Date()
    }).returning()

    return transactions[0]
})
