<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar
        title="Home"
        :ui="{ right: 'gap-3' }"
      >
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UColorModeButton />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="grid gap-6">
        <!-- Books Summary -->
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">
              Books in Library
            </h2>
          </template>

          <div class="flex items-center justify-between">
            <div>
              <p class="text-3xl font-bold">
                {{ bookCount }}
              </p>
              <p class="text-sm text-muted">
                Total books in collection
              </p>
            </div>
            <UButton
              to="/books"
              icon="i-lucide-book"
              label="Manage Books"
            />
          </div>
        </UCard>

        <!-- Patrons Summary -->
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">
              Library Patrons
            </h2>
          </template>

          <div class="flex items-center justify-between">
            <div>
              <p class="text-3xl font-bold">
                {{ patronCount }}
              </p>
              <p class="text-sm text-muted">
                Active library members
              </p>
            </div>
            <UButton
              to="/users"
              icon="i-lucide-users"
              label="Manage Patrons"
            />
          </div>
        </UCard>

        <!-- Active Loans -->
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">
              Active Loans
            </h2>
            <p class="text-sm text-muted">
              {{ activeLoans }} books currently on loan
            </p>
          </template>

          <UTable
            :data="activeLoanRows"
            :columns="loanColumns"
            :loading="loansLoading"
            class="w-full"
            :ui="{
              base: 'relative overflow-x-auto border border-default rounded-lg',
              thead: 'bg-elevated/50',
              th: 'px-4 py-2 text-left text-sm font-semibold',
              td: 'px-4 py-3 text-sm'
            }"
          >
            <template #loanDate-cell="{ row }">
              {{ new Date(row.original.loanDate).toLocaleDateString() }}
            </template>

            <template #daysOnLoan-cell="{ row }">
              {{ daysSinceLoan(row.original.loanDate) }}
            </template>

            <template #empty>
              <div class="flex flex-col items-center justify-center py-12 text-center">
                <p class="text-muted">
                  No books currently on loan.
                </p>
              </div>
            </template>
          </UTable>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

interface ActiveLoanRow {
  id: number
  bookTitle: string
  patronName: string
  loanDate: Date
}

const { data: books } = await useFetch<Book[]>('/api/books', { lazy: true })
const { data: patrons } = await useFetch<Patron[]>('/api/patrons', { lazy: true })
const { data: transactions, status: transactionsStatus }
  = await useFetch<Transaction[]>('/api/transactions', { lazy: true })

const bookCount = computed(() => books.value?.length ?? 0)
const patronCount = computed(() => patrons.value?.length ?? 0)

const activeTransactions = computed(() => (transactions.value ?? []).filter(t => !t.returnDate))
const activeLoans = computed(() => activeTransactions.value.length)
const loansLoading = computed(() => transactionsStatus.value === 'pending')

const activeLoanRows = computed<ActiveLoanRow[]>(() => {
  return activeTransactions.value.map((t) => {
    const book = books.value?.find(b => b.id === t.bookId)
    const patron = patrons.value?.find(p => p.id === t.patronId)
    return {
      id: t.id,
      bookTitle: book?.title ?? 'Unknown book',
      patronName: patron?.name ?? 'Unknown patron',
      loanDate: t.loanDate
    }
  })
})

const loanColumns: TableColumn<ActiveLoanRow>[] = [
  { accessorKey: 'bookTitle', header: 'Book' },
  { accessorKey: 'patronName', header: 'Patron' },
  { id: 'loanDate', header: 'Loan Date' },
  { id: 'daysOnLoan', header: 'Days on Loan' }
]

const daysSinceLoan = (loanDate: Date | string) => {
  const loaned = new Date(loanDate)
  const now = new Date()
  const msPerDay = 1000 * 60 * 60 * 24
  // Zero out time components so partial days still count as whole days elapsed
  const loanedMidnight = new Date(loaned.getFullYear(), loaned.getMonth(), loaned.getDate())
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.max(0, Math.round((nowMidnight.getTime() - loanedMidnight.getTime()) / msPerDay))
}
</script>
