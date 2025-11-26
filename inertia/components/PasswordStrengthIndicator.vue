<script setup lang="ts">
import { computed } from 'vue'
import { Check, X } from 'lucide-vue-next'
import { cn } from '~/lib/utils'

const props = defineProps<{
  password: string
}>()

const requirements = computed(() => {
  const pwd = props.password
  return {
    minLength: pwd.length >= 8,
    hasLowercase: /[a-z]/.test(pwd),
    hasUppercase: /[A-Z]/.test(pwd),
    hasNumber: /\d/.test(pwd),
    hasSpecial: /[@$!%*?&]/.test(pwd),
  }
})

const strength = computed(() => {
  const passed = Object.values(requirements.value).filter(Boolean).length
  if (passed === 0) return { label: '', color: '', width: '0%' }
  if (passed <= 2) return { label: 'Weak', color: 'bg-red-500', width: '33%' }
  if (passed <= 4) return { label: 'Medium', color: 'bg-yellow-500', width: '66%' }
  return { label: 'Strong', color: 'bg-green-500', width: '100%' }
})
</script>

<template>
  <div v-if="password" class="space-y-3 mt-2">
    <!-- Strength bar -->
    <div class="space-y-1">
      <div class="flex justify-between items-center text-sm">
        <span class="text-muted-foreground">Password strength:</span>
        <span
          :class="
            cn(
              'font-medium',
              strength.label === 'Weak' && 'text-red-600',
              strength.label === 'Medium' && 'text-yellow-600',
              strength.label === 'Strong' && 'text-green-600'
            )
          "
        >
          {{ strength.label }}
        </span>
      </div>
      <div class="h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
        <div
          class="h-full transition-all duration-300"
          :class="strength.color"
          :style="{ width: strength.width }"
        />
      </div>
    </div>

    <!-- Requirements checklist -->
    <div class="space-y-2 text-sm">
      <div
        :class="
          cn(
            'flex items-center gap-2',
            requirements.minLength ? 'text-green-600' : 'text-muted-foreground'
          )
        "
      >
        <Check v-if="requirements.minLength" class="h-4 w-4" />
        <X v-else class="h-4 w-4" />
        <span>At least 8 characters</span>
      </div>
      <div
        :class="
          cn(
            'flex items-center gap-2',
            requirements.hasLowercase ? 'text-green-600' : 'text-muted-foreground'
          )
        "
      >
        <Check v-if="requirements.hasLowercase" class="h-4 w-4" />
        <X v-else class="h-4 w-4" />
        <span>One lowercase letter</span>
      </div>
      <div
        :class="
          cn(
            'flex items-center gap-2',
            requirements.hasUppercase ? 'text-green-600' : 'text-muted-foreground'
          )
        "
      >
        <Check v-if="requirements.hasUppercase" class="h-4 w-4" />
        <X v-else class="h-4 w-4" />
        <span>One uppercase letter</span>
      </div>
      <div
        :class="
          cn(
            'flex items-center gap-2',
            requirements.hasNumber ? 'text-green-600' : 'text-muted-foreground'
          )
        "
      >
        <Check v-if="requirements.hasNumber" class="h-4 w-4" />
        <X v-else class="h-4 w-4" />
        <span>One number</span>
      </div>
      <div
        :class="
          cn(
            'flex items-center gap-2',
            requirements.hasSpecial ? 'text-green-600' : 'text-muted-foreground'
          )
        "
      >
        <Check v-if="requirements.hasSpecial" class="h-4 w-4" />
        <X v-else class="h-4 w-4" />
        <span>One special character (@$!%*?&)</span>
      </div>
    </div>
  </div>
</template>
