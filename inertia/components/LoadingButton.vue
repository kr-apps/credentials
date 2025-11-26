<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { Loader2 } from 'lucide-vue-next'

defineProps<{
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  class?: string
}>()
</script>

<template>
  <Button
    :type="type || 'button'"
    :disabled="loading || disabled"
    :variant="variant"
    :size="size"
    :class="class"
  >
    <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
    <slot />
  </Button>
</template>
