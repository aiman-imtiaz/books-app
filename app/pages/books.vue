<script setup lang="ts">
import type { DropdownMenuItem, TableColumn } from '@nuxt/ui'

const toast = useToast()
const showAddForm = ref(false)
const title = ref('')
const author = ref('')
const genre = ref('')
const isbn = ref('')
const isLoading = ref(false)
const table = useTemplateRef('table')

const showLoanForm = ref(false)
const selectedBookForLoan = ref<Book | null>(null)
const loanMembershipId = ref('')
const isLoaningBook = ref(false)

const showBookHistory = ref(false)
const selectedBookForHistory = ref<Book | null>(null)
const bookHistoryTransactions = ref<Transaction[]>([])

const showLoanDetails = ref(false)
const selectedBookForLoanDetails = ref<Book | null>(null)

const showDeleteConfirm = ref(false)
const bookToDelete = ref<Book | null>(null)
const isDeleting = ref(false)

const { data: books, status, refresh } = await useFetch<Book[]>('/api/books', {
  lazy: true
})
const { data: patrons, refresh: refreshPatrons } = await useFetch<Patron[]>('/api/patrons', { lazy: true })
const { data: transactions, refresh: refreshTransactions } = await useFetch<Transaction[]>('/api/transactions', { lazy: true })

const loanedBookIds = computed(() => {
  return new Set((transactions.value ?? []).filter(t => !t.returnDate).map(t => t.bookId))
})

const isBookAvailable = (bookId: number) => !loanedBookIds.value.has(bookId)

const getActiveTransactionId = (bookId: number) => {
  return (transactions.value ?? []).find(t => t.bookId === bookId && !t.returnDate)?.id
}

const getActiveTransaction = (bookId: number) => {
  return (transactions.value ?? []).find(t => t.bookId === bookId && !t.returnDate)
}

const daysSinceLoan = (loanDate: Date | string) => {
  const loaned = new Date(loanDate)
  const now = new Date()
  const msPerDay = 1000 * 60 * 60 * 24
  const loanedMidnight = new Date(loaned.getFullYear(), loaned.getMonth(), loaned.getDate())
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.max(0, Math.round((nowMidnight.getTime() - loanedMidnight.getTime()) / msPerDay))
}

const openLoanDetails = async (book: Book) => {
  selectedBookForLoanDetails.value = book
  if (!patrons.value || patrons.value.length === 0) {
    await refreshPatrons()
  }
  showLoanDetails.value = true
}

const returningId = ref<number | null>(null)

const loanModalDescription = computed(() => {
  return selectedBookForLoan.value ? `Loan out "${selectedBookForLoan.value.title}"` : ''
})

const getPatronName = (patronId: number) => {
  return patrons.value?.find(p => Number(p.id) === Number(patronId))?.name ?? 'Unknown patron'
}

const getBookActions = (book: Book): DropdownMenuItem[] => {
  return [
    {
      label: 'View History',
      icon: 'i-lucide-history',
      async onSelect() {
        selectedBookForHistory.value = book
        try {
          if (!patrons.value || patrons.value.length === 0) {
            await refreshPatrons()
          }
          const url: string = `/api/transactions/book/${book.id}`
          bookHistoryTransactions.value = await $fetch<Transaction[]>(url)
          showBookHistory.value = true
        }
        catch (error) {
          console.error(error)
          toast.add({
            title: 'Error',
            description: 'Failed to load book history',
            color: 'error'
          })
        }
      }
    },
    {
      label: 'Delete Book',
      icon: 'i-lucide-trash',
      color: 'error',
      onSelect() {
        bookToDelete.value = book
        showDeleteConfirm.value = true
      }
    }
  ]
}

const columns: TableColumn<Book>[] = [
  { accessorKey: 'title', header: 'Title' },
  { accessorKey: 'author', header: 'Author' },
  { accessorKey: 'genre', header: 'Genre' },
  { accessorKey: 'isbn', header: 'ISBN' },
  { id: 'status', header: 'Status' },
  { id: 'actions', header: '' }
]

const addBook = async () => {
  if (!title.value.trim() || !author.value.trim() || !genre.value.trim() || !isbn.value.trim()) {
    toast.add({
      title: 'Validation Error',
      description: 'Please fill in all fields',
      color: 'error'
    })
    return
  }

  isLoading.value = true
  try {
    await $fetch('/api/books', {
      method: 'POST',
      body: {
        title: title.value.trim(),
        author: author.value.trim(),
        genre: genre.value.trim(),
        isbn: isbn.value.trim()
      }
    })

    toast.add({
      title: 'Success',
      description: `Book "${title.value}" added successfully`,
      color: 'success'
    })

    title.value = ''
    author.value = ''
    genre.value = ''
    isbn.value = ''
    showAddForm.value = false
    await refresh()
  }
  catch (error) {
    console.error(error)
    toast.add({
      title: 'Error',
      description: 'Failed to add book',
      color: 'error'
    })
  }
  finally {
    isLoading.value = false
  }
}

const deleteBook = async () => {
  if (!bookToDelete.value) return

  isDeleting.value = true
  try {
    await $fetch(`/api/books/${bookToDelete.value.id}`, { method: 'DELETE' })
    toast.add({
      title: 'Success',
      description: `Book "${bookToDelete.value.title}" and all associated transactions removed successfully`,
      color: 'success'
    })
    showDeleteConfirm.value = false
    bookToDelete.value = null
    await refresh()
    await refreshTransactions()
  }
  catch (error) {
    console.error(error)
    toast.add({ title: 'Error', description: 'Failed to delete book', color: 'error' })
  }
  finally {
    isDeleting.value = false
  }
}

const openLoanModal = (book: Book) => {
  selectedBookForLoan.value = book
  loanMembershipId.value = ''
  showLoanForm.value = true
}

const submitLoan = async () => {
  if (!loanMembershipId.value.trim()) {
    toast.add({
      title: 'Validation Error',
      description: 'Please enter a membership ID',
      color: 'error'
    })
    return
  }

  if (!selectedBookForLoan.value) return

  isLoaningBook.value = true
  try {
    if (!patrons.value || patrons.value.length === 0) {
      await refreshPatrons()
    }

    const patron = patrons.value?.find(p => p.membershipId === loanMembershipId.value.trim())
    if (!patron) {
      toast.add({
        title: 'Error',
        description: 'No patron found with that membership ID',
        color: 'error'
      })
      return
    }

    await $fetch('/api/transactions/loan', {
      method: 'POST',
      body: {
        bookId: selectedBookForLoan.value.id,
        patronId: patron.id
      }
    })

    toast.add({
      title: 'Success',
      description: `"${selectedBookForLoan.value.title}" loaned to ${patron.name}`,
      color: 'success'
    })

    showLoanForm.value = false
    loanMembershipId.value = ''
    selectedBookForLoan.value = null
    await refreshTransactions()
  }
  catch (error) {
    console.error(error)
    toast.add({
      title: 'Error',
      description: 'Failed to register loan',
      color: 'error'
    })
  }
  finally {
    isLoaningBook.value = false
  }
}

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

<template>
  <UDashboardPanel id="books">
    <template #header>
      <div class="flex items-center border-b border-default px-4 py-2">
        <NuxtLink
          to="/"
          class="flex items-center gap-2"
        >
          <UIcon
            name="i-lucide-library"
            class="size-5 text-primary"
          />
          <span class="font-semibold text-highlighted">
            Read and Let Read
          </span>
        </NuxtLink>
      </div>
      <UDashboardNavbar
        title="Books"
        :ui="{ root: 'border-b-0', right: 'gap-3' }"
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
            Add Book
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UTable
        ref="table"
        :data="books || []"
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
        <template #status-cell="{ row }">
          <UBadge
            v-if="isBookAvailable(row.original.id)"
            label="Available"
            color="success"
            variant="subtle"
          />
          <UBadge
            v-else
            label="On Loan"
            color="warning"
            variant="subtle"
            class="cursor-pointer"
            @click="openLoanDetails(row.original)"
          />
        </template>

        <template #actions-cell="{ row }">
          <div class="flex justify-end items-center gap-2">
            <UButton
              v-if="isBookAvailable(row.original.id)"
              label="Loan"
              icon="i-lucide-book-plus"
              size="sm"
              color="neutral"
              variant="soft"
              @click="openLoanModal(row.original)"
            />
            <UButton
              v-else
              label="Return"
              icon="i-lucide-corner-up-left"
              size="sm"
              color="neutral"
              variant="soft"
              :loading="returningId === getActiveTransactionId(row.original.id)"
              @click="returnBook(getActiveTransactionId(row.original.id)!)"
            />
            <UDropdownMenu
              :items="getBookActions(row.original)"
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
              No books in the collection yet.
            </p>
            <UButton
              icon="i-lucide-plus"
              @click="showAddForm = true"
            >
              Add Your First Book
            </UButton>
          </div>
        </template>
      </UTable>
    </template>
  </UDashboardPanel>

  <!-- Add Book Modal -->
  <UModal
    v-model:open="showAddForm"
    title="Add New Book"
    description="Add a new book to your collection"
  >
    <template #body>
      <form
        class="space-y-4"
        @submit.prevent="addBook"
      >
        <UFormField
          label="Title"
          required
        >
          <UInput
            v-model="title"
            placeholder="Book title"
            class="w-full"
            size="lg"
          />
        </UFormField>

        <UFormField
          label="Author"
          required
        >
          <UInput
            v-model="author"
            placeholder="Author name"
            class="w-full"
            size="lg"
          />
        </UFormField>

        <UFormField
          label="Genre"
          required
        >
          <UInput
            v-model="genre"
            placeholder="Book genre"
            class="w-full"
            size="lg"
          />
        </UFormField>

        <UFormField
          label="ISBN"
          required
        >
          <UInput
            v-model="isbn"
            placeholder="ISBN number"
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
            Add Book
          </UButton>
        </div>
      </form>
    </template>
  </UModal>

  <!-- Loan Book Modal -->
  <UModal
    v-model:open="showLoanForm"
    title="Loan Book"
    :description="loanModalDescription"
  >
    <template #body>
      <form
        class="space-y-4"
        @submit.prevent="submitLoan"
      >
        <UFormField
          label="Patron Membership ID"
          required
        >
          <UInput
            v-model="loanMembershipId"
            placeholder="Enter membership ID"
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
            :disabled="isLoaningBook"
            @click="showLoanForm = false"
          >
            Cancel
          </UButton>
          <UButton
            type="submit"
            size="lg"
            class="flex-1 justify-center"
            :loading="isLoaningBook"
            :disabled="isLoaningBook"
          >
            Confirm Loan
          </UButton>
        </div>
      </form>
    </template>
  </UModal>

  <!-- Book History Modal -->
  <UModal
    v-model:open="showBookHistory"
    title="Loan History"
    :description="`${selectedBookForHistory?.title} loan history`"
  >
    <template #body>
      <div
        v-if="bookHistoryTransactions.length === 0"
        class="py-8 text-center text-dimmed"
      >
        No loan history found for this book.
      </div>

      <div
        v-else
        class="space-y-3 max-h-96 overflow-y-auto"
      >
        <div
          v-for="transaction in bookHistoryTransactions"
          :key="transaction.id"
          class="rounded-lg border border-default p-4"
        >
          <p class="font-semibold text-highlighted">
            {{ getPatronName(transaction.patronId) }}
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

  <!-- Loan Details Modal -->
  <UModal
    v-model:open="showLoanDetails"
    title="Loan Details"
    :description="`${selectedBookForLoanDetails?.title} is currently on loan`"
  >
    <template #body>
      <div
        v-if="selectedBookForLoanDetails && getActiveTransaction(selectedBookForLoanDetails.id)"
        class="rounded-lg border border-default p-4 space-y-1"
      >
        <p class="font-semibold text-highlighted">
          {{ getPatronName(getActiveTransaction(selectedBookForLoanDetails.id)!.patronId) }}
        </p>
        <p class="text-sm text-muted">
          Loan Date: {{ new
            Date(getActiveTransaction(selectedBookForLoanDetails.id)!.loanDate).toLocaleDateString() }}
        </p>
        <p class="text-sm text-amber-500 dark:text-amber-400 font-medium">
          {{ daysSinceLoan(getActiveTransaction(selectedBookForLoanDetails.id)!.loanDate) }} day(s) on loan
        </p>
      </div>

      <div
        v-else
        class="py-8 text-center text-dimmed"
      >
        No active loan found for this book.
      </div>
    </template>
  </UModal>

  <!-- Delete Book Confirmation Modal -->
  <UModal
    v-model:open="showDeleteConfirm"
    title="Delete Book"
    description="This action cannot be undone"
  >
    <template #body>
      <p class="text-sm text-default">
        Are you sure you want to delete
        <span class="font-semibold text-highlighted">{{ bookToDelete?.title }}</span>?
        This will also permanently delete all loan history associated with this book.
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
          @click="deleteBook"
        >
          Delete Book
        </UButton>
      </div>
    </template>
  </UModal>
</template>
