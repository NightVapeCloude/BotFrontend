export interface Category {
  id: string
  name: string
  slug: string
  sort_order: number
  icon_url: string
}

export interface SubCategory {
  id: string
  name: string
  category_id: string
  sort_order: number
}

export interface SubSubCategory {
  id: string
  name: string
  subcategory_id: string
  price: number
  strength: string
  sort_order: number
}

export interface Product {
  id: string
  name: string
  subsubcategory_id: string
  image_url: string
  stock: number
  sort_order: number
}

export interface CartItem {
  product: Product
  quantity: number
  price: number
}

export interface Discount {
  id: string
  title: string
  percent: number
  valid_until: string
  is_active: boolean
  min_items: number
  requires_group: boolean
  reg_date_from: string
  reg_date_to: string
  is_referral: boolean
}

export interface ReferralInfo {
  username: string
  reg_date: string
  orders_count: number
  qualified: boolean
}

export interface UserProfile {
  tg_user_id: number
  reg_date: string
  referral_link: string
  referral_credits_available: number
  referral_credits_used: number
  referral_credits_earned: number
  referrals: ReferralInfo[]
}

export interface UserSummary {
  tg_user_id: number
  username: string
  first_name: string
  reg_date: string
  referred_by: string
  referral_credits_used: number
  referral_credits_earned: number
}

export interface DiscountCheckResult {
  valid: boolean
  discount: Discount | null
  failed_conditions: string[]
}

export interface AvailableDay {
  date: string
  label: string
  slots: string[]
}

export interface Order {
  id: string
  tg_username: string
  tg_user_id: number
  items: CartItem[]
  total: number
  discount_id?: string
  discount_amount: number
  pickup_time: string
  status: OrderStatus
  created_at: string
}

export type OrderStatus = 'new' | 'confirmed' | 'done' | 'cancelled'

export interface NewsItem {
  id: string
  title: string
  body: string
  published_at: string
  is_active: boolean
}

export interface Arrival {
  id: string
  title: string
  expected_date: string
  description: string
  is_active: boolean
}

export interface ScheduleDay {
  day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
  open_time: string
  close_time: string
  is_open: boolean
}

export interface TgUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
}
