<template>
  <div class="px-4 pt-6 pb-4 animate-fade-in">

    <!-- Всплывающее уведомление -->
    <Teleport to="body">
      <div v-if="toast" class="fixed top-4 left-4 right-4 z-[200] animate-slide-up">
        <div class="bg-red-500/20 border border-red-500/40 rounded-2xl p-4">
          <p class="text-sm font-semibold text-red-400 mb-2">Условия не выполнены</p>
          <div v-for="err in toast" :key="err" class="flex items-start gap-2 text-xs text-ink-700 mb-1">
            <svg class="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/>
            </svg>
            {{ err }}
          </div>
        </div>
      </div>
    </Teleport>

    <h1 class="font-display text-xl font-bold text-ink-900 mb-4">Корзина</h1>

    <div v-if="!cart.items.length" class="text-center py-20">
      <p class="text-5xl mb-4">🛒</p>
      <p class="text-ink-500 text-sm mb-6">Корзина пуста</p>
      <RouterLink to="/catalog" class="btn-primary">Перейти в каталог</RouterLink>
    </div>

    <template v-else>
      <!-- Товары -->
      <div class="space-y-2 mb-4">
        <div v-for="item in cart.items" :key="item.product.id" class="card p-3 flex items-center gap-3">
          <div class="w-16 h-16 rounded-xl bg-surface-muted overflow-hidden flex-shrink-0">
            <img v-if="item.product.image_url" :src="item.product.image_url" :alt="item.product.name"
              class="w-full h-full object-cover" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-ink-900 line-clamp-1">{{ item.product.name }}</p>
            <div class="flex items-center gap-1 mt-0.5">
              <span class="text-indigo-400 font-display font-bold text-sm">{{ formatPrice(item.price * item.quantity) }}</span>
              <BynIcon :size="11" class="text-indigo-400" />
            </div>
            <p v-if="item.quantity >= item.product.stock" class="text-[10px] text-amber-400 mt-0.5">
              Максимум {{ item.product.stock }} шт
            </p>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            <button class="w-8 h-8 rounded-lg bg-surface-muted flex items-center justify-center active:scale-90 transition-transform text-ink-600"
              @click="dec(item)">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/></svg>
            </button>
            <span class="w-5 text-center font-bold text-sm text-ink-900">{{ item.quantity }}</span>
            <button class="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center transition-transform"
              :class="item.quantity >= item.product.stock ? 'opacity-30 pointer-events-none' : 'active:scale-90'"
              :disabled="item.quantity >= item.product.stock"
              @click="inc(item)">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Скидка -->
      <div class="card p-4 mb-4 space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="font-display font-semibold text-sm text-ink-900">Скидка</h3>
          <button v-if="appliedDiscount" class="text-xs text-ink-500 hover:text-red-400 transition-colors"
            @click="removeDiscount">Убрать</button>
        </div>

        <div v-if="!appliedDiscount">
          <select v-model="selectedDiscountId" class="form-input text-sm">
            <option value="">Выберите скидку...</option>
            <option v-for="d in availableDiscounts" :key="d.id" :value="d.id">
              {{ d.title }} (−{{ d.percent }}%)
            </option>
          </select>
          <button v-if="selectedDiscountId" class="btn-primary w-full mt-2 text-sm py-2"
            :disabled="checkingDiscount" @click="applyDiscount">
            {{ checkingDiscount ? 'Проверяем...' : 'Применить' }}
          </button>
        </div>

        <div v-if="appliedDiscount"
          class="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2">
          <div>
            <p class="text-sm font-semibold text-green-400">{{ appliedDiscount.title }}</p>
            <p class="text-xs text-ink-600 mt-0.5">−{{ appliedDiscount.percent }}% от суммы</p>
          </div>
          <div class="flex items-center gap-1">
            <span class="font-display font-bold text-green-400 text-sm">−{{ formatPrice(discountAmount) }}</span>
            <BynIcon :size="11" class="text-green-400" />
          </div>
        </div>
      </div>

      <!-- Итого -->
      <div class="card p-4 mb-4 space-y-2">
        <div class="flex justify-between items-center text-sm text-ink-600">
          <span>Подытог</span>
          <div class="flex items-center gap-1">
            <span class="text-ink-800">{{ formatPrice(cart.total) }}</span>
            <BynIcon :size="11" class="text-ink-600" />
          </div>
        </div>
        <div v-if="appliedDiscount" class="flex justify-between items-center text-sm">
          <span class="text-green-400">Скидка −{{ appliedDiscount.percent }}%</span>
          <div class="flex items-center gap-1 text-green-400">
            <span>−{{ formatPrice(discountAmount) }}</span>
            <BynIcon :size="11" class="text-green-400" />
          </div>
        </div>
        <div class="flex justify-between items-center pt-2 border-t border-surface-border">
          <span class="text-ink-900 font-semibold">Итого</span>
          <div class="flex items-center gap-1">
            <span class="font-display font-bold text-ink-900 text-xl">{{ formatPrice(finalTotal) }}</span>
            <BynIcon :size="14" class="text-ink-900" />
          </div>
        </div>
      </div>

      <!-- Форма -->
      <div class="card p-4 space-y-3">
        <h2 class="font-display font-semibold text-ink-900 text-sm">Оформление заказа</h2>

        <div>
          <label class="form-label">Telegram username</label>
          <input :value="form.username || '— не указан в Telegram —'" type="text" readonly
            class="form-input opacity-70 cursor-not-allowed" />
          <p class="text-xs text-ink-500 mt-1">Берётся из вашего Telegram-аккаунта</p>
        </div>

        <div>
          <label class="form-label">Дата самовывоза</label>
          <div v-if="loadingDays" class="form-input text-ink-400 text-sm">Загрузка расписания...</div>
          <div v-else-if="!availableDays.length" class="form-input text-red-400 text-sm">Нет доступных дней</div>
          <div v-else class="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button v-for="day in availableDays" :key="day.date"
              class="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 active:scale-95"
              :class="selectedDate === day.date ? 'bg-indigo-500 text-white' : 'bg-surface-muted border border-surface-border text-ink-600'"
              @click="selectDate(day)">
              {{ day.label }}
            </button>
          </div>
        </div>

        <div v-if="selectedDate">
          <label class="form-label">Время</label>
          <div class="grid grid-cols-4 gap-1.5">
            <button v-for="slot in selectedDaySlots" :key="slot"
              class="py-2 rounded-xl text-xs font-semibold transition-all duration-150 active:scale-95"
              :class="form.pickup_time === slot ? 'bg-indigo-500 text-white' : 'bg-surface-muted border border-surface-border text-ink-600'"
              @click="form.pickup_time = slot">
              {{ slot }}
            </button>
          </div>
          <p v-if="errors.pickup_time" class="text-red-400 text-xs mt-1">{{ errors.pickup_time }}</p>
        </div>

        <button class="btn-primary w-full mt-2" :disabled="submitting" @click="submit">
          {{ submitting ? 'Оформляем...' : 'Оформить заказ' }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useCatalogStore } from '@/stores/catalog'
import { useTelegram } from '@/composables/useTelegram'
import { ordersApi, contentApi, scheduleApi, productsApi } from '@/api'
import BynIcon from '@/components/BynIcon.vue'
import type { Discount, AvailableDay, CartItem } from '@/types'

const cart = useCartStore()
const catalog = useCatalogStore()

const router = useRouter()
const route = useRoute()
const { user, haptic, notify } = useTelegram()

const availableDays = ref<AvailableDay[]>([])
const loadingDays = ref(true)
const selectedDate = ref('')
const submitting = ref(false)
const toast = ref<string[] | null>(null)

const availableDiscounts = ref<Discount[]>([])
const selectedDiscountId = ref('')
const appliedDiscount = ref<Discount | null>(null)
const checkingDiscount = ref(false)

const form = ref({
  username: user.value?.username ? '@' + user.value.username : '—',
  pickup_time: '',
})
const errors = ref<{ pickup_time?: string }>({})

const selectedDaySlots = computed(() =>
  availableDays.value.find(d => d.date === selectedDate.value)?.slots ?? []
)
const discountAmount = computed(() => {
  if (!appliedDiscount.value) return 0
  return Math.round(cart.total * appliedDiscount.value.percent / 100)
})
const finalTotal = computed(() => cart.total - discountAmount.value)

function formatPrice(p: number) { return p.toLocaleString('ru-RU') }
function dec(item: CartItem) {
  if (item.quantity <= 1) cart.remove(item.product.id)
  else cart.setQty(item.product.id, item.quantity - 1)
}
function inc(item: CartItem) {
  if (item.quantity >= item.product.stock) return
  cart.setQty(item.product.id, item.quantity + 1)
}
function selectDate(day: AvailableDay) {
  selectedDate.value = day.date
  form.value.pickup_time = ''
}
function removeDiscount() {
  appliedDiscount.value = null
  selectedDiscountId.value = ''
}

function showToast(errors: string[]) {
  toast.value = errors
  setTimeout(() => { toast.value = null }, 4000)
}

async function applyDiscount() {
  if (!selectedDiscountId.value) return
  checkingDiscount.value = true
  try {
    const result = await contentApi.checkDiscount({
      discount_id: selectedDiscountId.value,
      items_count: cart.count,
    })
    if (result.valid && result.discount) {
      appliedDiscount.value = result.discount
    } else {
      showToast(result.failed_conditions)
    }
  } catch {
    showToast(['Не удалось проверить скидку'])
  } finally {
    checkingDiscount.value = false
  }
}

function validate() {
  errors.value = {}
  if (!form.value.pickup_time) errors.value.pickup_time = 'Выберите время'
  return !Object.keys(errors.value).length
}

async function submit() {
  if (!validate()) return
  
  // Проверяем, что каталог загружен
  if (!catalog.loaded) {
    showToast(['Каталог загружается, попробуйте позже'])
    submitting.value = false
    await catalog.loadCatalog()
    if (!catalog.loaded) {
      showToast(['Не удалось загрузить каталог'])
      submitting.value = false
      return
    }
  }
  
  // Проверяем наличие товаров перед оформлением заказа
  const itemsWithPrice: Array<{ product_id: string; quantity: number; price: number; product?: any }> = cart.items.map(i => ({
    product_id: i.product.id,
    quantity: i.quantity,
    price: i.price,
    product: i.product
  }))
  
  // Финальная проверка наличия товаров через API (избегаем race condition с кэшем)
  for (const item of itemsWithPrice) {
    try {
      const product = await productsApi.getOne(item.product_id)
      if (!product) {
        showToast([`Товар ${item.product.name} удалён из каталога`])
        submitting.value = false
        return
      }
      if (product.stock < item.quantity) {
        showToast([`Товар ${item.product.name} больше не в наличии (${product.stock}/${item.quantity})`])
        submitting.value = false
        return
      }
    } catch (error: unknown) {
      console.error(`[CartPage] Ошибка проверки товара ${item.product_id}:`, error)
      showToast(['Не удалось проверить наличие товара'])
      submitting.value = false
      return
    }
  }
  
  // Рассчитываем итоговую сумму со скидкой перед отправкой
  const totalBeforeDiscount = itemsWithPrice.reduce((sum, item) => sum + item.price * item.quantity, 0)
  
  submitting.value = true
  haptic('medium')
  
  try {
    await ordersApi.create({
      tg_username: form.value.username || undefined,
      items: itemsWithPrice,
      pickup_time: `${selectedDate.value} ${form.value.pickup_time}`,
      discount_id: appliedDiscount.value?.id,
    })
    
    notify('success')
    cart.clear()
    router.push('/profile')
  } catch (e: unknown) {
    notify('error')
    console.error('Checkout error:', e)
    const detail = (e as { response?: { data?: { detail?: string | string[] } } })?.response?.data?.detail
    let errors: string[] = []
    if (Array.isArray(detail)) {
      errors = detail
    } else if (typeof detail === 'string') {
      // Если детали это одна строка с точкой с запятой — разбиваем на массив
      errors = detail.split('; ').map(s => s.trim()).filter(Boolean)
    }
    if (!errors.length) {
      errors = ['Не удалось оформить заказ']
    }
    showToast(errors)
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  try {
    await catalog.loadCatalog()
    const [days, discounts] = await Promise.all([
      scheduleApi.getAvailableDays(),
      contentApi.getDiscounts(),
    ])
    availableDays.value = days
    availableDiscounts.value = discounts.filter(d => d.is_active)

    const discountId = route.query.discount_id as string
    if (discountId) {
      selectedDiscountId.value = discountId
      if (cart.items.length > 0) await applyDiscount()
      else showToast(['Сначала добавьте товары в корзину'])
    }
    if (days.length) selectDate(days[0])
  } catch (error: unknown) {
    console.error('[CartPage] Ошибка загрузки расписания:', error)
    // Расписание недоступно — пользователь может перезагрузить страницу
  } finally {
    loadingDays.value = false
  }
})
</script>

<style scoped>
.form-label { @apply block text-xs font-semibold text-ink-500 mb-1.5; }
.form-input { @apply w-full bg-surface-muted border border-surface-border rounded-xl px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-indigo-500 transition-colors; }
.scrollbar-none::-webkit-scrollbar { display: none; }
.scrollbar-none { scrollbar-width: none; }
</style>
