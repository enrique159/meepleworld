import { ref } from 'vue'
import { defineStore } from 'pinia'

export type MarketplaceKind = 'all' | 'sale' | 'wanted'

export const useMarketplaceStore = defineStore('marketplace', () => {
  const kind = ref<MarketplaceKind>('all')
  const query = ref('')
  const city = ref('')

  function resetFilters() {
    kind.value = 'all'
    query.value = ''
    city.value = ''
  }

  return { kind, query, city, resetFilters }
})
