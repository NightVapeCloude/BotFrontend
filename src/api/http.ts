import axios, { AxiosRequestConfig } from 'axios'

// Конфигурация по умолчанию для всех запросов
const defaultConfig = {
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: 30000, // 30 сек для мобильных сетей
}

// Создание экземпляра с базовой конфигурацией
const http = axios.create(defaultConfig)

// Интерцептор запросов - добавление Telegram данных
http.interceptors.request.use((config) => {
  const tg = window.Telegram?.WebApp
  if (tg?.initData) {
    config.headers['X-Telegram-Init-Data'] = tg.initData
  }
  return config
})

// Интерцептор ответов - обработка ошибок с retry logic
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config as AxiosRequestConfig & { _retry?: boolean; _retryCount?: number }

    // Не пытаться повторить запросы, которые уже были повторены или содержат body
    if (config?._retry || error.response?.status === 400 || error.response?.status === 409) {
      return Promise.reject(error)
    }

    const status = error.response?.status

    // Повторная попытка только для сетевых ошибок и временных сбоев (5xx, timeout)
    if (status === 500 || status === 502 || status === 503 || status === 504 || !status) {
      config._retryCount = config._retryCount ?? 0
      const maxRetries = 2

      if (config._retryCount < maxRetries) {
        config._retryCount++
        config._retry = true

        // Экспоненциальная задержка: 1с, 2с
        const delay = 1000 * Math.pow(2, config._retryCount - 1)

        console.warn(`API запрос ${error.config?.method} ${error.config?.url}: повторная попытка ${config._retryCount}/${maxRetries} через ${delay}мс`)

        try {
          await new Promise(resolve => setTimeout(resolve, delay))
          return http.request(config)
        } catch (retryError) {
          console.error('Повторная попытка не удалась:', retryError)
          return Promise.reject(retryError)
        }
      } else {
        console.error(`API запрос ${error.config?.method} ${error.config?.url}: все повторные попытки (${maxRetries}) исчерпаны`)
      }
    }

    // Обычная ошибка - выводим сообщение и передаем дальше
    const errorMessage = error.response?.data?.message || 
                        error.response?.data || 
                        error.message || 
                        'Неизвестная ошибка API'

    console.error('API error:', errorMessage)

    return Promise.reject(error)
  }
)

export default http
