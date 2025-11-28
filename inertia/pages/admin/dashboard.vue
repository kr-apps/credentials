<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { useAuthorization } from '~/composables/useAuthorization'
import { Users, Shield, LayoutDashboard, Settings } from 'lucide-vue-next'

const { user, isAdmin } = useAuthorization()
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900"
  >
    <!-- Header -->
    <header class="border-b bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
      <div class="container mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <LayoutDashboard class="h-6 w-6" />
          <h1 class="text-2xl font-bold">Admin Dashboard</h1>
        </div>
        <Link href="/">
          <Button variant="outline"> Back to Home </Button>
        </Link>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <div class="max-w-6xl mx-auto space-y-6">
        <!-- Welcome Message -->
        <Card>
          <CardHeader>
            <CardTitle class="text-3xl"
              >Welcome{{ user?.fullName ? ', ' + user.fullName : '' }}!</CardTitle
            >
            <CardDescription> Admin control panel for user and role management </CardDescription>
          </CardHeader>
        </Card>

        <!-- Quick Actions Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- User Management Card -->
          <Card class="hover:shadow-lg transition-shadow cursor-pointer group">
            <Link href="/admin/users">
              <CardHeader>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div
                      class="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/30 transition-colors"
                    >
                      <Users class="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle>User Management</CardTitle>
                      <CardDescription>Manage users and assign roles</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p class="text-sm text-muted-foreground">
                  View all users, edit their details, and assign roles to control access
                  permissions.
                </p>
              </CardContent>
            </Link>
          </Card>

          <!-- Role Management Card -->
          <Card class="hover:shadow-lg transition-shadow cursor-pointer group">
            <Link href="/admin/roles">
              <CardHeader>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div
                      class="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/30 transition-colors"
                    >
                      <Shield class="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <CardTitle>Role Management</CardTitle>
                      <CardDescription>Configure roles and permissions</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p class="text-sm text-muted-foreground">
                  Define roles and assign permissions to control what users can do in the system.
                </p>
              </CardContent>
            </Link>
          </Card>
        </div>

        <!-- System Information -->
        <Card>
          <CardHeader>
            <div class="flex items-center gap-2">
              <Settings class="h-5 w-5" />
              <CardTitle>System Information</CardTitle>
            </div>
            <CardDescription>Current authentication and authorization status</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              <div class="flex items-center justify-between py-2 border-b">
                <span class="text-sm font-medium">Your Email</span>
                <span class="text-sm text-muted-foreground">{{ user?.email }}</span>
              </div>
              <div class="flex items-center justify-between py-2 border-b">
                <span class="text-sm font-medium">Your Roles</span>
                <div class="flex gap-2">
                  <span
                    v-for="role in user?.roles"
                    :key="role.id"
                    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary"
                  >
                    {{ role.name }}
                  </span>
                </div>
              </div>
              <div class="flex items-center justify-between py-2">
                <span class="text-sm font-medium">Admin Access</span>
                <span
                  class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  :class="
                    isAdmin
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  "
                >
                  {{ isAdmin ? 'Granted' : 'Denied' }}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  </div>
</template>
