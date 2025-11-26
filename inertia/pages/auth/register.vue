<script setup lang="ts">
import { Head, Link, useForm } from '@inertiajs/vue3'
import AuthLayout from '~/components/AuthLayout.vue'
import PasswordStrengthIndicator from '~/components/PasswordStrengthIndicator.vue'
import FormError from '~/components/FormError.vue'
import LoadingButton from '~/components/LoadingButton.vue'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

const form = useForm({
  fullName: '',
  email: '',
  password: '',
  password_confirmation: '',
})

const submit = () => {
  form.post('/register', {
    preserveScroll: true,
  })
}
</script>

<template>
  <Head title="Register" />

  <AuthLayout title="Create an account" description="Enter your information to create your account">
    <form @submit.prevent="submit" class="space-y-4">
      <!-- Full Name -->
      <div class="space-y-2">
        <Label for="fullName">Full Name (optional)</Label>
        <Input
          id="fullName"
          v-model="form.fullName"
          type="text"
          placeholder="John Doe"
          autocomplete="name"
        />
        <FormError :message="form.errors.fullName" />
      </div>

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
        />
        <FormError :message="form.errors.email" />
      </div>

      <!-- Password -->
      <div class="space-y-2">
        <Label for="password">Password</Label>
        <Input
          id="password"
          v-model="form.password"
          type="password"
          required
          autocomplete="new-password"
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
        Create Account
      </LoadingButton>

      <!-- Login Link -->
      <div class="text-center text-sm">
        <span class="text-muted-foreground">Already have an account?</span>
        <Link href="/login" class="ml-1 font-medium text-primary hover:underline"> Sign in </Link>
      </div>
    </form>
  </AuthLayout>
</template>
