<template>
  <div class="card p-3 space-y-2">
    <div class="flex items-start justify-between gap-2">
      <div>
        <p class="text-xs text-ink-700 font-mono">#{{ order.id.slice(-6).toUpperCase() }}</p>
        <p class="text-sm font-semibold text-ink-900 mt-0.5">
          <template v-if="order.fulfillment_type === 'delivery'">🚚 {{ DELIVERY_ZONE_LABELS[order.delivery_zone] || 'Доставка' }}</template>
          <template v-else>{{ order.pickup_time }}</template>
        </p>
        <p v-if="order.fulfillment_type === 'delivery'" class="text-xs text-ink-700 mt-0.5">📍 {{ order.delivery_address }}</p>
        <p class="text-xs text-ink-700 mt-0.5">{{ formatDate(order.created_at) }}</p>
      </div>
      <StatusBadge :status="order.status" />
    </div>

    <div class="space-y-1">
      <div v-for="item in order.items" :key="item.product.id"
        class="flex items-center justify-between text-xs text-ink-700">
        <span class="truncate flex-1">{{ item.product.name }} × {{ item.quantity }}</span>
        <div class="flex items-center gap-0.5 flex-shrink-0 ml-2">
          <span class="text-ink-700">{{ formatPrice(item.price * item.quantity) }}</span>
          <BynIcon :size="10" class="text-ink-700" />
        </div>
      </div>
    </div>

    <div class="flex items-center justify-between pt-1.5 border-t border-surface-border">
      <div class="flex flex-col">
        <span class="text-xs text-ink-700">{{ order.tg_username }}</span>
        <div v-if="order.discount_amount > 0" class="text-xs text-green-800">
          Скидка −{{ formatPrice(order.discount_amount) }}
          <BynIcon :size="9" class="inline text-green-800" />
        </div>
        <div v-if="order.fulfillment_type === 'delivery' && order.delivery_cost" class="text-xs text-ink-700">
          + доставка {{ formatPrice(order.delivery_cost) }}
          <BynIcon :size="9" class="inline text-ink-700" />
        </div>
      </div>
      <div class="flex items-center gap-1">
        <span class="font-display font-bold text-indigo-600 text-sm">{{ formatPrice(orderGrandTotal) }}</span>
        <BynIcon :size="12" class="text-indigo-600" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import StatusBadge from './StatusBadge.vue'
import BynIcon from './BynIcon.vue'
import { computed } from 'vue'
import type { Order } from '@/types'
import { DELIVERY_ZONE_LABELS } from '@/types'

const props = defineProps<{ order: Order }>()

const orderGrandTotal = computed(() =>
  props.order.total + (props.order.fulfillment_type === 'delivery' ? props.order.delivery_cost : 0)
)

function formatPrice(p: number) { return p.toLocaleString('ru-RU') }
function formatDate(s: string) {
  if (!s) return ''
  return new Date(s).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}
</script>
