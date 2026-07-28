<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Dashboard" :ui="{ right: 'gap-3' }">
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
              <h2 class="text-lg font-semibold">Books in Library</h2>
              <NuxtLink to="/books">
                <UButton icon="i-lucide-arrow-right" size="sm" color="neutral" variant="ghost" />
              </NuxtLink>
            </div>
          </template>

          <div class="flex items-center justify-between">
            <div>
              <p class="text-3xl font-bold">{{ bookCount }}</p>
              <p class="text-sm text-slate-600">Total books in collection</p>
            </div>
            <NuxtLink to="/books">
              <UButton icon="i-lucide-book" label="Manage Books" />
            </NuxtLink>
          </div>
        </UCard>

        <!-- Patrons Summary -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold">Library Patrons</h2>
              <NuxtLink to="/users">
                <UButton icon="i-lucide-arrow-right" size="sm" color="neutral" variant="ghost" />
              </NuxtLink>
            </div>
          </template>

          <div class="flex items-center justify-between">
            <div>
              <p class="text-3xl font-bold">{{ patronCount }}</p>
              <p class="text-sm text-slate-600">Active library members</p>
            </div>
            <NuxtLink to="/users">
              <UButton icon="i-lucide-users" label="Manage Patrons" />
            </NuxtLink>
          </div>
        </UCard>

        <!-- Active Loans Summary -->
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">Active Loans</h2>
          </template>

          <div>
            <p class="text-3xl font-bold">{{ activeLoans }}</p>
            <p class="text-sm text-slate-600">Books currently on loan</p>
          </div>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">

const { data: books } = await useFetch<Book[]>('/api/books', { lazy: true })
const { data: patrons } = await useFetch<Patron[]>('/api/patrons', { lazy: true })
const { data: transactions } = await useFetch<Transaction[]>('/api/transactions', { lazy: true })

const bookCount = computed(() => books.value?.length ?? 0)
const patronCount = computed(() => patrons.value?.length ?? 0)
const activeLoans = computed(() => {
  return (transactions.value ?? []).filter(t => !t.returnDate).length
})
</script>