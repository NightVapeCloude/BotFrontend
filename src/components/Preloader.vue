<template>
  <Transition name="preloader-fade">
    <div v-if="isVisible" class="fixed inset-0 z-[9999] bg-surface flex items-center justify-center">
      <div class="flex flex-col items-center gap-5 animate-fade-in">
        <div class="relative w-16 h-16">
          <div class="absolute inset-0 rounded-full border-4 border-surface-border" />
          <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-accent animate-spin" />
        </div>
        <div class="text-center">
          <h2 class="font-display text-lg font-bold text-ink-900">Загрузка...</h2>
          <p class="text-sm text-ink-700 mt-1">Пожалуйста, подождите</p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  visible?: boolean
}

const props = defineProps<Props>()
const isVisible = computed(() => props.visible ?? true)
</script>

<style scoped>
.preloader-fade-enter-active,
.preloader-fade-leave-active {
  transition: opacity 0.4s ease;
}
.preloader-fade-enter-from,
.preloader-fade-leave-to {
  opacity: 0;
}
</style>
