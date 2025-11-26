<script setup lang="ts">
import { Head, Link, useForm } from '@inertiajs/vue3'
import AuthLayout from '~/components/AuthLayout.vue'
import PasswordStrengthIndicator from '~/components/PasswordStrengthIndicator.vue'
import FormError from '~/components/FormError.vue'
import LoadingButton from '~/components/LoadingButton.vue'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

const props = defineProps<{
  token: string
}>()

const form = useForm({
  token: props.token,
  password: '',
  password_confirmation: '',
})

const submit = () => {
  form.post('/reset-password', {
    preserveScroll: true,
  })
}
</script>

<template>
  <Head title="Reset Password" />

  <AuthLayout title="Reset password" description="Enter your new password below">
    <form @submit.prevent="submit" class="space-y-4">
      <!-- Password -->
      <div class="space-y-2">
        <Label for="password">New Password</Label>
        <Input
          id="password"
          v-model="form.password"
          type="password"
          required
          autocomplete="new-password"
          autofocus
        />
        <PasswordStrengthIndicator :password="form.password" />
        <FormError :message="form.errors.password" />
      </div>

      <!-- Confirm Password -->
      <div class="space-y-2">
        <Label for="password_confirmation">Confirm Password</Label>
        <Input
          id="password_confirmation"
          v-model="form.password_confirmation"
          type="password"
          required
          autocomplete="new-password"
        />
        <FormError :message="form.errors.password_confirmation" />
      </div>

      <!-- Submit Button -->
      <LoadingButton
        type="submit"
        :loading="form.processing"
        :disabled="form.processing"
        class="w-full"
      >
        Reset Password
      </LoadingButton>

      <!-- Back to Login Link -->
      <div class="text-center text-sm">
        <Link href="/login" class="font-medium text-primary hover:underline"> Back to login </Link>
      </div>
    </form>
  </AuthLayout>
</template>
