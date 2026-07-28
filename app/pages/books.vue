<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

interface Book {
    id: number
    title: string
    author: string
    genre: string
    isbn: string
    createdAt: string
}

const toast = useToast()
const showAddForm = ref(false)
const title = ref('')
const author = ref('')
const genre = ref('')
const isbn = ref('')
const isLoading = ref(false)
const table = useTemplateRef('table')

const { data: books, status, refresh } = await useFetch<Book[]>('/api/books', {
    lazy: true
})

const columns: TableColumn<Book>[] = [
    {
        accessorKey: 'title',
        header: 'Title'
    },
    {
        accessorKey: 'author',
        header: 'Author'
    },
    {
        accessorKey: 'genre',
        header: 'Genre'
    },
    {
        accessorKey: 'isbn',
        header: 'ISBN'
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
            return h(
                'div',
                { class: 'flex justify-end gap-2' },
                h('UButton', {
                    icon: 'i-lucide-trash',
                    color: 'error',
                    variant: 'soft',
                    async onClick() {
                        try {
                            await $fetch(`/api/books/${row.original.id}`, {
                                method: 'DELETE'
                            })
                            toast.add({
                                title: 'Success',
                                description: `Book "${row.original.title}" removed successfully`,
                                color: 'success'
                            })
                            await refresh()
                        } catch (error) {
                            toast.add({
                                title: 'Error',
                                description: 'Failed to delete book',
                                color: 'error'
                            })
                        }
                    }
                })
            )
        }
    }
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
    } catch (error) {
        toast.add({
            title: 'Error',
            description: 'Failed to add book',
            color: 'error'
        })
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
    <UDashboardPanel id="books">
        <template #header>
            <UDashboardNavbar title="Books">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>

                <template #right>
                    <UButton icon="i-lucide-plus" size="lg" @click="showAddForm = true">
                        Add Book
                    </UButton>
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <UTable ref="table" :data="books || []" :columns="columns" :loading="status === 'pending'" class="w-full"
                :ui="{
                    base: 'relative overflow-x-auto border border-default rounded-lg',
                    thead: 'bg-elevated/50',
                    th: 'px-4 py-2 text-left text-sm font-semibold',
                    td: 'px-4 py-3 text-sm'
                }" />

            <div v-if="!books || books.length === 0" class="flex items-center justify-center py-12 text-center">
                <div>
                    <p class="text-slate-600 mb-2">No books in the collection yet.</p>
                    <UButton icon="i-lucide-plus" @click="showAddForm = true">
                        Add Your First Book
                    </UButton>
                </div>
            </div>
        </template>
    </UDashboardPanel>

    <!-- Add Book Modal -->
    <UModal v-model:open="showAddForm" title="Add New Book" description="Add a new book to your collection">
        <template #body>
            <form @submit.prevent="addBook" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-slate-900 mb-1">Title</label>
                    <input v-model="title" type="text" placeholder="Book title"
                        class="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                        required />
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-900 mb-1">Author</label>
                    <input v-model="author" type="text" placeholder="Author name"
                        class="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                        required />
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-900 mb-1">Genre</label>
                    <input v-model="genre" type="text" placeholder="Book genre"
                        class="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                        required />
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-900 mb-1">ISBN</label>
                    <input v-model="isbn" type="text" placeholder="ISBN number"
                        class="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                        required />
                </div>

                <div class="flex gap-2 pt-4">
                    <UButton type="button" color="neutral" variant="soft" class="flex-1" @click="showAddForm = false">
                        Cancel
                    </UButton>
                    <UButton type="submit" class="flex-1" :loading="isLoading" :disabled="isLoading">
                        Add Book
                    </UButton>
                </div>
            </form>
        </template>
    </UModal>
</template>
