import { db, schema } from '@nuxthub/db'

export default eventHandler(async () => {
    // List all books
    const allBooks = await db.select().from(schema.books)
    return allBooks
})
