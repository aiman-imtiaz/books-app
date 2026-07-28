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
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="grid gap-6">
        <!-- Books Summary -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold">
                Books in Library
              </h2>
              <NuxtLink to="/books">
                <UButton
                  icon="i-lucide-arrow-right"
                  size="sm"
                  color="neutral"
                  variant="ghost"
                />
              </NuxtLink>
            </div>
          </template>

          <div class="flex items-center justify-between">
            <div>
              <p class="text-3xl font-bold">
                {{ bookCount }}
              </p>
              <p class="text-sm text-slate-600">
                Total books in collection
              </p>
            </div>
            <NuxtLink to="/books">
              <UButton
                icon="i-lucide-book"
                label="Manage Books"
              />
            </NuxtLink>
          </div>
        </UCard>

        <!-- Patrons Summary -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold">
                Library Patrons
              </h2>
              <NuxtLink to="/users">
                <UButton
                  icon="i-lucide-arrow-right"
                  size="sm"
                  color="neutral"
                  variant="ghost"
                />
              </NuxtLink>
            </div>
          </template>

          <div class="flex items-center justify-between">
            <div>
              <p class="text-3xl font-bold">
                {{ patronCount }}
              </p>
              <p class="text-sm text-slate-600">
                Active library members
              </p>
            </div>
            <NuxtLink to="/users">
              <UButton
                icon="i-lucide-users"
                label="Manage Patrons"
              />
            </NuxtLink>
          </div>
        </UCard>

        <!-- Active Loans -->
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">
              Active Loans
            </h2>
            <p class="text-sm text-slate-600">
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

            <template #actions-cell="{ row }">
              <div class="flex justify-end">
                <UButton
                  label="Return"
                  icon="i-lucide-corner-up-left"
                  size="sm"
                  color="neutral"
                  variant="soft"
                  :loading="returningId === row.original.id"
                  @click="returnBook(row.original.id)"
                />
              </div>
            </template>

            <template #empty>
              <div class="flex flex-col items-center justify-center py-12 text-center">
                <p class="text-slate-600">
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

const toast = useToast()

const { data: books } = await useFetch<Book[]>('/api/books', { lazy: true })
const { data: patrons } = await useFetch<Patron[]>('/api/patrons', { lazy: true })
const { data: transactions, status: transactionsStatus, refresh: refreshTransactions }
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
  { id: 'actions', header: '' }
]

const returningId = ref<number | null>(null)

const returnBook = async (transactionId: number) => {
  returningId.value = transactionId
  try {
    await $fetch(`/api/transactions/return/${transactionId}`, {
      method: 'PATCH'
    })
    toast.add({
      title: 'Success',
      description: 'Book marked as returned',
      color: 'success'
    })
    await refreshTransactions()
  }
  catch (error) {
    console.error(error)
    toast.add({
      title: 'Error',
      description: 'Failed to return book',
      color: 'error'
    })
  }
  finally {
    returningId.value = null
  }
}
</script>
