<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useWallet } from '../../composables/useWallet'
import { useWithdrawals } from '../../composables/useWithdrawals'
import Toast from '../../components/ui/Toast.vue'

const router = useRouter()
const { merchantProfileQuery } = useWallet()
const { requestWithdrawalMutation } = useWithdrawals()

const nominal = ref<number | null>(null)
const selectedBankAccountId = ref<number | null>(null)
const isPinModalOpen = ref(false)
const showSuccessToast = ref(false)
const errorMsg = ref('')
const pinDigits = ref<string[]>([])

const balance = computed(() => {
  return Number(merchantProfileQuery.data.value?.walletBalance || 0)
})

const hasPin = computed(() => {
  return !!merchantProfileQuery.data.value?.withdrawalPin
})

const bankAccounts = computed(() => {
  return merchantProfileQuery.data.value?.bankAccounts || []
})

watch(() => bankAccounts.value, (newVal) => {
  if (newVal && newVal.length > 0) {
    const primary = newVal.find((b: any) => b.isPrimary)
    selectedBankAccountId.value = primary ? primary.id : newVal[0].id
  }
}, { immediate: true })

const validateAndOpenPin = () => {
  errorMsg.value = ''
  if (!nominal.value || nominal.value <= 0) {
    errorMsg.value = 'Nominal harus lebih besar dari 0.'
    return
  }
  if (nominal.value < 50000) {
    errorMsg.value = 'Jumlah penarikan minimal adalah Rp 50.000.'
    return
  }
  if (nominal.value > balance.value) {
    errorMsg.value = 'Saldo wallet tidak mencukupi.'
    return
  }
  if (!selectedBankAccountId.value) {
    errorMsg.value = 'Pilih rekening bank tujuan.'
    return
  }
  isPinModalOpen.value = true
}

const handleNumberClick = (num: number) => {
  if (pinDigits.value.length < 6) {
    pinDigits.value.push(num.toString())
    if (pinDigits.value.length === 6) {
      setTimeout(handleConfirm, 300)
    }
  }
}

const handleDelete = () => {
  pinDigits.value.pop()
}

const handleConfirm = async () => {
  if (pinDigits.value.length === 6 && nominal.value && selectedBankAccountId.value) {
    const pin = pinDigits.value.join('')
    try {
      await requestWithdrawalMutation.mutateAsync({
        bankAccountId: selectedBankAccountId.value,
        amount: nominal.value,
        pin
      })
      isPinModalOpen.value = false
      pinDigits.value = []
      showSuccessToast.value = true
      setTimeout(() => {
        showSuccessToast.value = false
        router.push('/vendor/finance')
      }, 2000)
    } catch (err: any) {
      errorMsg.value = err.response?.data?.message || 'Gagal memproses penarikan.'
      isPinModalOpen.value = false
      pinDigits.value = []
    }
  }
}

const closePinModal = () => {
  isPinModalOpen.value = false
  pinDigits.value = []
}

function goBack() {
  router.push('/vendor/finance')
}
</script>

<template>
  <div class="py-8 px-4 max-w-xl mx-auto font-sans animate-fade-in">
    <div class="flex items-center gap-2 text-sm text-gray-500 mb-6">
      <button @click="goBack" class="hover:text-gray-900 transition-colors p-1 -ml-1">
        <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
      </button>
      <span>Dompet</span>
      <span class="mx-1">&rsaquo;</span>
      <span class="text-gray-900 font-bold">Penarikan Dana</span>
    </div>

    <div class="mb-8">
      <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Tarik Dana</h1>
      <p class="text-sm text-gray-500 mt-1">Tarik saldo utama Anda langsung ke rekening bank terdaftar.</p>
    </div>

    <div v-if="merchantProfileQuery.isLoading.value" class="p-12 text-center text-gray-500">
      Memuat informasi profil toko...
    </div>

    <div v-else-if="!hasPin" class="bg-yellow-50 border border-yellow-200 rounded-3xl p-8 text-center space-y-4">
      <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto text-yellow-600">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
      </div>
      <h3 class="font-extrabold text-gray-900 text-lg">PIN Penarikan Belum Diatur</h3>
      <p class="text-sm text-gray-600 max-w-sm mx-auto leading-relaxed">
        Untuk keamanan akun Anda, Anda wajib membuat Safety PIN penarikan 6-digit terlebih dahulu di profil toko.
      </p>
      <router-link to="/vendor/profile" class="inline-block bg-[#1E3A8A] hover:bg-blue-800 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors shadow-sm">
        Atur PIN Sekarang
      </router-link>
    </div>

    <div v-else-if="bankAccounts.length === 0" class="bg-red-50 border border-red-200 rounded-3xl p-8 text-center space-y-4">
      <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
      </div>
      <h3 class="font-extrabold text-gray-900 text-lg">Rekening Bank Belum Terdaftar</h3>
      <p class="text-sm text-gray-600 max-w-sm mx-auto leading-relaxed">
        Anda harus mendaftarkan setidaknya satu rekening bank di profil toko Anda sebelum dapat menarik dana.
      </p>
      <router-link to="/vendor/profile" class="inline-block bg-[#1E3A8A] hover:bg-blue-800 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors shadow-sm">
        Daftarkan Rekening
      </router-link>
    </div>

    <div v-else class="space-y-6">
      <div class="bg-gray-50 border border-gray-100 rounded-3xl p-6 flex justify-between items-center">
        <div>
          <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Saldo Tersedia</span>
          <h3 class="text-2xl font-extrabold text-gray-900 mt-1">Rp {{ balance.toLocaleString('id-ID') }}</h3>
        </div>
        <span class="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100">
          AKTIF
        </span>
      </div>

      <div class="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6">
        <div class="space-y-2">
          <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest">Nominal Penarikan</label>
          <div class="relative">
            <span class="absolute left-4 top-3.5 text-gray-400 font-bold text-sm">Rp</span>
            <input
              v-model.number="nominal"
              type="number"
              placeholder="Minimal 50.000"
              class="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 font-bold text-lg transition-all"
            />
          </div>
          <p class="text-xs text-gray-400">Batas penarikan minimal Rp 50.000 per transaksi.</p>
        </div>

        <div class="space-y-2">
          <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest">Rekening Tujuan</label>
          <div class="relative">
            <select
              v-model="selectedBankAccountId"
              class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 font-medium text-sm appearance-none"
            >
              <option v-for="bank in bankAccounts" :key="bank.id" :value="bank.id">
                {{ bank.bankName }} - {{ bank.accountNumber }} a/n {{ bank.accountHolderName }}
              </option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        <div v-if="errorMsg" class="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-medium">
          {{ errorMsg }}
        </div>

        <button
          @click="validateAndOpenPin"
          class="w-full bg-[#1E3A8A] hover:bg-blue-800 text-white py-4 px-8 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-md group font-bold"
        >
          <span>Tarik Dana</span>
          <div class="bg-white w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1 shadow-sm">
            <svg class="w-5 h-5 text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="isPinModalOpen" class="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
        <div class="bg-[#1E3A8A] rounded-[40px] w-full max-w-[400px] p-10 shadow-2xl relative animate-scale-in text-center">
          <div class="mb-8">
            <h3 class="text-xl font-extrabold text-white">Masukkan Safety PIN</h3>
            <p class="text-white/60 text-xs mt-1">Masukkan 6 digit kode PIN keamanan Anda</p>
          </div>

          <div class="flex justify-center gap-4 mb-10">
            <div
              v-for="i in 6"
              :key="i"
              class="w-4 h-4 rounded-full transition-all duration-200"
              :class="pinDigits.length >= i ? 'bg-white scale-110 shadow-sm' : 'bg-white/20'"
            ></div>
          </div>

          <div class="grid grid-cols-3 gap-4 max-w-[280px] mx-auto">
            <button
              v-for="n in 9"
              :key="n"
              @click="handleNumberClick(n)"
              class="w-14 h-14 rounded-full bg-white/10 text-white text-xl font-bold flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all mx-auto"
            >
              {{ n }}
            </button>
            
            <button
              @click="closePinModal"
              class="w-14 h-14 rounded-full bg-red-600/20 text-red-200 flex items-center justify-center hover:bg-red-600/30 active:scale-95 transition-all mx-auto"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <button
              @click="handleNumberClick(0)"
              class="w-14 h-14 rounded-full bg-white/10 text-white text-xl font-bold flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all mx-auto"
            >
              0
            </button>

            <button
              @click="handleDelete"
              class="w-14 h-14 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all mx-auto"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2H10.828a2 2 0 00-1.414.586L3 12z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="showSuccessToast"
        class="fixed top-8 right-8 z-[300] animate-fade-in"
      >
        <Toast
          type="success"
          title="Berhasil!"
          subtitle="Permintaan penarikan telah dikirim."
        />
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}

.animate-scale-in {
  animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>
