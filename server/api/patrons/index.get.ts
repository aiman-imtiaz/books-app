import { db, schema } from '@nuxthub/db'

export default eventHandler(async () => {
    // List all patrons
    const allPatrons = await db.select().from(schema.patrons)
    return allPatrons
})
