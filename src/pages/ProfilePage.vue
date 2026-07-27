<template>
  <div class="px-4 pt-6 pb-4 space-y-5 animate-fade-in">
    <!-- User card -->
    <div class="card p-4 flex items-center gap-4">
      <div class="w-14 h-14 rounded-2xl bg-brand-500/20 flex items-center justify-center flex-shrink-0">
        <span class="font-display font-bold text-brand-400 text-xl">
          {{ initials }}
        </span>
      </div>
      <div class="min-w-0">
        <p class="font-display font-bold text-ink-900 text-base">{{ fullName }}</p>
        <p v-if="user?.username" class="text-ink-500 text-sm mt-0.5">@{{ user.username }}</p>
        <p class="text-ink-400 text-xs mt-1">Зарегистрирован {{ regDateLabel }}</p>
      </div>
    </div>

    <!-- Referral link -->
    <section v-if="profile?.referral_link" class="card p-4 space-y-3">
      <div>
        <h2 class="section-title mb-1">Пригласи друга</h2>
        <p class="text-xs text-ink-500">
          Скидка станет доступна после первого выданного заказа приглашённого
        </p>
      </div>
      <div class="flex items-center gap-2">
        <input
          :value="profile.referral_link"
          readonly
          class="form-input text-xs flex-1 min-w-0"
        />
        <button
          class="btn-primary flex-shrink-0 px-4 py-2.5 text-sm"
          @click="copyReferralLink"
        >
          {{ copied ? '✓' : 'Скопировать' }}
        </button>
      </div>
      <p v-if="profile.referral_credits_available > 0" class="text-xs text-green-400">
        Доступно реферальных скидок: {{ profile.referral_credits_available }}
      </p>
      <p v-else class="text-xs text-ink-500">
        Доступных реферальных скидок пока нет
      </p>
    </section>

    <!-- My invitations -->
    <section v-if="profile">
      <h2 class="section-title">Мои приглашения</h2>
      <div v-if="loadingProfile" class="space-y-2">
        <SkeletonBox height="60px" width="100%" />
      </div>
      <div v-else-if="profile.referrals.length" class="space-y-2">
        <div
          v-for="(ref, idx) in profile.referrals"
          :key="idx"
          class="card p-3 flex items-center justify-between gap-3"
        >
          <div class="min-w-0">
            <p class="text-sm font-semibold text-ink-900 truncate">
              {{ ref.username || '— без username —' }}
            </p>
            <p v-if="ref.reg_date" class="text-xs text-ink-500 mt-0.5">
              {{ formatDate(ref.reg_date) }}
            </p>
          </div>
          <div class="text-right flex-shrink-0">
            <p class="text-xs text-ink-600">Заказов: {{ ref.orders_count }}</p>
            <p class="text-xs mt-0.5" :class="ref.qualified ? 'text-green-400' : 'text-amber-400'">
              {{ ref.qualified ? '✓ Скидка доступна' : '⏳ Ждём заказ' }}
            </p>
          </div>
        </div>
      </div>
      <p v-else class="text-ink-400 text-sm">Приглашённых пользователей пока нет</p>
    </section>

    <!-- Active orders -->
    <section>
      <h2 class="section-title">Текущие заказы</h2>
      <div v-if="loadingOrders" class="space-y-2">
        <SkeletonBox v-for="i in 2" :key="i" height="80px" width="100%" />
      </div>
      <div v-else-if="activeOrders.length" class="space-y-2">
        <OrderCard v-for="o in activeOrders" :key="o.id" :order="o" />
      </div>
      <p v-else class="text-ink-400 text-sm">Активных заказов нет</p>
    </section>

    <!-- Order history -->
    <section v-if="doneOrders.length">
      <h2 class="section-title">История заказов</h2>
      <div class="space-y-2">
        <OrderCard v-for="o in doneOrders" :key="o.id" :order="o" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTelegram } from '@/composables/useTelegram'
import { ordersApi, usersApi } from '@/api'
import SkeletonBox from '@/components/SkeletonBox.vue'
import OrderCard from '@/components/OrderCard.vue'
import type { Order, UserProfile } from '@/types'

const { user, haptic, notify } = useTelegram()
const loadingOrders = ref(true)
const loadingProfile = ref(true)
const orders = ref<Order[]>([])
const profile = ref<UserProfile | null>(null)
const copied = ref(false)

const fullName = computed(() => [user.value?.first_name, user.value?.last_name].filter(Boolean).join(' ') || 'Пользователь')
const initials = computed(() => fullName.value.slice(0, 2).toUpperCase())
const regDateLabel = computed(() => {
  if (!profile.value?.reg_date) return '—'
  return new Date(profile.value.reg_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
})

const activeOrders = computed(() => orders.value.filter(o => ['new', 'confirmed'].includes(o.status)))
const doneOrders = computed(() => orders.value.filter(o => ['done', 'cancelled'].includes(o.status)))

function formatDate(s: string) {
  if (!s) return ''
  return new Date(s).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

async function copyReferralLink() {
  if (!profile.value?.referral_link) return
  try {
    await navigator.clipboard.writeText(profile.value.referral_link)
    copied.value = true
    haptic('light')
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    notify('error')
  }
}

onMounted(async () => {
  try {
    const [ordersData, profileData] = await Promise.all([
      ordersApi.getMine(),
      usersApi.getMe(),
    ])
    orders.value = ordersData
    profile.value = profileData
  } catch (error: unknown) {
    console.error('[ProfilePage] Ошибка загрузки профиля:', error)
    // Профиль или заказы недоступны
  } finally {
    loadingOrders.value = false
    loadingProfile.value = false
  }
})
</script>

<style scoped>
.section-title { @apply font-display text-xs font-semibold text-ink-500 uppercase tracking-widest mb-2; }
.form-input { @apply w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2.5 text-sm text-ink-900 outline-none; }
</style>
