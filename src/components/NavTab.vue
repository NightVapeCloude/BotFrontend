<template>
  <RouterLink :to="to"
    class="flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors duration-150 relative"
    :class="isActive ? 'text-brand-400' : 'text-ink-700 hover:text-ink-700'"
    @click="haptic('light')"
  >
    <div class="relative">
      <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        :stroke-width="isActive ? 2 : 1.5" stroke-linecap="round" stroke-linejoin="round">
        <path v-for="(d, i) in iconPaths" :key="i" :d="d" />
      </svg>
      <span v-if="badge"
        class="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pop">
        {{ badge > 99 ? '99+' : badge }}
      </span>
    </div>
    <span class="text-[10px] font-semibold font-body leading-none">{{ label }}</span>
    <div v-if="isActive" class="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-brand-400 rounded-b-full" />
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTelegram } from '@/composables/useTelegram'

const props = defineProps<{
  to: string
  icon: string
  label: string
  badge?: number
}>()

const route = useRoute()
const { haptic } = useTelegram()

const isActive = computed(() =>
  props.to === '/' ? route.path === '/' : route.path.startsWith(props.to)
)

const icons: Record<string, string[]> = {
  home:  ['M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z', 'M9 22V12h6v10'],
  grid:  ['M3 3h7v7H3z', 'M14 3h7v7h-7z', 'M14 14h7v7h-7z', 'M3 14h7v7H3z'],
  cart:  ['M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z', 'M3 6h18', 'M16 10a4 4 0 01-8 0'],
  user:  ['M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2', 'M12 3a4 4 0 100 8 4 4 0 000-8z'],
  phone: ['M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.07 9.81 19.79 19.79 0 011 1.18 2 2 0 013 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z'],
  shield:['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'],
}

const iconPaths = computed(() => icons[props.icon] ?? icons['home'])
</script>
