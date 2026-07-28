<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

interface Patron {
    id: number
    name: string
    contactDetails: string
    membershipId: string
    createdAt: string
}

interface Transaction {
    id: number
    bookId: number
    patronId: number
    loanDate: string
    returnDate: string | null
}

const toast = useToast()
const table = useTemplateRef('table')
const selectedPatron = ref<Patron | null>(null)
const showTransactionHistory = ref(false)
const showCurrentBooks = ref(false)
const patronTransactions = ref<Transaction[]>([])
const currentBooks = ref<any[]>([])

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
                    patronTransactions.value = await $fetch(`/api/transactions/patron/${patron.id}`)
                    showTransactionHistory.value = true
                } catch (error) {
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
                    const transactions = await $fetch(`/api/transactions/patron/${patron.id}`)
                    const activeLoans = transactions.filter((t: Transaction) => !t.returnDate)

                    if (activeLoans.length === 0) {
                        toast.add({
                            title: 'No Books',
                            description: 'This patron is not currently holding any books'
                        })
                        return
                    }

                    currentBooks.value = await Promise.all(
                        activeLoans.map(async (loan: Transaction) => {
                            const books = await $fetch('/api/books')
                            return books.find((b: any) => b.id === loan.bookId)
                        })
                    )
                    showCurrentBooks.value = true
                } catch (error) {
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
    {
        accessorKey: 'name',
        header: 'Name'
    },
    {
        accessorKey: 'membershipId',
        header: 'Membership ID'
    },
    {
        accessorKey: 'contactDetails',
        header: 'Contact Details'
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
            return h(
                'div',
                { class: 'flex justify-end' },
                h('UDropdownMenu', {
                    items: getPatronActions(row.original),
                    content: { align: 'end' }
                }, () =>
                    h('UButton', {
                        icon: 'i-lucide-ellipsis-vertical',
                        color: 'neutral',
                        variant: 'ghost'
                    })
                )
            )
        }
    }
]
</script>

<template>
    <UDashboardPanel id="patrons">
        <template #header>
            <UDashboardNavbar title="Patrons">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <UTable ref="table" :data="patrons || []" :columns="columns" :loading="status === 'pending'" class="w-full"
                :ui="{
                    base: 'relative overflow-x-auto border border-default rounded-lg',
                    thead: 'bg-elevated/50',
                    // tr: {
                    //     base: 'border-b border-default',
                    //     selected: 'bg-primary/10'
                    // },
                    th: 'px-4 py-2 text-left text-sm font-semibold',
                    td: 'px-4 py-3 text-sm'
                }" />

            <div v-if="!patrons || patrons.length === 0" class="flex items-center justify-center py-12 text-center">
                <div>
                    <p class="text-slate-600 mb-2">No patrons registered yet.</p>
                    <p class="text-sm text-slate-500">Start by adding library members.</p>
                </div>
            </div>
        </template>
    </UDashboardPanel>

    <!-- Transaction History Modal -->
    <UModal v-model:open="showTransactionHistory" title="Transaction History"
        :description="`${selectedPatron?.name}'s transaction history`">
        <template #body>
            <div v-if="patronTransactions.length === 0" class="py-8 text-center text-slate-500">
                No transaction history found.
            </div>

            <div v-else class="space-y-3 max-h-96 overflow-y-auto">
                <div v-for="transaction in patronTransactions" :key="transaction.id"
                    class="rounded-lg border border-slate-200 p-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="font-semibold text-slate-900">Book ID: {{ transaction.bookId }}</p>
                            <p class="text-sm text-slate-600">
                                Loan Date: {{ new Date(transaction.loanDate).toLocaleDateString() }}
                            </p>
                            <p v-if="transaction.returnDate" class="text-sm text-slate-600">
                                Return Date: {{ new Date(transaction.returnDate).toLocaleDateString() }}
                            </p>
                            <p v-else class="text-sm text-amber-600 font-medium">
                                Currently on loan
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </UModal>

    <!-- Current Books Modal -->
    <UModal v-model:open="showCurrentBooks" title="Current Books"
        :description="`${selectedPatron?.name}'s current books`">
        <template #body>
            <div v-if="currentBooks.length === 0" class="py-8 text-center text-slate-500">
                No books currently on loan.
            </div>

            <div v-else class="space-y-3 max-h-96 overflow-y-auto">
                <div v-for="book in currentBooks" :key="book.id" class="rounded-lg border border-slate-200 p-4">
                    <p class="font-semibold text-slate-900">{{ book.title }}</p>
                    <p class="text-sm text-slate-600">{{ book.author }}</p>
                    <p class="text-xs text-slate-500 mt-1">Genre: {{ book.genre }}</p>
                    <p class="text-xs text-slate-500">ISBN: {{ book.isbn }}</p>
                </div>
            </div>
        </template>
    </UModal>
</template>
