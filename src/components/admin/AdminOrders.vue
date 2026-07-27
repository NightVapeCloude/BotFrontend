<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <p class="text-sm text-ink-600">Всего: {{ orders.length }}</p>
      <button class="btn-ghost text-xs px-3 py-1.5" @click="load">Обновить</button>
    </div>

    <div v-if="loading" class="space-y-2">
      <SkeletonBox v-for="i in 4" :key="i" height="100px" width="100%" />
    </div>

    <div v-else-if="orders.length" class="space-y-2">
      <div v-for="order in orders" :key="order.id" class="card p-3 space-y-2">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs text-ink-500 font-mono">#{{ order.id.slice(-6).toUpperCase() }}</p>
            <p class="text-sm font-semibold text-ink-900">{{ order.tg_username }}</p>
            <p class="text-xs text-ink-500 mt-0.5">{{ order.pickup_time }} · {{ formatDate(order.created_at) }}</p>
          </div>
          <StatusBadge :status="order.status" />
        </div>

        <div class="text-xs text-ink-500 space-y-0.5">
          <div v-for="item in order.items" :key="item.product.id">
            {{ item.product.name }} × {{ item.quantity }}
          </div>
        </div>

        <div class="flex items-center justify-between pt-1 border-t border-surface-border">
          <div>
            <div class="flex items-center gap-1">
              <span class="font-display font-bold text-indigo-400 text-sm">{{ formatPrice(order.total) }}</span>
              <BynIcon :size="12" class="text-indigo-400" />
            </div>
            <div v-if="order.discount_amount > 0" class="flex items-center gap-1 mt-0.5">
              <span class="text-xs text-green-400">скидка −{{ formatPrice(order.discount_amount) }}</span>
              <BynIcon :size="10" class="text-green-400" />
            </div>
          </div>
          <div class="flex gap-1.5">
            <button v-for="action in statusActions(order.status)" :key="action.status"
                    class="text-xs px-2.5 py-1 rounded-lg font-semibold transition-all active:scale-95"
                    :class="action.cls"
                    @click="updateStatus(order, action.status)">
              {{ action.label }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <p v-else class="text-ink-400 text-sm">Заказов нет</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ordersApi } from '@/api'
import { useTelegram } from '@/composables/useTelegram'
import SkeletonBox from '@/components/SkeletonBox.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import BynIcon from '@/components/BynIcon.vue'
import type { Order, OrderStatus } from '@/types'

const orders = ref<Order[]>([])
const loading = ref(true)
const { haptic, notify, tg } = useTelegram()

function formatPrice(p: number) { return p.toLocaleString('ru-RU') }
function formatDate(s: string) {
  if (!s) return ''
  return new Date(s).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function statusActions(status: OrderStatus) {
  const map: Record<OrderStatus, { status: OrderStatus; label: string; cls: string }[]> = {
    new: [
      { status: 'confirmed', label: 'Подтвердить', cls: 'bg-amber-500/20 text-amber-400' },
      { status: 'cancelled', label: 'Отменить', cls: 'bg-red-500/15 text-red-400' },
    ],
    confirmed: [
      { status: 'done', label: 'Выдан', cls: 'bg-indigo-500/20 text-indigo-400' },
      { status: 'cancelled', label: 'Отменить', cls: 'bg-red-500/15 text-red-400' },
    ],
    done: [], cancelled: [],
  }
  return map[status]
}

async function updateStatus(order: Order, status: OrderStatus) {
  haptic('medium')
  try {
    await ordersApi.updateStatus(order.id, status)
    order.status = status
  } catch (e: unknown) {
    const detail = (e as { response?: { data?: { detail?: string[] | string } } })?.response?.data?.detail
    const errors = Array.isArray(detail) ? detail : [detail || 'Не удалось обновить статус']
    
    // Использовать Telegram уведомления вместо alert()
    notify('error')
    const errorMessage = errors.join('\n')
    if (tg) {
      tg.showAlert({ message: errorMessage })
    } else {
      alert(errorMessage)
    }
    await load()
  }
}

async function load() {
  loading.value = true
  try { orders.value = await ordersApi.getAll() }
  finally { loading.value = false }
}

onMounted(load)
</script>
