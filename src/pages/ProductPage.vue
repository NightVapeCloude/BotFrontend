<template>
  <div class="animate-fade-in">
    <div class="px-4 pt-4 pb-2">
      <button class="inline-flex items-center gap-1.5 text-ink-600 hover:text-ink-900 text-sm transition-colors"
        @click="$router.back()">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Назад
      </button>
    </div>

    <div v-if="loading" class="p-4 space-y-4">
      <SkeletonBox height="300px" width="100%" />
      <SkeletonBox height="24px" width="70%" />
      <SkeletonBox height="40px" width="100%" />
    </div>

    <template v-else-if="product">
      <div class="aspect-video bg-surface-muted overflow-hidden">
        <img v-if="product.image_url" :src="product.image_url" :alt="product.name"
          class="w-full h-full object-cover" />
        <div v-else class="w-full h-full flex items-center justify-center text-ink-300">
          <svg class="w-20 h-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8">
            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
          </svg>
        </div>
      </div>

      <div class="p-4 space-y-4">
        <div>
          <div class="flex items-start justify-between gap-3">
            <h1 class="font-display text-lg font-bold text-ink-900 leading-snug flex-1">{{ product.name }}</h1>
            <div v-if="ssub" class="flex items-center gap-1 flex-shrink-0">
              <span class="font-display text-indigo-400 font-bold text-xl">{{ formatPrice(ssub.price) }}</span>
              <BynIcon :size="16" class="text-indigo-400" />
            </div>
          </div>
          <div class="flex items-center gap-2 mt-2 flex-wrap">
            <span v-if="ssub?.strength" class="badge bg-violet-500/15 text-violet-300">{{ ssub.strength }}</span>
            <span v-if="ssub" class="badge bg-surface-muted text-ink-600">{{ ssub.name }}</span>
            <span v-if="product.stock > 0" class="badge bg-indigo-500/15 text-indigo-400">В наличии</span>
            <span v-else class="badge bg-red-500/15 text-red-400">Нет в наличии</span>
            <span v-if="product.stock > 0 && product.stock <= 5"
              class="badge bg-amber-500/15 text-amber-400">Осталось {{ product.stock }} шт</span>
          </div>
        </div>

        <div v-if="product.stock > 0">
          <div v-if="inCart" class="flex items-center gap-3">
            <div class="flex items-center gap-3 card p-1 flex-1">
              <button class="w-9 h-9 rounded-xl bg-surface-muted flex items-center justify-center active:scale-90 transition-transform"
                @click="dec">
                <svg class="w-4 h-4 text-ink-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/></svg>
              </button>
              <span class="flex-1 text-center font-display font-bold text-ink-900">{{ inCart.quantity }}</span>
              <button
                class="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center active:scale-90 transition-transform"
                :class="{ 'opacity-40 pointer-events-none': inCart.quantity >= product.stock }"
                @click="inc">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
              </button>
            </div>
            <RouterLink to="/cart" class="btn-primary flex-shrink-0">В корзину</RouterLink>
          </div>
          <button v-else class="btn-primary w-full" @click="add">Добавить в корзину</button>
        </div>
        <div v-else class="w-full py-3 rounded-2xl bg-surface-muted text-center text-ink-500 text-sm">
          Нет в наличии
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { productsApi } from '@/api'
import { useCartStore } from '@/stores/cart'
import { useTelegram } from '@/composables/useTelegram'
import SkeletonBox from '@/components/SkeletonBox.vue'
import BynIcon from '@/components/BynIcon.vue'
import type { Product, SubSubCategory } from '@/types'

const route = useRoute()
const cart = useCartStore()
const { haptic, notify } = useTelegram()
const loading = ref(true)
const product = ref<Product | null>(null)
const ssub = ref<SubSubCategory | null>(null)

const inCart = computed(() => cart.items.find(i => i.product.id === product.value?.id))

function formatPrice(p: number) { return p.toLocaleString('ru-RU') }

function add() {
  if (!product.value || !ssub.value) return
  if (inCart.value && inCart.value.quantity >= product.value.stock) return
  cart.add(product.value, ssub.value.price)
  haptic('medium')
  notify('success')
}
function inc() {
  if (!inCart.value || !product.value) return
  if (inCart.value.quantity >= product.value.stock) return
  cart.setQty(inCart.value.product.id, inCart.value.quantity + 1)
}
function dec() {
  if (!inCart.value) return
  if (inCart.value.quantity <= 1) cart.remove(inCart.value.product.id)
  else cart.setQty(inCart.value.product.id, inCart.value.quantity - 1)
}

onMounted(async () => {
  try {
    const [p, ssubs] = await Promise.all([
      productsApi.getOne(route.params.id as string),
      productsApi.getSubSubCategories(),
    ])
    product.value = p
    ssub.value = ssubs.find(s => s.id === p.subsubcategory_id) ?? null
  } catch (error: unknown) {
    console.error('[ProductPage] Ошибка загрузки товара:', error)
    // Товар может быть удалён или API недоступен
  } finally {
    loading.value = false
  }
})
</script>
