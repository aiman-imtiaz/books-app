import { z } from 'zod'
import { db, schema } from '@nuxthub/db'

const BodySchema = z.object({
    name: z.string().min(1).max(255),
    contactDetails: z.string().min(1).max(255),
    membershipId: z.string().min(1).max(50)
})

export default eventHandler(async (event) => {
    const { name, contactDetails, membershipId } = await readValidatedBody(event, BodySchema.parse)
    // Insert patron
    const patrons = await db.insert(schema.patrons).values({
        name,
        contactDetails,
        membershipId,
        createdAt: new Date()
    }).returning()

    return patrons[0]
})
