<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

const toast = useToast()
const table = useTemplateRef('table')
const selectedPatron = ref<Patron | null>(null)
const showTransactionHistory = ref(false)
const showCurrentBooks = ref(false)
const patronTransactions = ref<Transaction[]>([])
const currentBooks = ref<Book[]>([])

const { data: patrons, status } = await useFetch<Patron[]>('/api/patrons', {
  lazy: true
})

const getPatronActions = (patron: Patron) => {
  return [
    {
      label: 'View Transaction History',
      icon: 'i-lucide-history',
      async onSelect() {
        selectedPatron.value = patron
        try {
          const url: string = `/api/transactions/patron/${patron.id}`
          patronTransactions.value = await $fetch<Transaction[]>(url)
          showTransactionHistory.value = true
        }
        catch (error) {
          console.error(error)
          toast.add({
            title: 'Error',
            description: 'Failed to load transaction history',
            color: 'error'
          })
        }
      }
    },
    {
      label: 'View Current Books',
      icon: 'i-lucide-book-open',
      async onSelect() {
        selectedPatron.value = patron
        try {
          const transactionsUrl: string = `/api/transactions/patron/${patron.id}`
          const transactions = await $fetch<Transaction[]>(transactionsUrl)
          const activeLoans = transactions.filter((t: Transaction) => !t.returnDate)

          if (activeLoans.length === 0) {
            toast.add({
              title: 'No Books',
              description: 'This patron is not currently holding any books'
            })
            return
          }
          const url: string = `/api/books`
          const books: Book[] = await $fetch(url)
          currentBooks.value = activeLoans
            .map(loan => books.find((b: Book) => b.id === loan.bookId))
            .filter((b): b is Book => b !== undefined)
          showCurrentBooks.value = true
        }
        catch (error) {
          console.error(error)
          toast.add({
            title: 'Error',
            description: 'Failed to load current books',
            color: 'error'
          })
        }
      }
    }
  ]
}

const columns: TableColumn<Patron>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'membershipId', header: 'Membership ID' },
  { accessorKey: 'contactDetails', header: 'Contact Details' },
  { id: 'actions', header: 'Actions' }
]
</script>

<template>
  <UDashboardPanel id="patrons">
    <template #header>
      <UDashboardNavbar
        title="Patrons"
        :ui="{ right: 'gap-3' }"
      >
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="grid gap-6">
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">
              Patron Details
            </h2>
            <p class="text-sm text-slate-600">
              All patrons currently registered with the library.
            </p>
          </template>
          <UTable
            ref="table"
            :data="patrons || []"
            :columns="columns"
            :loading="status === 'pending'"
            class="w-full"
            :ui="{
              base: 'relative overflow-x-auto border border-default rounded-lg',
              thead: 'bg-elevated/50',
              th: 'px-4 py-2 text-left text-sm font-semibold',
              td: 'px-4 py-3 text-sm'
            }"
          >
            <template #actions-cell="{ row }">
              <div class="flex justify-end">
                <UDropdownMenu
                  :items="getPatronActions(row.original)"
                  :content="{ align: 'end' }"
                >
                  <UButton
                    icon="i-lucide-ellipsis-vertical"
                    color="neutral"
                    variant="ghost"
                  />
                </UDropdownMenu>
              </div>
            </template>

            <template #empty>
              <div class="flex flex-col items-center justify-center py-12 text-center">
                <p class="text-slate-600 mb-2">
                  No patrons registered yet.
                </p>
                <p class="text-sm text-slate-500">
                  Start by adding library members.
                </p>
              </div>
            </template>
          </UTable>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>

  <!-- Transaction History Modal -->
  <UModal
    v-model:open="showTransactionHistory"
    title="Transaction History"
    :description="`${selectedPatron?.name}'s transaction history`"
  >
    <template #body>
      <div
        v-if="patronTransactions.length === 0"
        class="py-8 text-center text-slate-500"
      >
        No transaction history found.
      </div>

      <div
        v-else
        class="space-y-3 max-h-96 overflow-y-auto"
      >
        <div
          v-for="transaction in patronTransactions"
          :key="transaction.id"
          class="rounded-lg border border-slate-200 p-4"
        >
          <p class="font-semibold text-slate-900">
            Book ID: {{ transaction.bookId }}
          </p>
          <p class="text-sm text-slate-600">
            Loan Date: {{ new Date(transaction.loanDate).toLocaleDateString() }}
          </p>
          <p
            v-if="transaction.returnDate"
            class="text-sm text-slate-600"
          >
            Return Date: {{ new Date(transaction.returnDate).toLocaleDateString() }}
          </p>
          <p
            v-else
            class="text-sm text-amber-600 font-medium"
          >
            Currently on loan
          </p>
        </div>
      </div>
    </template>
  </UModal>

  <!-- Current Books Modal -->
  <UModal
    v-model:open="showCurrentBooks"
    title="Current Books"
    :description="`${selectedPatron?.name}'s current books`"
  >
    <template #body>
      <div
        v-if="currentBooks.length === 0"
        class="py-8 text-center text-slate-500"
      >
        No books currently on loan.
      </div>

      <div
        v-else
        class="space-y-3 max-h-96 overflow-y-auto"
      >
        <div
          v-for="book in currentBooks"
          :key="book.id"
          class="rounded-lg border border-slate-200 p-4"
        >
          <p class="font-semibold text-slate-900">
            {{ book.title }}
          </p>
          <p class="text-sm text-slate-600">
            {{ book.author }}
          </p>
          <p class="text-xs text-slate-500 mt-1">
            Genre: {{ book.genre }}
          </p>
          <p class="text-xs text-slate-500">
            ISBN: {{ book.isbn }}
          </p>
        </div>
      </div>
    </template>
  </UModal>
</template>
