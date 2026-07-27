<template>
  <RouterLink :to="`/catalog/${product.id}`"
    class="flex-shrink-0 w-32 card flex flex-col overflow-hidden active:scale-95 transition-transform duration-150">
    <div class="aspect-square bg-surface-muted overflow-hidden relative">
      <img v-if="product.image_url" :src="product.image_url" :alt="product.name"
        class="w-full h-full object-cover" loading="lazy" />
      <div v-else class="w-full h-full flex items-center justify-center text-ink-300">
        <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
        </svg>
      </div>
      <!-- Нет в наличии -->
      <div v-if="product.stock === 0"
        class="absolute inset-0 bg-surface/70 flex items-center justify-center">
        <span class="text-[10px] font-semibold text-red-400 bg-red-500/20 px-2 py-0.5 rounded-full">Нет</span>
      </div>
      <!-- Последний остаток -->
      <div v-else-if="product.stock <= 3"
        class="absolute top-1.5 right-1.5 bg-amber-500/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
        {{ product.stock }} шт
      </div>
    </div>
    <div class="p-2 flex flex-col gap-1.5">
      <p class="text-xs font-semibold text-ink-800 leading-tight line-clamp-2 min-h-[2.5rem]">{{ product.name }}</p>
      <button v-if="canAdd"
        class="w-full h-7 rounded-lg bg-indigo-500/20 hover:bg-indigo-500 text-indigo-400 hover:text-white transition-all duration-150 flex items-center justify-center active:scale-90"
        :class="{ 'opacity-50 pointer-events-none': inCartQty >= product.stock }"
        @click.prevent="onAdd">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </button>
      <div v-else class="w-full h-7 rounded-lg bg-surface-muted flex items-center justify-center">
        <span class="text-[10px] text-ink-400">Нет в наличии</span>
      </div>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useCatalogStore } from '@/stores/catalog'
import { useTelegram } from '@/composables/useTelegram'
import type { Product } from '@/types'

const props = defineProps<{ product: Product; price: number }>()
const cart = useCartStore()
const catalog = useCatalogStore()
const { haptic } = useTelegram()

const inCartQty = computed(() =>
  cart.items.find(i => i.product.id === props.product.id)?.quantity ?? 0
)
const canAdd = computed(() => props.product.stock > 0)

function onAdd() {
  if (inCartQty.value >= props.product.stock) return
  haptic('medium')
  cart.add(props.product, props.price)
}
</script>
