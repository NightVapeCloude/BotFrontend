import { createRouter, createWebHashHistory } from 'vue-router'
import http from '@/api/http'
import HomePage from '@/pages/HomePage.vue'
import CatalogPage from '@/pages/CatalogPage.vue'
import ProductPage from '@/pages/ProductPage.vue'
import CartPage from '@/pages/CartPage.vue'
import ProfilePage from '@/pages/ProfilePage.vue'
import ContactsPage from '@/pages/ContactsPage.vue'
import AdminPage from '@/pages/AdminPage.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/',         name: 'home',     component: HomePage },
    { path: '/catalog',  name: 'catalog',  component: CatalogPage },
    { path: '/catalog/:id', name: 'product', component: ProductPage },
    { path: '/cart',     name: 'cart',     component: CartPage },
    { path: '/profile',  name: 'profile',  component: ProfilePage },
    { path: '/contacts', name: 'contacts', component: ContactsPage },
    {
      path: '/admin',
      name: 'admin',
      component: AdminPage,
      beforeEnter: async () => {
        try {
          const { data } = await http.get<{ admin: boolean }>('/admin/me')
          if (data.admin) return true
        } catch {
          /* not admin */
        }
        return '/'
      },
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

export default router
