import { computed } from 'vue'
import { usePage } from '@inertiajs/vue3'

export function useAuth() {
  const page = usePage()

  const user = computed(() => page.props.user as any)
  const isAuthenticated = computed(() => !!user.value)
  const isGuest = computed(() => !user.value)

  return {
    user,
    isAuthenticated,
    isGuest,
  }
}
