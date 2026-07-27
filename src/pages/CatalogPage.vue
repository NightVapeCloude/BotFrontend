<template>
  <div class="flex flex-col min-h-full animate-fade-in">

    <!-- Экран 1: Категории -->
    <template v-if="!activeCategory">
      <div class="px-4 pt-6 pb-4">
        <h1 class="font-display text-xl font-bold text-ink-900 mb-1">Каталог</h1>
        <p class="text-ink-500 text-sm">Выберите категорию</p>
      </div>
      <div v-if="loading" class="px-4 grid grid-cols-2 gap-3">
        <SkeletonBox v-for="i in 4" :key="i" height="120px" width="100%" />
      </div>
      <div v-else class="px-4 grid grid-cols-2 gap-3">
        <button v-for="cat in categories" :key="cat.id"
          class="card p-5 flex flex-col items-start gap-3 active:scale-95 transition-transform duration-150 text-left"
          @click="selectCategory(cat)">
          <div class="w-11 h-11 rounded-2xl bg-indigo-500/20 flex items-center justify-center overflow-hidden">
            <img v-if="cat.icon_url" :src="cat.icon_url" :alt="cat.name" class="w-3/4 h-3/4 object-cover" />
            <span v-else class="text-2xl">🛍</span>
          </div>
          <span class="font-display font-semibold text-sm text-ink-900 leading-snug">{{ cat.name }}</span>
        </button>
      </div>
    </template>

    <!-- Экран 2: Подкатегории -->
    <template v-else-if="!activeSubCategory">
      <div class="px-4 pt-4 pb-3 sticky top-0 z-10 bg-surface/95 backdrop-blur-xl border-b border-surface-border">
        <div class="flex items-center gap-3">
          <button class="w-8 h-8 rounded-xl bg-surface-muted flex items-center justify-center active:scale-90 transition-transform"
            @click="activeCategory = null">
            <svg class="w-4 h-4 text-ink-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <h1 class="font-display text-base font-bold text-ink-900">{{ activeCategory.name }}</h1>
        </div>
      </div>
      <div class="px-4 pt-4 grid grid-cols-2 gap-3">
        <button v-for="sub in activeSubs" :key="sub.id"
          class="card p-4 flex flex-col items-start gap-2 active:scale-95 transition-transform duration-150 text-left"
          @click="activeSubCategory = sub">
          <span class="font-display font-semibold text-sm text-ink-900">{{ sub.name }}</span>
          <span class="text-xs text-ink-500">{{ subSubCount(sub.id) }} линеек</span>
        </button>
      </div>
    </template>

    <!-- Экран 3: Подподкатегории + товары -->
    <template v-else>
      <div class="px-4 pt-4 pb-3 sticky top-0 z-10 bg-surface/95 backdrop-blur-xl border-b border-surface-border">
        <div class="flex items-center gap-3 mb-3">
          <button class="w-8 h-8 rounded-xl bg-surface-muted flex items-center justify-center active:scale-90 transition-transform"
            @click="activeSubCategory = null">
            <svg class="w-4 h-4 text-ink-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <p class="text-xs text-ink-500">{{ activeCategory.name }} / {{ activeSubCategory.name }}</p>
        </div>
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input v-model="search" type="search" placeholder="Поиск вкуса..."
            class="w-full bg-surface-card border border-surface-border rounded-xl pl-9 pr-4 py-2 text-sm text-ink-800 placeholder-ink-400 outline-none focus:border-indigo-500 transition-colors" />
        </div>
      </div>

      <div v-if="loading" class="p-4 space-y-6">
        <SkeletonBox v-for="i in 3" :key="i" height="200px" width="100%" />
      </div>

      <div v-else-if="groupedProducts.length" class="p-4 space-y-8">
        <div v-for="group in groupedProducts" :key="group.ssub.id">
          <!-- Заголовок подподкатегории -->
          <div class="flex items-center justify-between mb-3">
            <h2 class="font-display font-bold text-ink-900 text-sm">{{ group.ssub.name }}</h2>
            <div class="flex items-center gap-2">
              <div v-if="group.ssub.strength"
                class="bg-violet-500/15 border border-violet-500/20 px-2.5 py-1 rounded-lg">
                <span class="text-violet-300 font-semibold text-xs">{{ group.ssub.strength }}</span>
              </div>
              <!-- Цена ПЕРЕД символом -->
              <div class="flex items-center gap-1 bg-indigo-500/15 border border-indigo-500/20 px-2.5 py-1 rounded-lg">
                <span class="text-indigo-400 font-display font-bold text-xs">{{ formatPrice(group.ssub.price) }}</span>
                <BynIcon :size="11" class="text-indigo-400" />
              </div>
            </div>
          </div>

          <!-- Горизонтальный скролл вкусов -->
          <div class="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
            <FlavorCard
              v-for="product in group.products"
              :key="product.id"
              :product="product"
              :price="group.ssub.price"
            />
          </div>
        </div>
      </div>

      <div v-else class="text-center py-20 text-ink-400">
        <p class="text-4xl mb-3">🔍</p>
        <p class="text-sm">Ничего не найдено</p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { productsApi } from '@/api'
import { useTelegram } from '@/composables/useTelegram'
import SkeletonBox from '@/components/SkeletonBox.vue'
import BynIcon from '@/components/BynIcon.vue'
import FlavorCard from '@/components/FlavorCard.vue'
import type { Category, SubCategory, SubSubCategory, Product } from '@/types'

const { notify } = useTelegram()

const loading = ref(true)
const categories = ref<Category[]>([])
const subcategories = ref<SubCategory[]>([])
const subsubcategories = ref<SubSubCategory[]>([])
const products = ref<Product[]>([])
const activeCategory = ref<Category | null>(null)
const activeSubCategory = ref<SubCategory | null>(null)
const search = ref('')
const retryCount = ref(0)
const maxRetries = 3

function formatPrice(p: number) { return p.toLocaleString('ru-RU') }

const activeSubs = computed(() =>
  subcategories.value
    .filter(s => s.category_id === activeCategory.value?.id)
    .sort((a, b) => a.sort_order - b.sort_order)
)

function subSubCount(subId: string) {
  return subsubcategories.value.filter(s => s.subcategory_id === subId).length
}

const groupedProducts = computed(() => {
  if (!activeSubCategory.value) return []
  return subsubcategories.value
    .filter(s => s.subcategory_id === activeSubCategory.value!.id)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(ssub => ({
      ssub,
      products: products.value
        .filter(p => p.subsubcategory_id === ssub.id)
        .filter(p => !search.value || p.name.toLowerCase().includes(search.value.toLowerCase()))
        .sort((a, b) => a.sort_order - b.sort_order),
    }))
    .filter(g => g.products.length > 0)
})

function selectCategory(cat: Category) {
  activeCategory.value = cat
  activeSubCategory.value = null
  search.value = ''
}

async function loadCatalog() {
  loading.value = true
  try {
    const [cats, subs, ssubs, prods] = await Promise.all([
      productsApi.getCategories(),
      productsApi.getSubCategories(),
      productsApi.getSubSubCategories(),
      productsApi.getAll(),
    ])
    categories.value = cats.sort((a, b) => a.sort_order - b.sort_order)
    subcategories.value = subs
    subsubcategories.value = ssubs
    products.value = prods
  } catch (error: unknown) {
    console.error('[CatalogPage]', error)
    if (retryCount.value < maxRetries) {
      retryCount.value++
      notify('warning')
      setTimeout(loadCatalog, 2000)
    } else {
      notify('error')
    }
  } finally {
    loading.value = false
  }
}

onMounted(loadCatalog)
</script>

<style>
.scrollbar-none::-webkit-scrollbar { display: none; }
.scrollbar-none { scrollbar-width: none; }
</style>
