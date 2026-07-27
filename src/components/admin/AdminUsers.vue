<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <p class="text-sm text-ink-600">Всего: {{ users.length }}</p>
      <button class="btn-ghost text-xs px-3 py-1.5" @click="load">Обновить</button>
    </div>

    <div v-if="loading" class="space-y-2">
      <SkeletonBox v-for="i in 4" :key="i" height="72px" width="100%" />
    </div>

    <div v-else-if="users.length" class="space-y-2">
      <div v-for="u in users" :key="u.tg_user_id" class="card p-3 space-y-1">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm font-semibold text-ink-900">
              {{ u.first_name || '—' }}
              <span v-if="u.username" class="text-ink-500 font-normal">@{{ u.username }}</span>
            </p>
            <p class="text-xs text-ink-500 font-mono mt-0.5">{{ u.tg_user_id }}</p>
          </div>
          <p class="text-xs text-ink-500">{{ formatDate(u.reg_date) }}</p>
        </div>
        <div class="flex items-center gap-3 text-xs text-ink-500 pt-1 border-t border-surface-border">
          <span v-if="u.referred_by">Приглашён: {{ u.referred_by }}</span>
          <span>Реф. использовано: {{ u.referral_credits_used }}</span>
          <span>Реф. заработано: {{ u.referral_credits_earned }}</span>
        </div>
      </div>
    </div>

    <p v-else class="text-ink-400 text-sm">Пользователей нет</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usersApi } from '@/api'
import SkeletonBox from '@/components/SkeletonBox.vue'
import type { UserSummary } from '@/types'

const users = ref<UserSummary[]>([])
const loading = ref(true)

function formatDate(s: string) {
  if (!s) return ''
  return new Date(s).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
}

async function load() {
  loading.value = true
  try { users.value = await usersApi.getAllAdmin() }
  finally { loading.value = false }
}

onMounted(load)
</script>
