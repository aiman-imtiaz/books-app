import { z } from 'zod'
import { db, schema } from '@nuxthub/db'

const BodySchema = z.object({
  bookId: z.number().int(),
  patronId: z.number().int(),
  rating: z.number().int().min(1).max(5) // Assuming rating is between 1 and 5
})

export default eventHandler(async (event) => {
  const { bookId, patronId, rating } = await readValidatedBody(event, BodySchema.parse)
  // Create a loan transaction
  console.log({ bookId, patronId, rating })
  const ratings = await db.insert(schema.ratings).values({
    bookId,
    patronId,
    rating
  }).returning()

  return ratings[0]
})