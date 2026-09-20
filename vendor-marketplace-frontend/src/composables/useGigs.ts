import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import api from '../api/axios'

export function useGigDetail(gigId: string | number) {
  return useQuery({
    queryKey: ['gig', String(gigId)],
    queryFn: async () => {
      const res = await api.get(`/gigs/details/${gigId}`)
      return res.data
    },
    enabled: computed(() => !!gigId)
  })
}

export function useMyGigs() {
  return useQuery({
    queryKey: ['gigs', 'my'],
    queryFn: async () => {
      const res = await api.get('/gigs/my-gigs')
      return res.data
    }
  })
}

export function useFeaturedGigs() {
  return useQuery({
    queryKey: ['gigs', 'featured'],
    queryFn: async () => {
      const res = await api.get('/gigs?limit=3&status=APPROVED')
      return res.data
    },
    staleTime: 1000 * 60 * 5
  })
}

export function useGigsList(params?: { categoryId?: number; limit?: number; q?: string }) {
  return useQuery({
    queryKey: ['gigs', 'list', params],
    queryFn: async () => {
      const { data } = await api.get('/gigs', { params })
      return data
    }
  })
}

export function useReviews(gigId: string | number) {
  return useQuery({
    queryKey: ['reviews', String(gigId)],
    queryFn: async () => {
      const res = await api.get(`/reviews?gigId=${gigId}`)
      return Array.isArray(res.data) ? res.data : res.data.data || []
    },
    enabled: computed(() => !!gigId)
  })
}
