<script setup lang="ts">
import { Alert, AlertDescription } from '~/components/ui/alert'
import { AlertCircle } from 'lucide-vue-next'

defineProps<{
  message?: string
}>()
</script>

<template>
  <Alert v-if="message" variant="destructive" class="mt-2">
    <AlertCircle class="h-4 w-4" />
    <AlertDescription>
      {{ message }}
    </AlertDescription>
  </Alert>
</template>
