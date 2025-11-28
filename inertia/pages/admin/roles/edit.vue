<script setup lang="ts">
import { computed } from 'vue'
import { Link, usePage, useForm } from '@inertiajs/vue3'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { Label } from '~/components/ui/label'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Separator } from '~/components/ui/separator'
import { Shield, CheckCircle2, AlertCircle, ArrowLeft, Save, Lock } from 'lucide-vue-next'

interface Permission {
  id: number
  name: string
  slug: string
  description: string | null
  action: string
}

interface RoleData {
  id: number
  name: string
  slug: string
  description: string | null
  isDefault: boolean
  permissions: number[]
}

interface Props {
  role: RoleData
  groupedPermissions: Record<string, Permission[]>
}

const props = defineProps<Props>()
const page = usePage()

const form = useForm({
  permissionIds: [...props.role.permissions],
})

const resources = computed(() => Object.keys(props.groupedPermissions).sort())

const isPermissionSelected = (permissionId: number) => {
  return form.permissionIds.includes(permissionId)
}

const togglePermission = (permissionId: number, checked: boolean | 'indeterminate') => {
  if (checked === true) {
    if (!form.permissionIds.includes(permissionId)) {
      form.permissionIds.push(permissionId)
    }
  } else if (checked === false) {
    const index = form.permissionIds.indexOf(permissionId)
    if (index > -1) {
      form.permissionIds.splice(index, 1)
    }
  }
}

const isResourceFullySelected = (resource: string) => {
  const permissions = props.groupedPermissions[resource]
  return permissions.every((p) => isPermissionSelected(p.id))
}

const isResourcePartiallySelected = (resource: string) => {
  const permissions = props.groupedPermissions[resource]
  const selectedCount = permissions.filter((p) => isPermissionSelected(p.id)).length
  return selectedCount > 0 && selectedCount < permissions.length
}

const toggleResource = (resource: string, checked: boolean | 'indeterminate') => {
  const permissions = props.groupedPermissions[resource]

  if (checked === true) {
    // Select all permissions in this resource
    permissions.forEach((permission) => {
      if (!isPermissionSelected(permission.id)) {
        form.permissionIds.push(permission.id)
      }
    })
  } else if (checked === false) {
    // Deselect all permissions in this resource
    permissions.forEach((permission) => {
      const index = form.permissionIds.indexOf(permission.id)
      if (index > -1) {
        form.permissionIds.splice(index, 1)
      }
    })
  }
}

const savePermissions = () => {
  form.put(`/admin/roles/${props.role.id}/permissions`, {
    preserveScroll: true,
    preserveState: true,
  })
}

const getActionColor = (action: string) => {
  const colors: Record<string, string> = {
    view: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    create: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    update: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    delete: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    manage: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  }
  return colors[action] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
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
          <Shield class="h-6 w-6" />
          <h1 class="text-2xl font-bold">Edit Role</h1>
        </div>
        <Link href="/admin/roles">
          <Button variant="outline">
            <ArrowLeft class="h-4 w-4 mr-2" />
            Back to Roles
          </Button>
        </Link>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <div class="max-w-5xl mx-auto space-y-6">
        <!-- Flash Messages -->
        <Alert v-if="page.props.flash?.success" class="bg-green-50 border-green-200">
          <CheckCircle2 class="h-4 w-4 text-green-600" />
          <AlertDescription class="text-green-800">
            {{ page.props.success }}
          </AlertDescription>
        </Alert>

        <Alert v-if="page.props.flash?.error" class="bg-red-50 border-red-200">
          <AlertCircle class="h-4 w-4 text-red-600" />
          <AlertDescription class="text-red-800">
            {{ page.props.flash.error }}
          </AlertDescription>
        </Alert>

        <!-- Role Information -->
        <Card>
          <CardHeader>
            <div class="flex items-start justify-between">
              <div>
                <CardTitle class="text-2xl">{{ role.name }}</CardTitle>
                <CardDescription class="mt-1">{{ role.slug }}</CardDescription>
              </div>
              <span
                v-if="role.isDefault"
                class="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
              >
                Default Role
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p class="text-sm text-muted-foreground">
              {{ role.description || 'No description available' }}
            </p>
          </CardContent>
        </Card>

        <!-- Permission Assignment -->
        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Lock class="h-5 w-5" />
                <div>
                  <CardTitle>Assign Permissions</CardTitle>
                  <CardDescription>
                    Select permissions for this role ({{ form.permissionIds.length }} selected)
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form @submit.prevent="savePermissions">
              <div class="space-y-6">
                <div v-for="resource in resources" :key="resource" class="border rounded-lg p-4">
                  <!-- Resource Header -->
                  <div class="flex items-center space-x-3 mb-4">
                    <Checkbox
                      :id="`resource-${resource}`"
                      :model-value="isResourceFullySelected(resource)"
                      @update:modelValue="(checked) => toggleResource(resource, checked)"
                    />
                    <Label
                      :for="`resource-${resource}`"
                      class="text-base font-semibold cursor-pointer capitalize"
                    >
                      {{ resource }}
                    </Label>
                    <span class="text-xs text-muted-foreground">
                      ({{ groupedPermissions[resource].length }} permission{{
                        groupedPermissions[resource].length !== 1 ? 's' : ''
                      }})
                    </span>
                  </div>

                  <!-- Permissions Grid -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3 ml-7">
                    <div
                      v-for="permission in groupedPermissions[resource]"
                      :key="permission.id"
                      class="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        :id="`permission-${permission.id}`"
                        :model-value="isPermissionSelected(permission.id)"
                        @update:modelValue="(checked) => togglePermission(permission.id, checked)"
                      />
                      <div class="flex-1">
                        <div class="flex items-center gap-2">
                          <Label
                            :for="`permission-${permission.id}`"
                            class="text-sm font-medium cursor-pointer"
                          >
                            {{ permission.name }}
                          </Label>
                          <span
                            class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
                            :class="getActionColor(permission.action)"
                          >
                            {{ permission.action }}
                          </span>
                        </div>
                        <p class="text-xs text-muted-foreground mt-1">
                          {{ permission.description || permission.slug }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator class="my-6" />

              <div class="flex items-center justify-between">
                <p class="text-sm text-muted-foreground">
                  {{ form.permissionIds.length }} permission{{
                    form.permissionIds.length !== 1 ? 's' : ''
                  }}
                  selected
                </p>
                <Button type="submit" :disabled="form.processing">
                  <Save class="h-4 w-4 mr-2" />
                  {{ form.processing ? 'Saving...' : 'Save Permissions' }}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <!-- Summary -->
        <Card v-if="form.permissionIds.length > 0">
          <CardHeader>
            <CardTitle>Permission Summary</CardTitle>
            <CardDescription>Quick view of all selected permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              <template v-for="resource in resources" :key="`summary-${resource}`">
                <div
                  v-for="permission in groupedPermissions[resource]"
                  :key="`summary-${permission.id}`"
                  v-show="isPermissionSelected(permission.id)"
                  class="flex items-center gap-2 text-xs p-2 rounded bg-muted/50"
                >
                  <CheckCircle2 class="h-3 w-3 text-green-600 flex-shrink-0" />
                  <span class="truncate">{{ permission.slug }}</span>
                </div>
              </template>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  </div>
</template>
