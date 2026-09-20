import { computed, watch } from 'vue'
import { useAuthStore } from '../store/auth.store'
import { useRouter } from 'vue-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import api from '../api/axios'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()
  const queryClient = useQueryClient()

  const isLoggedIn = computed(() => authStore.isAuthenticated)
  const user = computed(() => authStore.currentUser)
  
  const logout = () => {
    authStore.logout()
    queryClient.clear()
    router.push('/')
  }

  const redirectByRole = (role: string) => {
    if (!role) {
      router.push('/jelajahi')
      return
    }
    const roleUpper = role.toUpperCase()
    if (roleUpper.includes('SUPER_ADMIN') || roleUpper === 'SUPERADMIN') {
      router.push('/super-admin/dashboard')
    } else if (roleUpper.includes('FINANCE')) {
      router.push('/finance-admin/dashboard')
    } else if (roleUpper.includes('VALIDATOR') || roleUpper === 'ADMIN_VALIDATOR') {
      router.push('/admin-validator/dashboard')
    } else if (roleUpper === 'MERCHANT_OWNER' || roleUpper === 'MERCHANT' || roleUpper === 'VENDOR') {
      router.push('/vendor/dashboard')
    } else if (roleUpper === 'MERCHANT_ASSOCIATE') {
      router.push('/vendor/associate/dashboard')
    } else {
      router.push('/jelajahi')
    }
  }

  const loginMutation = useMutation({
    mutationFn: async (payload: any) => {
      const response = await api.post('/auth/login', payload)
      return response.data
    },
    onSuccess: (res) => {
      if (res.status === 'success' || res.data) {
        const { access_token, user } = res.data
        const mappedUser = {
          ...user,
          id: String(user.id || user.sub),
          name: user.fullName || user.name || 'User'
        }
        authStore.setAuth(mappedUser, access_token)
        
        const isRegisteringMerchant = localStorage.getItem('is_registering_merchant')
        if (isRegisteringMerchant) {
          localStorage.removeItem('is_registering_merchant')
          router.push('/daftar/merchant')
        } else {
          redirectByRole(user.role)
        }
      }
    }
  })

  const adminLoginMutation = useMutation({
    mutationFn: async (payload: any) => {
      const response = await api.post('/auth/admin/login', payload)
      return response.data
    },
    onSuccess: (res) => {
      if (res.status === 'success' || res.data) {
        const { access_token, user } = res.data
        const mappedUser = {
          ...user,
          id: String(user.id || user.sub),
          name: user.fullName || user.name || 'User'
        }
        authStore.setAuth(mappedUser, access_token)
        redirectByRole(user.role)
      }
    }
  })

  const signUpMutation = useMutation({
    mutationFn: async (payload: any) => {
      const apiPayload = {
        email: payload.email,
        password: payload.password,
        fullName: payload.username,
      }
      const response = await api.post('/users', apiPayload)
      return { ...response.data, originalPayload: payload }
    },
    onSuccess: (_res, variables) => {
      if (variables.role === 'MERCHANT') {
        localStorage.setItem('is_registering_merchant', 'true')
      }
      
      loginMutation.mutate({
        email: variables.email,
        password: variables.password
      })
    }
  })

  const fetchMerchantStatus = async (userId: string) => {
    try {
      const res = await api.get('/merchants/profile')
      const merchant = res.data
      localStorage.setItem(`merchant_status_${userId}`, merchant.status)
      localStorage.setItem(`merchant_${userId}`, JSON.stringify(merchant))
      return merchant
    } catch (err: any) {
      const status = err.response?.status
      const message = err.response?.data?.message

      if (status === 400 && message?.includes('tidak dapat mengakses profil toko')) {
        // The merchant exists but is either INCOMPLETE, PENDING_VERIFICATION, or REJECTED.
        // Let's probe if it is REJECTED by calling acknowledge-rejection.
        try {
          const ackRes = await api.patch('/merchants/kyb/acknowledge-rejection')
          const merchant = ackRes.data
          // We annotate the status as REJECTED for the frontend
          const annotatedMerchant = {
            ...merchant,
            status: 'REJECTED'
          }
          localStorage.setItem(`merchant_status_${userId}`, 'REJECTED')
          localStorage.setItem(`merchant_${userId}`, JSON.stringify(annotatedMerchant))
          return annotatedMerchant
        } catch (ackErr: any) {
          // If acknowledge-rejection fails, it is not REJECTED. It is either INCOMPLETE or PENDING_VERIFICATION.
          const storedStatus = localStorage.getItem(`merchant_status_${userId}`)
          const storedMerchantStr = localStorage.getItem(`merchant_${userId}`)
          let merchant = storedMerchantStr ? JSON.parse(storedMerchantStr) : null

          if (storedStatus === 'PENDING_VERIFICATION' || storedStatus === 'INCOMPLETE') {
            if (!merchant) merchant = {}
            merchant.status = storedStatus
            return merchant
          }
          
          // Default fallback
          if (!merchant) merchant = {}
          merchant.status = 'INCOMPLETE'
          return merchant
        }
      } else if (status === 404) {
        localStorage.setItem(`merchant_status_${userId}`, 'INCOMPLETE')
        return null
      }
      
      const storedMerchantStr = localStorage.getItem(`merchant_${userId}`)
      return storedMerchantStr ? JSON.parse(storedMerchantStr) : null
    }
  }

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await api.get('/auth/profile')
      const user = response.data
      if (user) {
        const roleUpper = user.role?.toUpperCase()
        if (roleUpper === 'MERCHANT_OWNER' || roleUpper === 'MERCHANT' || roleUpper === 'VENDOR' || roleUpper === 'MERCHANT_ASSOCIATE') {
          const merchant = await fetchMerchantStatus(String(user.id || user.sub))
          user.merchant = merchant
        }
      }
      return user
    },
    enabled: computed(() => !!authStore.token),
    retry: false
  })

  watch(
    () => profileQuery.data.value,
    (newUser) => {
      if (newUser) {
        const mappedUser = {
          ...newUser,
          id: String(newUser.id || newUser.sub),
          name: newUser.fullName || newUser.name || 'User'
        }
        authStore.setAuth(mappedUser, authStore.token!)
      }
    },
    { immediate: true }
  )

  const registerVendorMutation = useMutation({
    mutationFn: async (payload: { shopName: string; description?: string; logoUrl?: string; bannerUrl?: string }) => {
      const response = await api.post('/merchants', payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      router.push('/vendor/documents')
    }
  })

  const submitKybMutation = useMutation({
    mutationFn: async (payload: { kybDocumentUrl: string; portfolioUrl: string }) => {
      const response = await api.patch('/merchants/submit-kyb', payload)
      return response.data
    },
    onSuccess: (res) => {
      if (res) {
        const userId = String(authStore.currentUser?.id)
        if (userId) {
          localStorage.setItem(`merchant_status_${userId}`, 'PENDING_VERIFICATION')
          localStorage.setItem(`merchant_${userId}`, JSON.stringify(res))
        }
      }
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
    onError: (err: any) => {
      const message = err.response?.data?.message
      if (message?.includes('Pengajuan KYB hanya bisa dilakukan dari status INCOMPLETE')) {
        const userId = String(authStore.currentUser?.id)
        if (userId) {
          localStorage.setItem(`merchant_status_${userId}`, 'PENDING_VERIFICATION')
          queryClient.invalidateQueries({ queryKey: ['profile'] })
        }
      }
    }
  })

  const registerMerchantMutation = useMutation({
    mutationFn: async (payload: any) => {
      const response = await api.post('/merchants/register', payload)
      return response.data
    },
    onSuccess: (res) => {
      const data = res.data || res
      if (data) {
        const { access_token, user, merchant } = data
        if (access_token && user) {
          const mappedUser = {
            ...user,
            id: String(user.id || user.sub),
            name: user.fullName || user.name || 'User',
            merchant: merchant || (data.status ? { status: data.status } : null)
          }
          authStore.setAuth(mappedUser, access_token)
          
          const userId = String(mappedUser.id)
          if (merchant) {
            localStorage.setItem(`merchant_status_${userId}`, merchant.status || 'INCOMPLETE')
            localStorage.setItem(`merchant_${userId}`, JSON.stringify(merchant))
          } else if (data.status) {
            localStorage.setItem(`merchant_status_${userId}`, data.status)
          }
        }
      }
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    }
  })

  const updateProfileMutation = useMutation({
    mutationFn: async (payload: { fullName?: string; avatarUrl?: string }) => {
      const response = await api.patch('/auth/profile', payload)
      return response.data
    },
    onSuccess: (res) => {
      const updatedUser = res.data || res
      if (updatedUser) {
        const mappedUser = {
          ...updatedUser,
          id: String(updatedUser.id || updatedUser.sub),
          name: updatedUser.fullName || updatedUser.name || 'User'
        }
        authStore.setAuth(mappedUser, authStore.token!)
      }
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    }
  })

  const uploadFile = async (file: File, bucket?: string) => {
    const formData = new FormData()
    formData.append('file', file)
    if (bucket) {
      formData.append('bucket', bucket)
    }
    const response = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  return {
    isLoggedIn,
    user,
    logout,
    loginMutation,
    adminLoginMutation,
    signUpMutation,
    profileQuery,
    registerVendorMutation,
    submitKybMutation,
    registerMerchantMutation,
    uploadFile,
    updateProfileMutation
  }
}
