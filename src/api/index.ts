import http from './http'
import type {
  Product, Category, SubCategory, SubSubCategory,
  Order, OrderStatus, NewsItem, Discount, DiscountCheckResult,
  Arrival, ScheduleDay, AvailableDay, UserProfile, UserSummary
} from '@/types'

export const productsApi = {
  getAll:              () => http.get<Product[]>('/products').then(r => r.data),
  getOne:              (id: string) => http.get<Product>(`/products/${id}`).then(r => r.data),
  getCategories:       () => http.get<Category[]>('/categories').then(r => r.data),
  getSubCategories:    () => http.get<SubCategory[]>('/subcategories').then(r => r.data),
  getSubSubCategories: () => http.get<SubSubCategory[]>('/subsubcategories').then(r => r.data),
}

export const ordersApi = {
  create: (data: {
    tg_username?: string
    items: { product_id: string; quantity: number }[]
    pickup_time: string
    discount_id?: string
  }) => http.post<Order>('/orders', data, { timeout: 30000 }).then(r => r.data),
  getMine:      () => http.get<Order[]>('/orders/mine').then(r => r.data),
  getAll:       () => http.get<Order[]>('/admin/orders').then(r => r.data),
  updateStatus: (id: string, status: OrderStatus) =>
    http.patch<Order>(`/admin/orders/${id}/status`, { status }).then(r => r.data),
}

export const contentApi = {
  getNews:      () => http.get<NewsItem[]>('/news').then(r => r.data),
  getDiscounts: () => http.get<Discount[]>('/discounts').then(r => r.data),
  checkDiscount: (data: {
    discount_id: string
    items_count: number
  }) => http.post<DiscountCheckResult>('/discounts/check', data).then(r => r.data),
  getArrivals:  () => http.get<Arrival[]>('/arrivals').then(r => r.data),

  createNews:     (d: Omit<NewsItem, 'id'>)    => http.post<NewsItem>('/admin/news', d).then(r => r.data),
  updateNews:     (id: string, d: Partial<NewsItem>) => http.put<NewsItem>(`/admin/news/${id}`, d).then(r => r.data),
  deleteNews:     (id: string) => http.delete(`/admin/news/${id}`),

  createDiscount: (d: Omit<Discount, 'id'>)    => http.post<Discount>('/admin/discounts', d).then(r => r.data),
  updateDiscount: (id: string, d: Partial<Discount>) => http.put<Discount>(`/admin/discounts/${id}`, d).then(r => r.data),
  deleteDiscount: (id: string) => http.delete(`/admin/discounts/${id}`),

  createArrival:  (d: Omit<Arrival, 'id'>)     => http.post<Arrival>('/admin/arrivals', d).then(r => r.data),
  updateArrival:  (id: string, d: Partial<Arrival>) => http.put<Arrival>(`/admin/arrivals/${id}`, d).then(r => r.data),
  deleteArrival:  (id: string) => http.delete(`/admin/arrivals/${id}`),
}

export const scheduleApi = {
  get:           () => http.get<{ days: ScheduleDay[]; interval: number }>('/schedule').then(r => r.data),
  getAvailableDays: () => http.get<AvailableDay[]>('/schedule/available-days').then(r => r.data),
  getSlots:      (date?: string) => http.get<string[]>('/schedule/slots', { params: date ? { date } : {} }).then(r => r.data),
  update:        (days: ScheduleDay[], interval: number) =>
    http.put('/admin/schedule', { days, interval }).then(r => r.data),
}

export const usersApi = {
  getMe: () => http.get<UserProfile>('/users/me').then(r => r.data),
  getAllAdmin: () => http.get<UserSummary[]>('/admin/users').then(r => r.data),
}
