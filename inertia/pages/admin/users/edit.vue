<script setup lang="ts">
import { Link, usePage, useForm } from '@inertiajs/vue3'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { Label } from '~/components/ui/label'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Separator } from '~/components/ui/separator'
import {
  User,
  Mail,
  Calendar,
  Shield,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Save,
} from 'lucide-vue-next'

interface Role {
  id: number
  name: string
  slug: string
  description: string | null
  permissionCount: number
}

interface UserData {
  id: number
  email: string
  fullName: string | null
  emailVerifiedAt: string | null
  createdAt: string
  isLocked: boolean
  roles: number[]
  roleDetails: Array<{ id: number; name: string; slug: string }>
  permissions: string[]
}

interface Props {
  user: UserData
  allRoles: Role[]
}

const props = defineProps<Props>()
const page = usePage()

const form = useForm({
  roleIds: [...props.user.roles],
})

const isRoleSelected = (roleId: number) => {
  return form.roleIds.includes(roleId)
}

const toggleRole = (roleId: number, checked: boolean | 'indeterminate') => {
  if (checked === true) {
    if (!form.roleIds.includes(roleId)) {
      form.roleIds.push(roleId)
    }
  } else if (checked === false) {
    const index = form.roleIds.indexOf(roleId)
    if (index > -1) {
      form.roleIds.splice(index, 1)
    }
  }
}

const saveRoles = () => {
  form.post(`/admin/users/${props.user.id}/roles`, {
    preserveScroll: true,
    preserveState: true,
  })
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Never'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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
          <User class="h-6 w-6" />
          <h1 class="text-2xl font-bold">Edit User</h1>
        </div>
        <Link href="/admin/users">
          <Button variant="outline">
            <ArrowLeft class="h-4 w-4 mr-2" />
            Back to Users
          </Button>
        </Link>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto space-y-6">
        <!-- Flash Messages -->
        <Alert v-if="page.props.flash?.success" class="bg-green-50 border-green-200">
          <CheckCircle2 class="h-4 w-4 text-green-600" />
          <AlertDescription class="text-green-800">
            {{ page.props.flash.success }}
          </AlertDescription>
        </Alert>

        <Alert v-if="page.props.flash?.error" class="bg-red-50 border-red-200">
          <AlertCircle class="h-4 w-4 text-red-600" />
          <AlertDescription class="text-red-800">
            {{ page.props.flash.error }}
          </AlertDescription>
        </Alert>

        <!-- User Information -->
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Basic details about this user</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex items-center gap-3">
              <User class="h-5 w-5 text-muted-foreground" />
              <div>
                <p class="text-sm font-medium">Full Name</p>
                <p class="text-sm text-muted-foreground">{{ user.fullName || 'N/A' }}</p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <Mail class="h-5 w-5 text-muted-foreground" />
              <div>
                <p class="text-sm font-medium">Email</p>
                <p class="text-sm text-muted-foreground">{{ user.email }}</p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <Calendar class="h-5 w-5 text-muted-foreground" />
              <div>
                <p class="text-sm font-medium">Email Verified</p>
                <p class="text-sm text-muted-foreground">
                  {{ formatDate(user.emailVerifiedAt) }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <Calendar class="h-5 w-5 text-muted-foreground" />
              <div>
                <p class="text-sm font-medium">Member Since</p>
                <p class="text-sm text-muted-foreground">{{ formatDate(user.createdAt) }}</p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <div>
                <p class="text-sm font-medium">Account Status</p>
                <span
                  class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold mt-1"
                  :class="
                    user.isLocked
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  "
                >
                  {{ user.isLocked ? 'Locked' : 'Active' }}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Current Roles -->
        <Card v-if="user.roleDetails.length > 0">
          <CardHeader>
            <CardTitle>Current Roles</CardTitle>
            <CardDescription>Roles currently assigned to this user</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="role in user.roleDetails"
                :key="role.id"
                class="inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold bg-primary/10 text-primary"
              >
                {{ role.name }}
              </span>
            </div>
          </CardContent>
        </Card>

        <!-- Role Assignment -->
        <Card>
          <CardHeader>
            <div class="flex items-center gap-2">
              <Shield class="h-5 w-5" />
              <CardTitle>Assign Roles</CardTitle>
            </div>
            <CardDescription>Select roles to grant permissions to this user</CardDescription>
          </CardHeader>
          <CardContent>
            <form @submit.prevent="saveRoles">
              <div class="space-y-4">
                <div
                  v-for="role in allRoles"
                  :key="role.id"
                  class="flex items-start space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    :id="`role-${role.id}`"
                    :model-value="isRoleSelected(role.id)"
                    @update:modelValue="(checked) => toggleRole(role.id, checked)"
                  />
                  <div class="flex-1">
                    <Label
                      :for="`role-${role.id}`"
                      class="text-sm font-medium leading-none cursor-pointer"
                    >
                      {{ role.name }}
                      <span class="text-muted-foreground ml-2">({{ role.slug }})</span>
                    </Label>
                    <p class="text-sm text-muted-foreground mt-1">
                      {{ role.description || 'No description available' }}
                    </p>
                    <p class="text-xs text-muted-foreground mt-1">
                      {{ role.permissionCount }} permission{{
                        role.permissionCount !== 1 ? 's' : ''
                      }}
                    </p>
                  </div>
                </div>
              </div>

              <Separator class="my-6" />

              <div class="flex justify-end">
                <Button type="submit" :disabled="form.processing">
                  <Save class="h-4 w-4 mr-2" />
                  {{ form.processing ? 'Saving...' : 'Save Roles' }}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <!-- Effective Permissions -->
        <Card v-if="user.permissions.length > 0">
          <CardHeader>
            <CardTitle>Effective Permissions</CardTitle>
            <CardDescription>
              All permissions this user has through their assigned roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              <div
                v-for="permission in user.permissions"
                :key="permission"
                class="flex items-center gap-2 text-sm p-2 rounded bg-muted/50"
              >
                <CheckCircle2 class="h-4 w-4 text-green-600" />
                <span>{{ permission }}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  </div>
</template>
