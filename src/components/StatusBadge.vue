<template>
  <span :class="cls">{{ labels[status] }}</span>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { OrderStatus } from '@/types'

const props = defineProps<{ status: OrderStatus }>()

const labels: Record<OrderStatus, string> = {
  new: 'Новый', confirmed: 'Подтверждён', done: 'Выдан', cancelled: 'Отменён'
}
const cls = computed(() => ({
  new: 'status-new', confirmed: 'status-confirmed', done: 'status-done', cancelled: 'status-cancelled'
}[props.status]))
</script>
