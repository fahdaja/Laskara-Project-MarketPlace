import { defineStore } from 'pinia'

export const useRegistrationStore = defineStore('registration', {
  state: () => ({
    email: '',
    password: '',
    username: '',
    role: '',
    // Merchant specific
    shopName: '',
    description: '',
    logoUrl: '',
    bannerUrl: '',
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
  }),
  actions: {
    setCredentials(data: any) {
      this.email = data.email
      this.password = data.password
      this.username = data.username
      this.role = data.role
    },
    setShopInfo(data: any) {
      this.shopName = data.shopName
      this.description = data.description
    },
    setUploads(data: any) {
      this.logoUrl = data.logoUrl
      this.bannerUrl = data.bannerUrl
    },
    setBankInfo(data: any) {
      this.bankName = data.bankName
      this.accountNumber = data.accountNumber
      this.accountHolderName = data.accountHolderName
    },
    reset() {
      this.$reset()
    }
  }
})
