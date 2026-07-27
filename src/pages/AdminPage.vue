<template>
  <div class="animate-fade-in">
    <div class="px-4 pt-6 pb-3 sticky top-0 z-10 bg-surface/90 backdrop-blur-xl border-b border-surface-border">
      <div class="flex items-center gap-2 mb-3">
        <div class="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center">
          <svg class="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <h1 class="font-display text-lg font-bold text-ink-900">Администратор</h1>
      </div>
      <div class="flex gap-2 overflow-x-auto scrollbar-none">
        <button v-for="t in adminTabs" :key="t.id"
          class="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150"
          :class="activeTab === t.id ? 'bg-amber-500/20 text-amber-400' : 'text-ink-500 hover:text-ink-700'"
          @click="activeTab = t.id">
          {{ t.label }}
        </button>
      </div>
    </div>

    <div class="p-4">
      <!-- ORDERS -->
      <AdminOrders v-if="activeTab === 'orders'" />
      <!-- NEWS -->
      <AdminContentList v-else-if="activeTab === 'news'" type="news" title="Новости" />
      <!-- DISCOUNTS -->
      <AdminContentList v-else-if="activeTab === 'discounts'" type="discounts" title="Скидки" />
      <!-- ARRIVALS -->
      <AdminContentList v-else-if="activeTab === 'arrivals'" type="arrivals" title="Поступления" />
      <!-- SCHEDULE -->
      <AdminSchedule v-else-if="activeTab === 'schedule'" />
      <!-- USERS -->
      <AdminUsers v-else-if="activeTab === 'users'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AdminOrders from '@/components/admin/AdminOrders.vue'
import AdminContentList from '@/components/admin/AdminContentList.vue'
import AdminSchedule from '@/components/admin/AdminSchedule.vue'
import AdminUsers from '@/components/admin/AdminUsers.vue'

const activeTab = ref('orders')
const adminTabs = [
  { id: 'orders',    label: 'Заказы' },
  { id: 'news',      label: 'Новости' },
  { id: 'discounts', label: 'Скидки' },
  { id: 'arrivals',  label: 'Поступления' },
  { id: 'schedule',  label: 'График' },
  { id: 'users',     label: 'Пользователи' },
]
</script>
