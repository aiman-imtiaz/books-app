<script setup lang="ts">
import type { DropdownMenuItem, TableColumn } from '@nuxt/ui'

const toast = useToast()
const table = useTemplateRef('table')
const selectedPatron = ref<Patron | null>(null)
const showTransactionHistory = ref(false)
const showCurrentBooks = ref(false)
const patronTransactions = ref<Transaction[]>([])

interface CurrentBookRow {
  book: Book
  loanDate: Date
}

const currentBooks = ref<CurrentBookRow[]>([])

const showAddForm = ref(false)
const name = ref('')
const membershipId = ref('')
const contactDetails = ref('')
const isLoading = ref(false)

const showDeleteConfirm = ref(false)
const patronToDelete = ref<Patron | null>(null)
const isDeleting = ref(false)

const { data: patrons, status, refresh } = await useFetch<Patron[]>('/api/patrons', {
  lazy: true
})
const { data: books, refresh: refreshBooks } = await useFetch<Book[]>('/api/books', { lazy: true })
const { data: transactions } = await useFetch<Transaction[]>('/api/transactions', { lazy: true })

const patronsWithActiveLoans = computed(() => {
  return new Set((transactions.value ?? []).filter(t => !t.returnDate).map(t => t.patronId))
})

const hasActiveLoans = (patronId: number) => patronsWithActiveLoans.value.has(patronId)

const getBookTitle = (bookId: number) => {
  return books.value?.find(b => Number(b.id) === Number(bookId))?.title ?? `Unknown book (ID: ${bookId})`
}

const daysSinceLoan = (loanDate: Date | string) => {
  const loaned = new Date(loanDate)
  const now = new Date()
  const msPerDay = 1000 * 60 * 60 * 24
  const loanedMidnight = new Date(loaned.getFullYear(), loaned.getMonth(), loaned.getDate())
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.max(0, Math.round((nowMidnight.getTime() - loanedMidnight.getTime()) / msPerDay))
}

const viewCurrentBooks = async (patron: Patron) => {
  selectedPatron.value = patron
  try {
    if (!books.value || books.value.length === 0) {
      await refreshBooks()
    }
    const transactionsUrl: string = `/api/transactions/patron/${patron.id}`
    const patronTx = await $fetch<Transaction[]>(transactionsUrl)
    const activeLoans = patronTx.filter((t: Transaction) => !t.returnDate)

    if (activeLoans.length === 0) {
      toast.add({
        title: 'No Books',
        description: 'This patron is not currently holding any books'
      })
      return
    }
    currentBooks.value = activeLoans
      .map((loan) => {
        const book = books.value?.find((b: Book) => Number(b.id) === Number(loan.bookId))
        return book ? { book, loanDate: loan.loanDate } : undefined
      })
      .filter((row): row is CurrentBookRow => row !== undefined)
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

const getPatronActions = (patron: Patron): DropdownMenuItem[] => {
  return [
    {
      label: 'View Transaction History',
      icon: 'i-lucide-history',
      async onSelect() {
        selectedPatron.value = patron
        try {
          if (!books.value || books.value.length === 0) {
            await refreshBooks()
          }
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
      label: 'Delete Patron',
      icon: 'i-lucide-trash',
      color: 'error',
      onSelect() {
        patronToDelete.value = patron
        showDeleteConfirm.value = true
      }
    }
  ]
}

const columns: TableColumn<Patron>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'membershipId', header: 'Membership ID' },
  { accessorKey: 'contactDetails', header: 'Contact Details' },
  { id: 'loanStatus', header: 'Loan Status' },
  { id: 'actions', header: '' }
]

const addPatron = async () => {
  if (!name.value.trim() || !membershipId.value.trim() || !contactDetails.value.trim()) {
    toast.add({
      title: 'Validation Error',
      description: 'Please fill in all fields',
      color: 'error'
    })
    return
  }

  isLoading.value = true
  try {
    await $fetch('/api/patrons', {
      method: 'POST',
      body: {
        name: name.value.trim(),
        membershipId: membershipId.value.trim(),
        contactDetails: contactDetails.value.trim()
      }
    })

    toast.add({
      title: 'Success',
      description: `Patron "${name.value}" added successfully`,
      color: 'success'
    })

    name.value = ''
    membershipId.value = ''
    contactDetails.value = ''
    showAddForm.value = false
    await refresh()
  }
  catch (error) {
    console.error(error)
    toast.add({
      title: 'Error',
      description: 'Failed to add patron',
      color: 'error'
    })
  }
  finally {
    isLoading.value = false
  }
}

const deletePatron = async () => {
  if (!patronToDelete.value) return

  isDeleting.value = true
  try {
    await $fetch(`/api/patrons/${patronToDelete.value.id}`, { method: 'DELETE' })
    toast.add({
      title: 'Success',
      description: `Patron "${patronToDelete.value.name}" and all associated transactions removed successfully`,
      color: 'success'
    })
    showDeleteConfirm.value = false
    patronToDelete.value = null
    await refresh()
  }
  catch (error) {
    console.error(error)
    toast.add({
      title: 'Error',
      description: 'Failed to delete patron',
      color: 'error'
    })
  }
  finally {
    isDeleting.value = false
  }
}
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

        <template #right>
          <UButton
            icon="i-lucide-plus"
            size="lg"
            @click="showAddForm = true"
          >
            Add Patron
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
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
        <template #loanStatus-cell="{ row }">
          <UBadge
            v-if="hasActiveLoans(row.original.id)"
            label="Active Loans"
            color="warning"
            variant="subtle"
            class="cursor-pointer"
            @click="viewCurrentBooks(row.original)"
          />
          <UBadge
            v-else
            label="No Active Loans"
            color="success"
            variant="subtle"
          />
        </template>

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
            <p class="text-muted mb-2">
              No patrons registered yet.
            </p>
            <p class="text-sm text-dimmed">
              Start by adding library members.
            </p>
          </div>
        </template>
      </UTable>
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
        class="py-8 text-center text-dimmed"
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
          class="rounded-lg border border-default p-4"
        >
          <p class="font-semibold text-highlighted">
            {{ getBookTitle(transaction.bookId) }}
          </p>
          <p class="text-sm text-muted">
            Loan Date: {{ new Date(transaction.loanDate).toLocaleDateString() }}
          </p>
          <p
            v-if="transaction.returnDate"
            class="text-sm text-muted"
          >
            Return Date: {{ new Date(transaction.returnDate).toLocaleDateString() }}
          </p>
          <p
            v-else
            class="text-sm text-amber-500 dark:text-amber-400 font-medium"
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
        class="py-8 text-center text-dimmed"
      >
        No books currently on loan.
      </div>

      <div
        v-else
        class="space-y-3 max-h-96 overflow-y-auto"
      >
        <div
          v-for="row in currentBooks"
          :key="row.book.id"
          class="rounded-lg border border-default p-4"
        >
          <p class="font-semibold text-highlighted">
            {{ row.book.title }}
          </p>
          <p class="text-sm text-muted">
            {{ row.book.author }}
          </p>
          <p class="text-xs text-dimmed mt-1">
            Genre: {{ row.book.genre }}
          </p>
          <p class="text-xs text-dimmed">
            ISBN: {{ row.book.isbn }}
          </p>
          <p class="text-sm text-amber-500 dark:text-amber-400 font-medium mt-2">
            {{ daysSinceLoan(row.loanDate) }} day(s) on loan
          </p>
        </div>
      </div>
    </template>
  </UModal>

  <!-- Add Patron Modal -->
  <UModal
    v-model:open="showAddForm"
    title="Add New Patron"
    description="Register a new patron with the library"
  >
    <template #body>
      <form
        class="space-y-4"
        @submit.prevent="addPatron"
      >
        <UFormField
          label="Name"
          required
        >
          <UInput
            v-model="name"
            placeholder="Patron name"
            class="w-full"
            size="lg"
          />
        </UFormField>

        <UFormField
          label="Membership ID"
          required
        >
          <UInput
            v-model="membershipId"
            placeholder="Membership ID"
            class="w-full"
            size="lg"
          />
        </UFormField>

        <UFormField
          label="Contact Details"
          required
        >
          <UInput
            v-model="contactDetails"
            placeholder="Email or phone number"
            class="w-full"
            size="lg"
          />
        </UFormField>

        <div class="flex gap-2 pt-4">
          <UButton
            type="button"
            color="neutral"
            variant="soft"
            size="lg"
            class="flex-1 justify-center"
            @click="showAddForm = false"
          >
            Cancel
          </UButton>
          <UButton
            type="submit"
            size="lg"
            class="flex-1 justify-center"
            :loading="isLoading"
            :disabled="isLoading"
          >
            Add Patron
          </UButton>
        </div>
      </form>
    </template>
  </UModal>

  <!-- Delete Patron Confirmation Modal -->
  <UModal
    v-model:open="showDeleteConfirm"
    title="Delete Patron"
    description="This action cannot be undone"
  >
    <template #body>
      <p class="text-sm text-default">
        Are you sure you want to delete
        <span class="font-semibold text-highlighted">{{ patronToDelete?.name }}</span>'s profile?
        This will also permanently delete all transactions associated with this patron.
      </p>

      <div class="flex gap-2 pt-6">
        <UButton
          type="button"
          color="neutral"
          variant="soft"
          class="flex-1 justify-center"
          :disabled="isDeleting"
          @click="showDeleteConfirm = false"
        >
          Cancel
        </UButton>
        <UButton
          type="button"
          color="error"
          class="flex-1 justify-center"
          :loading="isDeleting"
          :disabled="isDeleting"
          @click="deletePatron"
        >
          Delete Patron
        </UButton>
      </div>
    </template>
  </UModal>
</template>
