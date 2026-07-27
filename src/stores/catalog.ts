import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { productsApi } from '@/api'
import type { Product, SubSubCategory } from '@/types'

export const useCatalogStore = defineStore('catalog', () => {
  // Кэш всех продуктов
  const allProducts = ref<Product[]>([])
  
  // Кэш подподкатегорий
  const subSubCategories = ref<SubSubCategory[]>([])
  
  // Флаг загрузки каталога
  const loaded = ref(false)

  /**
   * Загружает весь каталог (продукты и категории)
   */
  async function loadCatalog() {
    if (loaded.value) return
    
    try {
      const [products, subsubs] = await Promise.all([
        productsApi.getAll(),
        productsApi.getSubSubCategories(),
      ])
      
      allProducts.value = products
      subSubCategories.value = subsubs
      loaded.value = true
    } catch (error: unknown) {
      console.error('[CatalogStore] Ошибка загрузки каталога:', error)
      // Не ставим loaded = true при ошибке, чтобы можно было повторить попытку
    }
  }

  /**
   * Получает продукты по ID (с проверкой кэша)
   */
  function getProductById(productId: string): Product | undefined {
    return allProducts.value.find(p => p.id === productId)
  }

  /**
   * Получает подподкатегорию по ID
   */
  function getSubSubCategoryById(subsubId: string): SubSubCategory | undefined {
    return subSubCategories.value.find(s => s.id === subsubId)
  }

  /**
   * Проверяет наличие товара в наличии
   */
  function isInStock(product: Product): boolean {
    return product.stock > 0
  }

  /**
   * Очищает кэш каталога (для перезагрузки)
   */
  function clearCache() {
    allProducts.value = []
    subSubCategories.value = []
    loaded.value = false
  }

  return {
    allProducts,
    subSubCategories,
    loaded,
    loadCatalog,
    getProductById,
    getSubSubCategoryById,
    isInStock,
    clearCache,
  }
})
