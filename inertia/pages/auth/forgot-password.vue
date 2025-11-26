<script setup lang="ts">
import { Head, Link, useForm, usePage } from '@inertiajs/vue3'
import { computed } from 'vue'
import AuthLayout from '~/components/AuthLayout.vue'
import FormError from '~/components/FormError.vue'
import LoadingButton from '~/components/LoadingButton.vue'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { CheckCircle } from 'lucide-vue-next'

const page = usePage()
const success = computed(() => page.props.success as string | undefined)

const form = useForm({
  email: '',
})

const submit = () => {
  form.post('/forgot-password', {
    preserveScroll: true,
  })
}
</script>

<template>
  <Head title="Forgot Password?" />

  <AuthLayout
    title="Forgot password?"
    description="Enter your email and we'll send you a reset link"
  >
    <!-- Success Message -->
    <Alert v-if="success" class="mb-4 border-green-500 text-green-700 dark:text-green-400">
      <CheckCircle class="h-4 w-4" />
      <AlertDescription>
        {{ success }}
      </AlertDescription>
    </Alert>

    <form @submit.prevent="submit" class="space-y-4">
      <!-- Email -->
      <div class="space-y-2">
        <Label for="email">Email</Label>
        <Input
          id="email"
          v-model="form.email"
          type="email"
          placeholder="john@example.com"
          required
          autocomplete="email"
          autofocus
        />
        <FormError :message="form.errors.email" />
      </div>

      <!-- Submit Button -->
      <LoadingButton
        type="submit"
        :loading="form.processing"
        :disabled="form.processing"
        class="w-full"
      >
        Send Reset Link
      </LoadingButton>

      <!-- Back to Login Link -->
      <div class="text-center text-sm">
        <Link href="/login" class="font-medium text-primary hover:underline"> Back to login </Link>
      </div>
    </form>
  </AuthLayout>
</template>
