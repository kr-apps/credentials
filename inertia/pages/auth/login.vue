<script setup lang="ts">
import { Head, Link, useForm } from '@inertiajs/vue3'
import AuthLayout from '~/components/AuthLayout.vue'
import FormError from '~/components/FormError.vue'
import LoadingButton from '~/components/LoadingButton.vue'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Checkbox } from '~/components/ui/checkbox'

const form = useForm({
  email: '',
  password: '',
  remember: false,
})

const submit = () => {
  form.post('/login', {
    preserveScroll: true,
  })
}
</script>

<template>
  <Head title="Login" />

  <AuthLayout title="Welcome back" description="Sign in to your account to continue">
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

      <!-- Password -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <Label for="password">Password</Label>
          <Link href="/forgot-password" class="text-sm font-medium text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          v-model="form.password"
          type="password"
          required
          autocomplete="current-password"
        />
        <FormError :message="form.errors.password" />
      </div>

      <!-- Remember Me -->
      <div class="flex items-center space-x-2">
        <Checkbox id="remember" :checked="form.remember" @update:checked="form.remember = $event" />
        <Label for="remember" class="text-sm font-normal cursor-pointer"> Remember me </Label>
      </div>

      <!-- Submit Button -->
      <LoadingButton
        type="submit"
        :loading="form.processing"
        :disabled="form.processing"
        class="w-full"
      >
        Sign In
      </LoadingButton>

      <!-- Register Link -->
      <div class="text-center text-sm">
        <span class="text-muted-foreground">Don't have an account?</span>
        <Link href="/register" class="ml-1 font-medium text-primary hover:underline">
          Create one
        </Link>
      </div>
    </form>
  </AuthLayout>
</template>
