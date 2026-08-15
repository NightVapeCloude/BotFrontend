<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <p class="text-sm text-ink-700">Всего: {{ orders.length }}</p>
      <button class="btn-ghost text-xs px-3 py-1.5" @click="load">Обновить</button>
    </div>

    <div v-if="loading" class="space-y-2">
      <SkeletonBox v-for="i in 4" :key="i" height="100px" width="100%" />
    </div>

    <div v-else-if="orders.length" class="space-y-2">
      <div v-for="order in orders" :key="order.id" class="card p-3 space-y-2">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs text-ink-700 font-mono">#{{ order.id.slice(-6).toUpperCase() }}</p>
            <p class="text-sm font-semibold text-ink-900">{{ order.tg_username }}</p>
            <p class="text-xs text-ink-700 mt-0.5">
              <template v-if="order.fulfillment_type === 'delivery'">
                🚚 {{ DELIVERY_ZONE_LABELS[order.delivery_zone] || order.delivery_zone }}
              </template>
              <template v-else>{{ order.pickup_time }}</template>
              · {{ formatDate(order.created_at) }}
            </p>
            <p v-if="order.fulfillment_type === 'delivery'" class="text-xs text-ink-700 mt-0.5">📍 {{ order.delivery_address }}</p>
          </div>
          <StatusBadge :status="order.status" />
        </div>

        <div class="text-xs text-ink-700 space-y-0.5">
          <div v-for="item in order.items" :key="item.product.id">
            {{ item.product.name }} × {{ item.quantity }}
          </div>
        </div>

        <!-- Доставка по Минску: стоимость вписывает менеджер вручную -->
        <div v-if="order.fulfillment_type === 'delivery'" class="flex items-center gap-2 pt-1 border-t border-surface-border">
          <span class="text-xs text-ink-700 flex-shrink-0">Доставка:</span>
          <template v-if="order.delivery_zone === 'loshitsa'">
            <div class="flex items-center gap-1">
              <span class="text-sm font-semibold text-ink-900">{{ formatPrice(order.delivery_cost) }}</span>
              <BynIcon :size="10" class="text-ink-900" />
            </div>
          </template>
          <template v-else>
            <input v-model.number="deliveryCostDrafts[order.id]" type="number" min="0" step="0.5"
              placeholder="0" class="w-16 bg-surface-muted border border-surface-border rounded-lg px-2 py-1 text-xs text-ink-900 outline-none focus:border-indigo-500" />
            <button class="text-xs px-2 py-1 rounded-lg font-semibold bg-indigo-500/20 text-indigo-600 active:scale-95 transition-all"
              @click="saveDeliveryCost(order)">Сохранить</button>
            <span v-if="order.delivery_cost" class="text-xs text-ink-700">(сейчас {{ formatPrice(order.delivery_cost) }})</span>
          </template>
        </div>

        <div class="flex items-center justify-between pt-1 border-t border-surface-border">
          <div>
            <div class="flex items-center gap-1">
              <span class="font-display font-bold text-indigo-600 text-sm">{{ formatPrice(order.total) }}</span>
              <BynIcon :size="12" class="text-indigo-600" />
            </div>
            <div v-if="order.discount_amount > 0" class="flex items-center gap-1 mt-0.5">
              <span class="text-xs text-green-800">скидка −{{ formatPrice(order.discount_amount) }}</span>
              <BynIcon :size="10" class="text-green-800" />
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

    <p v-else class="text-ink-700 text-sm">Заказов нет</p>
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
const DELIVERY_ZONE_LABELS: Record<string, string> = { minsk: 'Минск/по метро', loshitsa: 'Лошица' }
const deliveryCostDrafts = ref<Record<string, number>>({})

function formatPrice(p: number) { return p.toLocaleString('ru-RU') }
function formatDate(s: string) {
  if (!s) return ''
  return new Date(s).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function statusActions(status: OrderStatus) {
  const map: Record<OrderStatus, { status: OrderStatus; label: string; cls: string }[]> = {
    new: [
      { status: 'confirmed', label: 'Подтвердить', cls: 'bg-amber-500/20 text-amber-800' },
      { status: 'cancelled', label: 'Отменить', cls: 'bg-red-500/15 text-red-700' },
    ],
    confirmed: [
      { status: 'done', label: 'Выдан', cls: 'bg-indigo-500/20 text-indigo-600' },
      { status: 'cancelled', label: 'Отменить', cls: 'bg-red-500/15 text-red-700' },
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

async function saveDeliveryCost(order: Order) {
  const cost = deliveryCostDrafts.value[order.id]
  if (cost === undefined || cost === null || cost < 0) return
  haptic('medium')
  try {
    await ordersApi.updateDeliveryCost(order.id, cost)
    order.delivery_cost = cost
    notify('success')
  } catch {
    notify('error')
    if (tg) tg.showAlert({ message: 'Не удалось сохранить стоимость доставки' })
    else alert('Не удалось сохранить стоимость доставки')
  }
}

async function load() {
  loading.value = true
  try {
    orders.value = await ordersApi.getAll()
    for (const o of orders.value) {
      if (o.fulfillment_type === 'delivery' && o.delivery_zone === 'minsk') {
        deliveryCostDrafts.value[o.id] = o.delivery_cost || 0
      }
    }
  }
  finally { loading.value = false }
}

onMounted(load)
</script>
