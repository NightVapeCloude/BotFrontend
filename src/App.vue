<template>
  <div class="flex flex-col min-h-dvh">
    <!-- Экран загрузки -->
    <Preloader :visible="loading" />

    <main class="flex-1 overflow-y-auto overscroll-y-contain pb-[calc(var(--nav-h)+var(--tg-safe-bottom))]">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="$route.name" />
        </Transition>
      </RouterView>
    </main>

    <nav class="fixed bottom-0 left-0 right-0 z-50 border-t border-surface-border bg-surface/90 backdrop-blur-xl"
         :style="{ paddingBottom: 'var(--tg-safe-bottom)' }">
      <div class="flex h-16 items-stretch">
        <NavTab v-for="tab in tabs" :key="tab.to" v-bind="tab" />
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useTelegram } from '@/composables/useTelegram'
import { useCartStore } from '@/stores/cart'
import { useCatalogStore } from '@/stores/catalog'
import NavTab from '@/components/NavTab.vue'
import Preloader from '@/components/Preloader.vue'

const { ready, isAdmin } = useTelegram()
const cart = useCartStore()
const catalog = useCatalogStore()
const loading = ref(true)

onMounted(async () => {
  ready()
  // Каталог и корзина грузятся сразу при старте — все страницы уже в
  // основном бандле (см. router.ts), так что после скрытия прелоадера
  // переключение между вкладками ничего не подгружает заново.
  await Promise.all([cart.hydrate(), catalog.loadCatalog()])
  loading.value = false
})

const tabs = computed(() => {
  const base = [
    { to: '/',         icon: 'home',    label: 'Главная' },
    { to: '/catalog',  icon: 'grid',    label: 'Каталог' },
    { to: '/cart',     icon: 'cart',    label: 'Корзина', badge: cart.count || undefined },
    { to: '/profile',  icon: 'user',    label: 'Профиль' },
    { to: '/contacts', icon: 'phone',   label: 'Контакты' },
  ]
  if (isAdmin.value) base.push({ to: '/admin', icon: 'shield', label: 'Админ' })
  return base
})
</script>

<style>
/* This Transition wrapper is the ONLY thing that should ever animate a page
   root's entrance/exit. Page components used to carry their own permanent
   animate-fade-in/slide-up class on their root — that competed with
   page-leave-active's animation-name in the cascade, so page-leave-active
   never actually ran, no animationend ever fired, and <Transition
   mode="out-in"> hung forever waiting for the leave phase, silently blocking
   all navigation. Those classes were removed from every page root; if you're
   adding a new page, do NOT give its root its own animate-* class — it will
   either double-animate (once here, once on the page) or reintroduce the hang.
   !important is kept as a second line of defense against exactly that. */
.page-enter-active { animation: slideUp 0.3s cubic-bezier(0.16,1,0.3,1) !important; }
.page-leave-active { animation: fadeOut 0.15s ease !important; }
@keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeOut { to { opacity: 0; transform: translateY(-8px); } }
</style>
