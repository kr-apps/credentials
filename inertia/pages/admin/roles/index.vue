<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Shield, Edit, LayoutDashboard, Users, Lock } from 'lucide-vue-next'

interface Role {
  id: number
  name: string
  slug: string
  description: string | null
  isDefault: boolean
  permissionCount: number
  userCount: number
}

interface Props {
  roles: Role[]
}

defineProps<Props>()
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900"
  >
    <!-- Header -->
    <header class="border-b bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
      <div class="container mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Shield class="h-6 w-6" />
          <h1 class="text-2xl font-bold">Role Management</h1>
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
        <!-- Header Card -->
        <Card>
          <CardHeader>
            <CardTitle>All Roles</CardTitle>
            <CardDescription>
              Total: {{ roles.length }} role{{ roles.length !== 1 ? 's' : '' }}
            </CardDescription>
          </CardHeader>
        </Card>

        <!-- Roles Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card v-for="role in roles" :key="role.id" class="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-3">
                  <div class="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                    <Shield class="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <CardTitle class="text-lg">{{ role.name }}</CardTitle>
                    <p class="text-xs text-muted-foreground mt-0.5">{{ role.slug }}</p>
                  </div>
                </div>
                <span
                  v-if="role.isDefault"
                  class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                >
                  Default
                </span>
              </div>
            </CardHeader>
            <CardContent class="space-y-4">
              <p class="text-sm text-muted-foreground min-h-[40px]">
                {{ role.description || 'No description available' }}
              </p>

              <div class="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <div class="flex items-center gap-2 text-muted-foreground mb-1">
                    <Lock class="h-4 w-4" />
                    <span class="text-xs font-medium">Permissions</span>
                  </div>
                  <p class="text-2xl font-bold">{{ role.permissionCount }}</p>
                </div>
                <div>
                  <div class="flex items-center gap-2 text-muted-foreground mb-1">
                    <Users class="h-4 w-4" />
                    <span class="text-xs font-medium">Users</span>
                  </div>
                  <p class="text-2xl font-bold">{{ role.userCount }}</p>
                </div>
              </div>

              <div class="pt-2">
                <Link :href="`/admin/roles/${role.id}/edit`" class="w-full">
                  <Button variant="outline" class="w-full">
                    <Edit class="h-4 w-4 mr-2" />
                    Manage Permissions
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Empty State -->
        <Card v-if="roles.length === 0">
          <CardContent class="text-center py-12">
            <Shield class="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p class="text-lg font-medium">No roles found</p>
            <p class="text-sm text-muted-foreground">Create roles to organize permissions</p>
          </CardContent>
        </Card>
      </div>
    </main>
  </div>
</template>
