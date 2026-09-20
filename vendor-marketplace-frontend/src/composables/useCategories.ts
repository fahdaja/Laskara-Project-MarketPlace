import { useQuery } from '@tanstack/vue-query'
import api from '../api/axios'

export interface Category {
  id: number
  name: string
  commissionRate: string
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get<Category[]>('/categories')
      return data
    }
  })
}
