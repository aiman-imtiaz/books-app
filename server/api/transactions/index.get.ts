import { db, schema } from '@nuxthub/db'

export default eventHandler(async () => {
  // List all transactions
  const allTransactions = await db.select().from(schema.transactions)
  return allTransactions
})
