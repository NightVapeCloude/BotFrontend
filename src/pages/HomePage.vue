<template>
  <div class="px-4 pt-6 pb-4 space-y-6 animate-fade-in">
    <div>
      <h1 class="font-display text-xl font-bold text-ink-900">Главная</h1>
      <p class="text-ink-700 text-sm mt-0.5">{{ greeting }}</p>
    </div>

    <section v-if="loading">
      <SkeletonBox v-for="i in 4" :key="i" height="80px" width="100%" class="mb-3" />
    </section>

    <template v-else>
      <!-- 1. Новости -->
      <section v-if="news.length">
        <h2 class="section-title">Новости</h2>
        <div class="space-y-3">
          <div v-for="n in news" :key="n.id" class="card p-4">
            <p class="font-semibold text-sm text-ink-900">{{ n.title }}</p>
            <p class="text-xs text-ink-700 mt-1.5 leading-relaxed">{{ n.body }}</p>
            <p class="text-xs text-ink-700 mt-2">{{ formatDate(n.published_at) }}</p>
          </div>
        </div>
      </section>

      <!-- 2. Скидки -->
      <section v-if="discounts.length">
        <h2 class="section-title">Скидки</h2>
        <div class="space-y-2">
          <div v-for="d in discounts" :key="d.id"
            class="card p-4 active:scale-[0.98] transition-transform duration-150 cursor-pointer"
            @click="goToCart(d)">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-12 h-12 rounded-xl bg-red-500/15 flex items-center justify-center flex-shrink-0">
                <span class="font-display text-red-700 font-bold text-sm">-{{ d.percent }}%</span>
              </div>
              <div class="min-w-0 flex-1">
                <p class="font-semibold text-sm text-ink-900">{{ d.title }}</p>
                <p class="text-xs text-ink-700 mt-0.5">До {{ formatDate(d.valid_until) }}</p>
              </div>
              <svg class="w-4 h-4 text-ink-700 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </div>
            <!-- Условия -->
            <div v-if="hasConditions(d)" class="border-t border-surface-border pt-2 space-y-1">
              <p class="text-[10px] font-semibold text-ink-700 uppercase tracking-wider mb-1">Условия</p>
              <div v-if="d.min_items > 0" class="flex items-center gap-1.5 text-xs text-ink-700">
                <svg class="w-3 h-3 text-indigo-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/></svg>
                Минимум {{ d.min_items }} ед. товара в корзине
              </div>
              <div v-if="d.requires_group" class="flex items-center gap-1.5 text-xs text-ink-700">
                <svg class="w-3 h-3 text-indigo-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
                Состоять в нашей группе
              </div>
              <div v-if="d.reg_date_from || d.reg_date_to" class="flex items-center gap-1.5 text-xs text-ink-700">
                <svg class="w-3 h-3 text-indigo-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                <span>
                  Регистрация
                  <template v-if="d.reg_date_from"> с {{ formatDate(d.reg_date_from) }}</template>
                  <template v-if="d.reg_date_to"> по {{ formatDate(d.reg_date_to) }}</template>
                </span>
              </div>
              <div v-if="d.is_referral" class="flex items-center gap-1.5 text-xs text-ink-700">
                <svg class="w-3 h-3 text-indigo-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6M23 11h-6"/></svg>
                Реферальная — нужен приглашённый с выданным заказом
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. Поступления -->
      <section v-if="arrivals.length">
        <h2 class="section-title">Ближайшие поступления</h2>
        <div class="space-y-2">
          <div v-for="a in arrivals" :key="a.id" class="card p-4 flex items-start gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg class="w-5 h-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
              </svg>
            </div>
            <div class="min-w-0">
              <p class="font-semibold text-sm text-ink-900">{{ a.title }}</p>
              <p class="text-xs text-indigo-600 mt-0.5">{{ formatDate(a.expected_date) }}</p>
              <p v-if="a.description" class="text-xs text-ink-700 mt-1">{{ a.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <div v-if="!news.length && !discounts.length && !arrivals.length"
        class="text-center py-16 text-ink-700">
        <p class="text-4xl mb-3">📭</p>
        <p class="text-sm">Новостей пока нет</p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { contentApi } from '@/api'
import { useTelegram } from '@/composables/useTelegram'
import { useCartStore } from '@/stores/cart'
import SkeletonBox from '@/components/SkeletonBox.vue'
import type { NewsItem, Discount, Arrival } from '@/types'

const { user, notify } = useTelegram()
const router = useRouter()
const cart = useCartStore()
const loading = ref(true)
const news = ref<NewsItem[]>([])
const discounts = ref<Discount[]>([])
const arrivals = ref<Arrival[]>([])

const greeting = computed(() => {
  const name = user.value?.first_name
  return name ? `Привет, ${name}!` : 'Добро пожаловать!'
})

function formatDate(s: string) {
  if (!s) return ''
  return new Date(s).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}

function hasConditions(d: Discount) {
  return d.min_items > 0 || d.requires_group || d.reg_date_from || d.reg_date_to || d.is_referral
}

function goToCart(discount: Discount) {
  if (cart.items.length === 0) {
    // Можно добавить уведомление, но сейчас просто переходим в каталог
    router.push('/catalog')
    return
  }
  router.push({ path: '/cart', query: { discount_id: discount.id } })
}

onMounted(async () => {
  try {
    const [n, d, a] = await Promise.all([
      contentApi.getNews(),
      contentApi.getDiscounts(),
      contentApi.getArrivals(),
    ])
    news.value = n.filter(x => x.is_active)
    discounts.value = d.filter(x => x.is_active)
    arrivals.value = a.filter(x => x.is_active)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Не удалось загрузить контент'
    console.error('[HomePage]', message)
    notify('error') // ✅ Уведомление!
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.section-title { @apply font-display text-xs font-semibold text-ink-700 uppercase tracking-widest mb-2; }
</style>
