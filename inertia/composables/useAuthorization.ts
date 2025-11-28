import { computed } from 'vue'
import { usePage } from '@inertiajs/vue3'

export interface AuthUser {
  id: number
  email: string
  fullName: string | null
  emailVerifiedAt: string | null
  createdAt: string
  roles: Array<{ id: number; name: string; slug: string }>
  permissions: string[]
}

/**
 * Composable for checking user authorization (roles and permissions)
 *
 * Usage:
 * const { can, hasRole, isAdmin } = useAuthorization()
 * if (can('users:view')) { ... }
 * if (hasRole('admin')) { ... }
 */
export function useAuthorization() {
  const page = usePage()

  const user = computed(() => page.props.user as AuthUser | null)

  /**
   * Check if the user has a specific permission
   */
  const can = (permission: string): boolean => {
    if (!user.value) return false
    return user.value.permissions.includes(permission)
  }

  /**
   * Check if the user has any of the specified permissions
   */
  const canAny = (permissions: string[]): boolean => {
    if (!user.value) return false
    return permissions.some((permission) => user.value!.permissions.includes(permission))
  }

  /**
   * Check if the user has all the specified permissions
   */
  const canAll = (permissions: string[]): boolean => {
    if (!user.value) return false
    return permissions.every((permission) => user.value!.permissions.includes(permission))
  }

  /**
   * Check if the user has a specific role
   */
  const hasRole = (roleSlug: string): boolean => {
    if (!user.value) return false
    return user.value.roles.some((role) => role.slug === roleSlug)
  }

  /**
   * Check if the user has any of the specified roles
   */
  const hasAnyRole = (roleSlugs: string[]): boolean => {
    if (!user.value) return false
    return roleSlugs.some((slug) => user.value!.roles.some((role) => role.slug === slug))
  }

  /**
   * Computed properties for common role checks
   */
  const isAdmin = computed(() => hasRole('admin'))
  const isHolder = computed(() => hasRole('holder'))
  const isIssuer = computed(() => hasRole('issuer'))

  return {
    user,
    can,
    canAny,
    canAll,
    hasRole,
    hasAnyRole,
    isAdmin,
    isHolder,
    isIssuer,
  }
}
