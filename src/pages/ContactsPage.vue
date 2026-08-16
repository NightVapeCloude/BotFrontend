<template>
  <div class="px-4 pt-6 pb-4 space-y-4">
    <h1 class="font-display text-xl font-bold text-ink-900">Контакты</h1>

    <div class="space-y-3">
      <a v-for="c in contacts" :key="c.label" :href="c.href" target="_blank"
        class="card p-4 flex items-center gap-4 active:scale-[0.98] transition-transform duration-150">
        <div class="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" :class="c.bg">
          <svg class="w-5 h-5" :class="c.color" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" v-html="c.icon" />
        </div>
        <div class="min-w-0">
          <p class="text-xs text-ink-700">{{ c.label }}</p>
          <p class="text-sm font-semibold text-ink-900 truncate">{{ c.value }}</p>
        </div>
        <svg class="ml-auto w-4 h-4 text-ink-700 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </a>
    </div>

    <!-- Расписание -->
    <div class="card p-4">
      <h2 class="font-display text-sm font-semibold text-ink-900 mb-3">Режим работы</h2>
      <div v-if="loadingSchedule" class="space-y-2">
        <SkeletonBox v-for="i in 7" :key="i" height="28px" width="100%" />
      </div>
      <div v-else class="space-y-1.5">
        <div v-for="day in schedule" :key="day.day" class="flex items-center justify-between">
          <span class="text-sm text-ink-700 w-28">{{ dayNames[day.day] }}</span>
          <span v-if="day.is_open" class="text-sm text-ink-800">{{ day.open_time }} – {{ day.close_time }}</span>
          <span v-else class="text-sm text-ink-700">Выходной</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { scheduleApi } from '@/api'
import SkeletonBox from '@/components/SkeletonBox.vue'
import type { ScheduleDay } from '@/types'

const schedule = ref<ScheduleDay[]>([])
const loadingSchedule = ref(true)

const dayNames: Record<string, string> = {
  mon: 'Понедельник', tue: 'Вторник', wed: 'Среда',
  thu: 'Четверг', fri: 'Пятница', sat: 'Суббота', sun: 'Воскресенье'
}

const contacts = [
  {
    label: 'Telegram',
    value: 'Night Vape Cloude',
    href: 'https://t.me/c/2620495110/76',
    bg: 'bg-blue-500/15',
    color: 'text-blue-700',
    icon: '<path d="M21.5 2.5l-19 7.5 7 2.5 2.5 7 3-5 5 4 1.5-16z"/><path d="M9.5 12.5l5-3"/>',
  },
  {
    label: 'Manager 1',
    value: 'Manager',
    href: 'https://t.me/m_grmk',
    bg: 'bg-indigo-500/15',
    color: 'text-indigo-600',
    icon: '<path d="M21.5 2.5l-19 7.5 7 2.5 2.5 7 3-5 5 4 1.5-16z"/><path d="M9.5 12.5l5-3"/>',
  },
  {
    label: 'Manager 2',
    value: 'Manager',
    href: 'https://t.me/evel1na_dm',
    bg: 'bg-indigo-500/15',
    color: 'text-indigo-600',
    icon: '<path d="M21.5 2.5l-19 7.5 7 2.5 2.5 7 3-5 5 4 1.5-16z"/><path d="M9.5 12.5l5-3"/>',
  },
  {
    label: 'Адрес',
    value: 'г. Минск, улица Алеся Дудара, 7',
    href: 'https://yandex.by/maps/157/minsk/house/Zk4Ycw9jT0UBQFtpfXR1cXRhbQ==/?ll=27.583353%2C53.840733&z=17.25',
    bg: 'bg-amber-500/15',
    color: 'text-amber-800',
    icon: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>',
  },
]

onMounted(async () => {
  try {
    const data = await scheduleApi.get()
    schedule.value = data.days
  } finally {
    loadingSchedule.value = false
  }
})
</script>
