<script setup lang="ts">
import { router } from '@inertiajs/vue3'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { useAuth } from '~/composables/useAuth'
import { CheckCircle2, User, Mail, Calendar } from 'lucide-vue-next'

const { user } = useAuth()

const logout = () => {
  router.post('/logout')
}
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900"
  >
    <!-- Header -->
    <header class="border-b bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
      <div class="container mx-auto px-4 py-4 flex items-center justify-between">
        <h1 class="text-2xl font-bold">Dashboard</h1>
        <Button variant="outline" @click="logout"> Logout </Button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto space-y-6">
        <!-- Welcome Message -->
        <Card>
          <CardHeader>
            <CardTitle class="text-3xl"
              >Welcome{{ user?.fullName ? ', ' + user.fullName : '' }}!</CardTitle
            >
            <CardDescription> You've successfully logged in to your account </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex items-center gap-3 text-sm">
              <div class="flex items-center gap-2">
                <CheckCircle2 class="h-5 w-5 text-green-600" />
                <span class="font-medium">Email Verified</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- User Info Card -->
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div v-if="user?.fullName" class="flex items-center gap-3">
              <User class="h-5 w-5 text-muted-foreground" />
              <div>
                <p class="text-sm font-medium">Full Name</p>
                <p class="text-sm text-muted-foreground">{{ user.fullName }}</p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <Mail class="h-5 w-5 text-muted-foreground" />
              <div>
                <p class="text-sm font-medium">Email</p>
                <p class="text-sm text-muted-foreground">{{ user?.email }}</p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <Calendar class="h-5 w-5 text-muted-foreground" />
              <div>
                <p class="text-sm font-medium">Member Since</p>
                <p class="text-sm text-muted-foreground">
                  {{
                    new Date(user?.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Security Features Info -->
        <Card>
          <CardHeader>
            <CardTitle>Security Features</CardTitle>
            <CardDescription
              >Your account is protected with these security features</CardDescription
            >
          </CardHeader>
          <CardContent>
            <ul class="space-y-2 text-sm">
              <li class="flex items-center gap-2">
                <CheckCircle2 class="h-4 w-4 text-green-600" />
                <span>Email verification required</span>
              </li>
              <li class="flex items-center gap-2">
                <CheckCircle2 class="h-4 w-4 text-green-600" />
                <span>Password strength enforcement</span>
              </li>
              <li class="flex items-center gap-2">
                <CheckCircle2 class="h-4 w-4 text-green-600" />
                <span>Rate limiting protection</span>
              </li>
              <li class="flex items-center gap-2">
                <CheckCircle2 class="h-4 w-4 text-green-600" />
                <span>Account lockout after failed attempts</span>
              </li>
              <li class="flex items-center gap-2">
                <CheckCircle2 class="h-4 w-4 text-green-600" />
                <span>Remember me functionality</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </main>
  </div>
</template>
