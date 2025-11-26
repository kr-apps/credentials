<script setup lang="ts">
import { useForm, usePage, router, Head } from '@inertiajs/vue3'
import { computed, ref } from 'vue'
import AuthLayout from '~/components/AuthLayout.vue'
import LoadingButton from '~/components/LoadingButton.vue'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { CheckCircle, Mail } from 'lucide-vue-next'
import { useAuth } from '~/composables/useAuth'

const { user } = useAuth()
const page = usePage()
const success = computed(() => page.props.success as string | undefined)

const resendCooldown = ref(0)
let cooldownInterval: ReturnType<typeof setInterval> | null = null

const form = useForm({})

const resendEmail = () => {
  if (resendCooldown.value > 0) return

  form.post('/email/resend', {
    preserveScroll: true,
    onSuccess: () => {
      // Start a 60-second cooldown
      resendCooldown.value = 60
      cooldownInterval = setInterval(() => {
        resendCooldown.value--
        if (resendCooldown.value <= 0 && cooldownInterval) {
          clearInterval(cooldownInterval)
        }
      }, 1000)
    },
  })
}

const logout = () => {
  router.post('/logout')
}
</script>

<template>
  <Head title="Verify Email" />

  <AuthLayout title="Verify your email" description="We've sent a verification link to your email">
    <div class="space-y-6">
      <!-- Success Message -->
      <Alert v-if="success" class="border-green-500 text-green-700 dark:text-green-400">
        <CheckCircle class="h-4 w-4" />
        <AlertDescription>
          {{ success }}
        </AlertDescription>
      </Alert>

      <!-- Email Info -->
      <div class="flex items-center justify-center">
        <div class="rounded-full bg-primary/10 p-3">
          <Mail class="h-8 w-8 text-primary" />
        </div>
      </div>

      <div class="text-center space-y-2">
        <p class="text-sm text-muted-foreground">We've sent a verification email to:</p>
        <p class="font-medium">{{ user?.email }}</p>
      </div>

      <div class="space-y-3">
        <p class="text-sm text-muted-foreground text-center">
          Click the link in the email to verify your account. If you don't see it, check your spam
          folder.
        </p>

        <!-- Resend Button -->
        <LoadingButton
          type="button"
          variant="outline"
          :loading="form.processing"
          :disabled="form.processing || resendCooldown > 0"
          @click="resendEmail"
          class="w-full"
        >
          {{ resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Verification Email' }}
        </LoadingButton>

        <!-- Logout Button -->
        <button
          type="button"
          @click="logout"
          class="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  </AuthLayout>
</template>
