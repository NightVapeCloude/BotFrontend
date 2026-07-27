import { ref } from 'vue'
import http from '@/api/http'
import type { TgUser } from '@/types'

// Типизация Telegram WebApp
interface TelegramWebApp {
  initData: string
  initDataUnsafe: { user?: TgUser; buttons?: Array<{ id: number; type: string; text: string }> }
  
  // Основные методы
  ready(): void
  close(): void
  expand(): void
  disableVerticalSwipes(): void
  enableClosingConfirmation(): void
  disableClosingConfirmation(): void
  
  // Кнопки
  MainButton: {
    text: string
    show(): void
    hide(): void
    onClick(fn: () => void): void
    offClick(fn: () => void): void
    showProgress(leaveActive: boolean): void
    hideProgress(): void
    enable(): void
    disable(): void
  }
  BackButton: {
    show(): void
    hide(): void
    onClick(fn: () => void): void
    offClick(fn: () => void): void
  }
  
  // Вибрация
  HapticFeedback: {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void
    notificationOccurred(type: 'error' | 'success' | 'warning'): void
    selectionChanged(): void
  }
  
  // Тема
  themeParams: { bg_color?: string; text_color?: string }
  colorScheme: 'light' | 'dark'
  isExpanded: boolean
  
  // Дополнительные методы
  showAlert(options?: { title?: string; message: string }): void
  showPopup(options?: { id?: number; title?: string; message?: string; buttons?: Array<{ id: number; text: string; type: 'ok' | 'cancel' }> }): void
  mainButton: TelegramWebApp['MainButton']
  backButton: TelegramWebApp['BackButton']
}

declare global {
  interface Window {
    Telegram?: { WebApp: TelegramWebApp }
  }
}

const tg = window.Telegram?.WebApp

export function useTelegram() {
  const user = ref<TgUser | null>(tg?.initDataUnsafe?.user ?? null)
  const initData = tg?.initData ?? ''
  const isAdmin = ref(false)

  async function checkAdminStatus() {
    try {
      const { data } = await http.get<{ admin: boolean }>('/admin/me')
      isAdmin.value = !!data.admin
    } catch {
      isAdmin.value = false
    }
  }

  function ready() {
    tg?.ready()
    tg?.expand()
    tg?.disableVerticalSwipes?.()
    tg?.enableClosingConfirmation?.()
    void checkAdminStatus()
  }

  function haptic(style: 'light' | 'medium' | 'heavy' = 'light') {
    tg?.HapticFeedback?.impactOccurred(style)
  }
  function notify(type: 'success' | 'error' | 'warning') {
    tg?.HapticFeedback?.notificationOccurred(type)
  }

  return { user, initData, isAdmin, checkAdminStatus, ready, haptic, notify, tg }
}
