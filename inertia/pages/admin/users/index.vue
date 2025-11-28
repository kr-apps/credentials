<script setup lang="ts">
import { ref, watch } from 'vue'
import { router, Link } from '@inertiajs/vue3'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Search, Edit, ChevronLeft, ChevronRight, LayoutDashboard, Users } from 'lucide-vue-next'

interface User {
  id: number
  email: string
  fullName: string | null
  createdAt: string
  isLocked: boolean
  roles: Array<{ id: number; name: string; slug: string }>
}

interface PaginationMeta {
  total: number
  perPage: number
  currentPage: number
  lastPage: number
  firstPage: number
  firstPageUrl: string
  lastPageUrl: string
  nextPageUrl: string | null
  previousPageUrl: string | null
}

interface Props {
  users: {
    meta: PaginationMeta
    data: User[]
  }
  filters: {
    search: string
  }
}

const props = defineProps<Props>()

const search = ref(props.filters.search)

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout>
watch(search, (value) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    router.get(
      '/admin/users',
      { search: value, page: 1 },
      {
        preserveState: true,
        preserveScroll: true,
      }
    )
  }, 300)
})

const goToPage = (page: number) => {
  router.get(
    '/admin/users',
    { search: search.value, page },
    {
      preserveState: true,
      preserveScroll: true,
    }
  )
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900"
  >
    <!-- Header -->
    <header class="border-b bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
      <div class="container mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Users class="h-6 w-6" />
          <h1 class="text-2xl font-bold">User Management</h1>
        </div>
        <Link href="/admin/dashboard">
          <Button variant="outline">
            <LayoutDashboard class="h-4 w-4 mr-2" />
            Dashboard
          </Button>
        </Link>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <div class="max-w-7xl mx-auto space-y-6">
        <!-- Search and Filters -->
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              Total: {{ users.meta.total }} user{{ users.meta.total !== 1 ? 's' : '' }}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="flex items-center gap-2">
              <div class="relative flex-1 max-w-sm">
                <Search
                  class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                />
                <Input
                  v-model="search"
                  placeholder="Search by email or name..."
                  class="pl-9"
                  type="search"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Users Table -->
        <Card>
          <CardContent class="p-0">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="border-b bg-muted/50">
                  <tr>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      User
                    </th>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      Roles
                    </th>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      Created
                    </th>
                    <th
                      class="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y">
                  <tr
                    v-for="user in users.data"
                    :key="user.id"
                    class="hover:bg-muted/50 transition-colors"
                  >
                    <td class="px-6 py-4">
                      <div class="flex flex-col">
                        <span class="font-medium">{{ user.fullName || 'N/A' }}</span>
                        <span class="text-sm text-muted-foreground">{{ user.email }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex flex-wrap gap-1">
                        <span
                          v-for="role in user.roles"
                          :key="role.id"
                          class="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold bg-primary/10 text-primary"
                        >
                          {{ role.name }}
                        </span>
                        <span v-if="user.roles.length === 0" class="text-sm text-muted-foreground">
                          No roles
                        </span>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <span
                        class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                        :class="
                          user.isLocked
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        "
                      >
                        {{ user.isLocked ? 'Locked' : 'Active' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm text-muted-foreground">
                      {{ formatDate(user.createdAt) }}
                    </td>
                    <td class="px-6 py-4 text-right">
                      <Link :href="`/admin/users/${user.id}/edit`">
                        <Button variant="ghost" size="sm">
                          <Edit class="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- Empty State -->
              <div v-if="users.data.length === 0" class="text-center py-12 text-muted-foreground">
                <Users class="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p class="text-lg font-medium">No users found</p>
                <p class="text-sm">Try adjusting your search criteria</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Pagination -->
        <Card v-if="users.meta.lastPage > 1">
          <CardContent class="flex items-center justify-between py-4">
            <div class="text-sm text-muted-foreground">
              Showing {{ (users.meta.currentPage - 1) * users.meta.perPage + 1 }} to
              {{ Math.min(users.meta.currentPage * users.meta.perPage, users.meta.total) }}
              of {{ users.meta.total }} results
            </div>
            <div class="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                :disabled="users.meta.currentPage === 1"
                @click="goToPage(users.meta.currentPage - 1)"
              >
                <ChevronLeft class="h-4 w-4 mr-1" />
                Previous
              </Button>
              <div class="flex items-center gap-1">
                <span class="text-sm"
                  >Page {{ users.meta.currentPage }} of {{ users.meta.lastPage }}</span
                >
              </div>
              <Button
                variant="outline"
                size="sm"
                :disabled="users.meta.currentPage === users.meta.lastPage"
                @click="goToPage(users.meta.currentPage + 1)"
              >
                Next
                <ChevronRight class="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  </div>
</template>
