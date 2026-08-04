<template>
  <div class="space-y-3 pb-4">
    <button class="btn-primary w-full" @click="openForm()">+ Добавить</button>

    <div v-if="loading" class="space-y-2">
      <SkeletonBox v-for="i in 3" :key="i" height="80px" width="100%" />
    </div>

    <div v-else class="space-y-2">
      <div v-for="item in items" :key="item.id" class="card p-3">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-ink-900 truncate">{{ item.title }}</p>
            <p class="text-xs text-ink-700 mt-0.5">{{ subtext(item) }}</p>
          </div>
          <div class="flex items-center gap-1.5 flex-shrink-0">
            <span class="w-1.5 h-1.5 rounded-full" :class="item.is_active ? 'bg-indigo-400' : 'bg-ink-400'" />
            <button class="p-1.5 rounded-lg hover:bg-surface-muted transition-colors text-ink-700 hover:text-ink-800" @click="openForm(item)">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="p-1.5 rounded-lg hover:bg-red-500/15 transition-colors text-ink-700 hover:text-red-700" @click="del(item.id)">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showForm" class="fixed inset-0 z-[100]"
        style="background:rgb(var(--color-overlay) / 0.7)" @click.self="showForm = false">
        <div class="fixed bottom-0 left-0 right-0 max-h-[85dvh] overflow-y-auto overscroll-contain bg-surface-card border border-surface-border rounded-t-3xl p-5 space-y-3 animate-slide-up"
          :style="{ paddingBottom: 'calc(20px + var(--tg-safe-bottom))' }">
          <div class="flex items-center justify-between mb-1">
            <h3 class="font-display font-semibold text-ink-900 text-sm">{{ editing ? 'Редактировать' : 'Добавить' }}</h3>
            <button class="text-ink-700 hover:text-ink-900" @click="showForm = false">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <div>
            <label class="form-label">Заголовок</label>
            <input v-model="formData.title" type="text" class="form-input" placeholder="Заголовок" />
          </div>

          <!-- News -->
          <div v-if="type === 'news'">
            <label class="form-label">Текст</label>
            <textarea v-model="formData.body" class="form-input" rows="3" placeholder="Текст новости" />
          </div>

          <!-- Discounts -->
          <template v-if="type === 'discounts'">
            <div>
              <label class="form-label">Скидка (%)</label>
              <input v-model.number="formData.percent" type="number" class="form-input" placeholder="20" />
            </div>
            <div>
              <label class="form-label">Действует до</label>
              <input v-model="formData.valid_until" type="date" class="form-input" />
            </div>

            <div class="border-t border-surface-border pt-3">
              <p class="text-xs font-semibold text-ink-700 mb-3">Условия (оставь пустым если не нужно)</p>
              <div class="space-y-3">

                <div>
                  <label class="form-label">Минимум товаров в корзине</label>
                  <input v-model.number="formData.min_items" type="number" min="0" class="form-input"
                    placeholder="0 — условие не активно" />
                  <p class="text-[10px] text-ink-700 mt-1">Например 3 — скидка только при заказе от 3 единиц</p>
                </div>

                <label class="flex items-center gap-3 cursor-pointer">
                  <input v-model="formData.requires_group" type="checkbox" class="w-4 h-4 rounded accent-indigo-500" />
                  <div>
                    <p class="text-sm text-ink-800">Проверять участие в группе</p>
                    <p class="text-[10px] text-ink-700 mt-0.5">Бот проверит состоит ли пользователь в вашей группе</p>
                  </div>
                </label>

                <label class="flex items-center gap-3 cursor-pointer">
                  <input v-model="formData.is_referral" type="checkbox" class="w-4 h-4 rounded accent-indigo-500" />
                  <div>
                    <p class="text-sm text-ink-800">Реферальная скидка</p>
                    <p class="text-[10px] text-ink-700 mt-0.5">
                      Доступна только при наличии приглашённых с выданным заказом (1 приглашение = 1 использование)
                    </p>
                  </div>
                </label>

                <div class="grid grid-cols-2 gap-2">
                  <div class="min-w-0">
                    <label class="form-label">Регистрация с</label>
                    <input v-model="formData.reg_date_from" type="date" class="form-input min-w-0" />
                  </div>
                  <div class="min-w-0">
                    <label class="form-label">Регистрация по</label>
                    <input v-model="formData.reg_date_to" type="date" class="form-input min-w-0" />
                  </div>
                </div>
                <p class="text-[10px] text-ink-700">Дата первого входа пользователя в бота (/start)</p>
              </div>
            </div>
          </template>

          <!-- Arrivals -->
          <template v-if="type === 'arrivals'">
            <div>
              <label class="form-label">Ожидаемая дата</label>
              <input v-model="formData.expected_date" type="date" class="form-input" />
            </div>
            <div>
              <label class="form-label">Описание</label>
              <textarea v-model="formData.description" class="form-input" rows="2" placeholder="Что поступит" />
            </div>
          </template>

          <label class="flex items-center gap-2 text-sm text-ink-700 cursor-pointer">
            <input v-model="formData.is_active" type="checkbox" class="w-4 h-4 rounded accent-indigo-500" />
            Активно
          </label>

          <button class="btn-primary w-full" :disabled="saving" @click="save">
            {{ saving ? 'Сохраняем...' : 'Сохранить' }}
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { contentApi } from '@/api'
import SkeletonBox from '@/components/SkeletonBox.vue'

const props = defineProps<{ type: 'news' | 'discounts' | 'arrivals'; title: string }>()

const loading = ref(true)
const saving = ref(false)
const showForm = ref(false)
const editing = ref<string | null>(null)
const items = ref<any[]>([])
const formData = ref<any>({ title: '', is_active: true })

function subtext(item: any) {
  if (props.type === 'news') return item.published_at ? new Date(item.published_at).toLocaleDateString('ru-RU') : ''
  if (props.type === 'discounts') return `-${item.percent}% · до ${item.valid_until ? new Date(item.valid_until).toLocaleDateString('ru-RU') : '?'}${item.is_referral ? ' · реф.' : ''}`
  if (props.type === 'arrivals') return item.expected_date ? new Date(item.expected_date).toLocaleDateString('ru-RU') : ''
  return ''
}

function openForm(item?: any) {
  if (item) {
    editing.value = item.id
    formData.value = { ...item }
  } else {
    editing.value = null
    formData.value = {
      title: '', is_active: true,
      ...(props.type === 'discounts' ? { percent: 0, valid_until: '', min_items: 0, requires_group: false, reg_date_from: '', reg_date_to: '', is_referral: false } : {}),
      ...(props.type === 'arrivals' ? { expected_date: '', description: '' } : {}),
      ...(props.type === 'news' ? { body: '', published_at: '' } : {}),
    }
  }
  showForm.value = true
}

async function save() {
  saving.value = true
  try {
    if (editing.value) {
      const fn = props.type === 'news' ? contentApi.updateNews : props.type === 'discounts' ? contentApi.updateDiscount : contentApi.updateArrival
      const updated = await fn(editing.value, formData.value)
      const idx = items.value.findIndex(i => i.id === editing.value)
      if (idx !== -1) items.value[idx] = updated
    } else {
      const fn = props.type === 'news' ? contentApi.createNews : props.type === 'discounts' ? contentApi.createDiscount : contentApi.createArrival
      items.value.unshift(await fn(formData.value))
    }
    showForm.value = false
  } finally { saving.value = false }
}

async function del(id: string) {
  const fn = props.type === 'news' ? contentApi.deleteNews : props.type === 'discounts' ? contentApi.deleteDiscount : contentApi.deleteArrival
  await fn(id)
  items.value = items.value.filter(i => i.id !== id)
}

onMounted(async () => {
  loading.value = true
  try {
    items.value = props.type === 'news' ? await contentApi.getNews()
      : props.type === 'discounts' ? await contentApi.getDiscounts()
      : await contentApi.getArrivals()
  } finally { loading.value = false }
})
</script>

<style scoped>
.form-label { @apply block text-xs font-semibold text-ink-700 mb-1.5; }
.form-input { @apply w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-indigo-500 transition-colors resize-none; }
</style>
