<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-xs text-ink-700">Интервал:</span>
        <select v-model="interval" class="bg-surface-muted border border-surface-border rounded-lg px-2 py-1 text-xs text-ink-800 outline-none focus:border-indigo-500">
          <option :value="5">5 мин</option>
          <option :value="10">10 мин</option>
          <option :value="15">15 мин</option>
          <option :value="20">20 мин</option>
          <option :value="30">30 мин</option>
        </select>
      </div>
      <button class="btn-primary px-4 py-2 text-sm" :disabled="saving" @click="save">
        {{ saving ? 'Сохраняем...' : 'Сохранить' }}
      </button>
    </div>

    <div v-if="loading" class="space-y-2">
      <SkeletonBox v-for="i in 7" :key="i" height="64px" width="100%" />
    </div>

    <div v-else class="space-y-2">
      <div v-for="day in schedule" :key="day.day" class="card p-3"
        :class="{ 'opacity-50': !day.is_open }">
        <div class="flex items-center gap-3">
          <label class="relative flex-shrink-0 cursor-pointer">
            <input type="checkbox" v-model="day.is_open" class="sr-only" />
            <div class="w-10 h-6 rounded-full transition-colors duration-200"
              :class="day.is_open ? 'bg-indigo-500' : 'bg-surface-muted border border-surface-border'">
              <div class="w-4 h-4 bg-white rounded-full absolute top-1 transition-transform duration-200 shadow-sm"
                :class="day.is_open ? 'translate-x-5' : 'translate-x-1'" />
            </div>
          </label>
          <span class="w-8 text-sm font-semibold flex-shrink-0"
            :class="day.is_open ? 'text-ink-900' : 'text-ink-700'">
            {{ dayNames[day.day] }}
          </span>
          <template v-if="day.is_open">
            <div class="flex items-center gap-2 flex-1">
              <input type="time" v-model="day.open_time" class="time-input" />
              <span class="text-ink-700 text-sm">—</span>
              <input type="time" v-model="day.close_time" class="time-input" />
            </div>
            <span class="text-xs text-ink-700 flex-shrink-0 w-16 text-right">
              {{ slotCount(day) }} слотов
            </span>
          </template>
          <span v-else class="text-sm text-ink-700 flex-1">Выходной</span>
        </div>
      </div>
    </div>

    <!-- Превью слотов сегодня -->
    <div v-if="!loading && todayPreview" class="card p-3">
      <p class="text-xs text-ink-700 mb-2">Слоты на сегодня ({{ dayNames[todayPreview.day] }}) · {{ interval }} мин</p>
      <div v-if="todayPreview.is_open" class="flex flex-wrap gap-1.5">
        <span v-for="slot in previewSlots" :key="slot"
          class="text-xs px-2 py-1 bg-indigo-500/10 text-indigo-600 rounded-lg font-mono">
          {{ slot }}
        </span>
      </div>
      <p v-else class="text-sm text-ink-700">Сегодня выходной</p>
    </div>

    <!-- Условия доставки -->
    <div class="card p-4 space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="font-display font-semibold text-sm text-ink-900">Условия доставки</h3>
        <button class="btn-primary px-4 py-2 text-sm" :disabled="savingDelivery" @click="saveDelivery">
          {{ savingDelivery ? 'Сохраняем...' : 'Сохранить' }}
        </button>
      </div>

      <div v-if="loadingDelivery" class="space-y-2">
        <SkeletonBox height="80px" width="100%" />
        <SkeletonBox height="80px" width="100%" />
      </div>
      <template v-else>
        <div>
          <label class="delivery-label">Лошица — цена (Br)</label>
          <input v-model.number="delivery.loshitsa_cost" type="number" min="0" step="0.5" class="delivery-input w-24" />
        </div>
        <div>
          <label class="delivery-label">Лошица — текст условий (используй {cost} для подстановки цены)</label>
          <textarea v-model="delivery.loshitsa_terms" rows="4" class="delivery-input" />
        </div>
        <div>
          <label class="delivery-label">Минск / по метро — текст условий</label>
          <textarea v-model="delivery.minsk_terms" rows="3" class="delivery-input" />
        </div>
        <p class="text-[11px] text-ink-700">
          Этот текст покупатель видит в корзине при выборе «Доставка». Каждая строка — отдельный пункт.
        </p>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { scheduleApi } from '@/api'
import { useTelegram } from '@/composables/useTelegram'
import SkeletonBox from '@/components/SkeletonBox.vue'
import type { ScheduleDay, DeliverySettings } from '@/types'

const loading = ref(true)
const saving = ref(false)
const schedule = ref<ScheduleDay[]>([])
const interval = ref(10)
const { haptic, notify } = useTelegram()

const loadingDelivery = ref(true)
const savingDelivery = ref(false)
const delivery = ref<DeliverySettings>({ loshitsa_cost: 2, loshitsa_terms: '', minsk_terms: '' })

const dayOrder: ScheduleDay['day'][] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
const dayNames: Record<string, string> = {
  mon: 'Пн', tue: 'Вт', wed: 'Ср', thu: 'Чт', fri: 'Пт', sat: 'Сб', sun: 'Вс',
}

const todayPreview = computed(() => {
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  const key = days[new Date().getDay()] as ScheduleDay['day']
  return schedule.value.find(d => d.day === key) ?? null
})

const previewSlots = computed(() => {
  const day = todayPreview.value
  if (!day || !day.is_open) return []
  return generateSlots(day.open_time, day.close_time, interval.value)
})

function generateSlots(open: string, close: string, step: number): string[] {
  const [oh, om] = open.split(':').map(Number)
  const [ch, cm] = close.split(':').map(Number)
  let cur = oh * 60 + om
  const end = ch * 60 + cm
  const slots: string[] = []
  while (cur < end) {
    const h = String(Math.floor(cur / 60)).padStart(2, '0')
    const m = String(cur % 60).padStart(2, '0')
    slots.push(`${h}:${m}`)
    cur += step
  }
  return slots
}

function slotCount(day: ScheduleDay): number {
  if (!day.is_open || !day.open_time || !day.close_time) return 0
  return generateSlots(day.open_time, day.close_time, interval.value).length
}

async function save() {
  saving.value = true
  haptic('medium')
  try {
    await scheduleApi.update(schedule.value, interval.value)
    notify('success')
  } catch {
    notify('error')
  } finally {
    saving.value = false
  }
}

async function saveDelivery() {
  savingDelivery.value = true
  haptic('medium')
  try {
    await scheduleApi.updateDeliverySettings(delivery.value)
    notify('success')
  } catch {
    notify('error')
  } finally {
    savingDelivery.value = false
  }
}

onMounted(async () => {
  try {
    const data = await scheduleApi.get()
    interval.value = data.interval ?? 10
    schedule.value = dayOrder.map(d =>
      data.days.find((x: ScheduleDay) => x.day === d) ??
      { day: d, open_time: '10:00', close_time: '18:00', is_open: false }
    )
  } finally {
    loading.value = false
  }

  try {
    delivery.value = await scheduleApi.getDeliverySettings()
  } finally {
    loadingDelivery.value = false
  }
})
</script>

<style scoped>
.time-input {
  @apply bg-surface-muted border border-surface-border rounded-xl px-2.5 py-1.5
         text-sm text-ink-800 outline-none focus:border-indigo-500 transition-colors
         font-mono flex-1 min-w-0;
  color-scheme: dark;
}
.delivery-label { @apply block text-xs font-semibold text-ink-700 mb-1.5; }
.delivery-input {
  @apply w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2.5
         text-sm text-ink-900 outline-none focus:border-indigo-500 transition-colors resize-none;
}
</style>
