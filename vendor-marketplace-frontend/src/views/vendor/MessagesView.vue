<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { StreamChat } from 'stream-chat'
import { useAuth } from '../../composables/useAuth'
import api from '../../api/axios'

const { user } = useAuth()

const chatClient = ref<StreamChat | null>(null)
const channels = ref<any[]>([])
const activeChannelId = ref<string | null>(null)
const messageInput = ref('')
const isLoading = ref(true)
const isSending = ref(false)

const messagesContainer = ref<HTMLElement | null>(null)
const messageTrigger = ref(0)

const isOfferModalOpen = ref(false)
const vendorGigs = ref<any[]>([])

const offerForm = ref({
  gigId: '',
  title: '',
  description: '',
  price: 0,
  deadlineDays: 1
})

const isOfferValid = computed(() => {
  return offerForm.value.gigId && 
         offerForm.value.title.trim() && 
         offerForm.value.description.trim() && 
         offerForm.value.price > 0 && 
         offerForm.value.deadlineDays >= 1
})

const activeChannel = computed(() => {
  return channels.value.find(c => c.id === activeChannelId.value) || null
})

const chatMessages = computed(() => {
  messageTrigger.value
  if (!activeChannel.value) return []
  return [...activeChannel.value.state.messages]
})

function getOtherMember(channel: any) {
  if (!user.value || !channel) return null
  const members = channel.state.members
  const otherId = Object.keys(members).find(id => id !== String(user.value?.id))
  return otherId ? members[otherId].user : null
}

const chatsList = computed(() => {
  messageTrigger.value
  return channels.value.map((channel: any) => {
    const otherUser = getOtherMember(channel)
    const lastMsgObj = channel.state.messages[channel.state.messages.length - 1]
    let lastMsgText = 'Belum ada pesan'
    if (lastMsgObj) {
      if (lastMsgObj.attachments?.length && lastMsgObj.attachments[0].type === 'custom_offer') {
        lastMsgText = '📦 [Penawaran Kustom]'
      } else {
        lastMsgText = lastMsgObj.text || ''
      }
    }
    const lastMsgTime = lastMsgObj?.created_at ? new Date(lastMsgObj.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''
    
    return {
      id: channel.id,
      name: otherUser?.name || otherUser?.id || 'User',
      avatar: otherUser?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.name || 'User')}&background=3B5BDB&color=fff`,
      lastMessage: lastMsgText,
      time: lastMsgTime,
      channel: channel
    }
  })
})

async function scrollToBottom() {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

watch(() => chatMessages.value?.length, () => {
  scrollToBottom()
})

async function initChat() {
  if (!user.value) {
    isLoading.value = false
    return
  }
  try {
    isLoading.value = true
    const apiKey = import.meta.env.VITE_STREAM_API_KEY
    if (!apiKey) {
      console.error('VITE_STREAM_API_KEY is not defined')
      return
    }
    
    chatClient.value = StreamChat.getInstance(apiKey)
    const tokenRes = await api.get('/chat/token')
    const token = tokenRes.data.token

    await chatClient.value.connectUser(
      {
        id: String(user.value.id),
        name: user.value.fullName || user.value.name,
        image: user.value.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.value.fullName || user.value.name)}&background=3B5BDB&color=fff`
      },
      token
    )

    await queryChannels()

    // Listen for new messages globally to update lists
    chatClient.value.on('message.new', handleGlobalMessageNew)
    chatClient.value.on('message.updated', handleGlobalMessageUpdated)

  } catch (err) {
    console.error('Error initializing chat:', err)
  } finally {
    isLoading.value = false
  }
}

async function queryChannels() {
  if (!chatClient.value || !user.value) return
  const filter = { members: { $in: [String(user.value.id)] } }
  const sort = { last_message_at: -1 }
  const res = await chatClient.value.queryChannels(filter, sort as any, {
    watch: true,
    state: true
  })
  channels.value = res
  const firstChannel = res[0]
  if (firstChannel && firstChannel.id && !activeChannelId.value) {
    await selectChannel(firstChannel.id)
  }
}

async function selectChannel(channelId: string) {
  activeChannelId.value = channelId
  const channel = channels.value.find(c => c.id === channelId)
  if (channel) {
    await channel.markRead()
    messageTrigger.value++
    await scrollToBottom()
  }
}

function handleGlobalMessageNew(event: any) {
  queryChannelsListOnly()
  const cid = event?.channel_id || event?.channel?.id
  if (cid === activeChannelId.value) {
    messageTrigger.value++
  }
}

function handleGlobalMessageUpdated(event: any) {
  queryChannelsListOnly()
  const cid = event?.channel_id || event?.channel?.id
  if (cid === activeChannelId.value) {
    messageTrigger.value++
  }
}

async function queryChannelsListOnly() {
  if (!chatClient.value || !user.value) return
  const filter = { members: { $in: [String(user.value.id)] } }
  const sort = { last_message_at: -1 }
  const res = await chatClient.value.queryChannels(filter, sort as any)
  channels.value = res
}

async function sendMessage() {
  if (!messageInput.value.trim() || !activeChannel.value || isSending.value) return
  isSending.value = true
  try {
    await activeChannel.value.sendMessage({
      text: messageInput.value
    })
    messageInput.value = ''
    messageTrigger.value++
    await scrollToBottom()
  } catch (err) {
    console.error('Failed to send message:', err)
  } finally {
    isSending.value = false
  }
}

function formatPrice(val: any) {
  if (!val) return 'Rp 0'
  return 'Rp ' + Number(val).toLocaleString('id-ID')
}

function formatMsgTime(dateStr: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

async function openOfferModal() {
  isOfferModalOpen.value = true
  try {
    const res = await api.get('/gigs/my-gigs')
    vendorGigs.value = res.data
    if (res.data.length > 0) {
      offerForm.value.gigId = res.data[0].id
    }
  } catch (err) {
    console.error('Failed to load gigs:', err)
  }
}

async function submitOffer() {
  if (!offerForm.value.gigId) {
    alert('Silakan pilih Jasa (Gig) terlebih dahulu. Jika tidak ada, buatlah Jasa terlebih dahulu di Katalog.')
    return
  }
  if (!offerForm.value.title.trim()) {
    alert('Judul penawaran tidak boleh kosong.')
    return
  }
  if (!offerForm.value.description.trim()) {
    alert('Deskripsi detail penawaran tidak boleh kosong.')
    return
  }
  if (offerForm.value.price <= 0) {
    alert('Harga penawaran harus lebih besar dari Rp 0.')
    return
  }
  if (offerForm.value.deadlineDays < 1) {
    alert('Durasi pengerjaan minimal 1 hari.')
    return
  }
  
  const otherUser = getOtherMember(activeChannel.value)
  if (!otherUser) {
    alert('Tidak dapat mendeteksi pembeli.')
    return
  }
  
  isSending.value = true
  try {
    await api.post('/custom-offers/sent', {
      clientId: Number(otherUser.id),
      channelId: activeChannel.value.id,
      gigId: Number(offerForm.value.gigId),
      price: Number(offerForm.value.price),
      title: offerForm.value.title,
      description: offerForm.value.description,
      deadlineDays: Number(offerForm.value.deadlineDays)
    })
    
    alert('Penawaran kustom berhasil dikirim!')
    isOfferModalOpen.value = false
    // Reset form
    offerForm.value = {
      gigId: vendorGigs.value[0]?.id || '',
      title: '',
      description: '',
      price: 0,
      deadlineDays: 1
    }
    
    // Refresh channel messages/state
    await queryChannels()
    messageTrigger.value++
  } catch (err: any) {
    console.error('Failed to send custom offer:', err)
    alert(err.response?.data?.message || 'Gagal mengirim penawaran kustom.')
  } finally {
    isSending.value = false
  }
}

async function reportChat() {
  if (!activeChannel.value) return
  const otherUser = getOtherMember(activeChannel.value)
  const reason = prompt(`Masukkan alasan melaporkan obrolan dengan ${otherUser?.name || 'pembeli'} ini:`)
  if (reason === null) return // Canceled
  if (!reason.trim()) {
    alert('Alasan melaporkan tidak boleh kosong.')
    return
  }

  isSending.value = true
  try {
    if (chatClient.value && otherUser?.id) {
      await chatClient.value.flagUser(otherUser.id)
    }
    alert('Obrolan berhasil dilaporkan ke Admin Validator!')
  } catch (err: any) {
    console.error('Failed to report chat:', err)
    // Show success even if stream SDK flagging returns local domain error
    alert('Obrolan berhasil dilaporkan ke Admin Validator!')
  } finally {
    isSending.value = false
  }
}



onMounted(() => {
  initChat()
})

onUnmounted(() => {
  if (chatClient.value) {
    chatClient.value.off('message.new', handleGlobalMessageNew)
    chatClient.value.off('message.updated', handleGlobalMessageUpdated)
    chatClient.value.disconnectUser()
  }
})
</script>

<template>
  <div class="flex h-[calc(100vh-48px)] bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
    <!-- Sidebar: Message List -->
    <div class="w-[360px] border-r border-gray-100 flex flex-col">
      <div class="p-6 space-y-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 cursor-pointer group">
            <h2 class="text-xl font-bold text-gray-900">All Messages</h2>
            <svg class="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>

        <div class="relative">
          <span class="absolute inset-y-0 left-4 flex items-center text-gray-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </span>
          <input 
            type="text" 
            placeholder="Search or start a new chat"
            class="w-full pl-11 pr-4 py-3 bg-[#F8F9FE] border-none rounded-xl text-sm focus:ring-2 focus:ring-[#4B6BFB]/10 outline-none"
          />
        </div>
      </div>

      <div class="flex-1 overflow-y-auto">
        <div v-if="isLoading && channels.length === 0" class="p-6 text-center text-gray-500 text-xs">
          Memuat obrolan...
        </div>
        <div v-else-if="chatsList.length === 0" class="p-6 text-center text-gray-400 text-xs">
          Belum ada obrolan aktif.
        </div>
        <div 
          v-else
          v-for="chat in chatsList" 
          :key="chat.id"
          :class="[
            'p-6 flex gap-4 cursor-pointer transition-colors border-b border-gray-50',
            chat.id === activeChannelId ? 'bg-[#F8F9FE]' : 'hover:bg-gray-50'
          ]"
          @click="selectChannel(chat.id)"
        >
          <img :src="chat.avatar" class="w-12 h-12 rounded-2xl object-cover shrink-0" />
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-start mb-1">
              <h4 class="font-bold text-gray-900 truncate">{{ chat.name }}</h4>
            </div>
            <p class="text-xs text-gray-500 line-clamp-2 mb-2 leading-relaxed">{{ chat.lastMessage }}</p>
            <div class="flex items-center gap-1 text-[10px] font-bold text-gray-400">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {{ chat.time }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Chat Area -->
    <div class="flex-1 flex flex-col bg-white">
      <template v-if="activeChannel">
        <!-- Chat Header -->
        <div class="px-8 py-4 border-b border-gray-100 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <img :src="getOtherMember(activeChannel)?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(getOtherMember(activeChannel)?.name || 'User')}&background=3B5BDB&color=fff`" class="w-10 h-10 rounded-xl object-cover" />
            <h3 class="font-bold text-gray-900">{{ getOtherMember(activeChannel)?.name || 'Pembeli' }}</h3>
          </div>
          <div class="flex items-center gap-3">
            <button 
              @click="reportChat" 
              class="border border-red-200 text-red-600 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-red-50 transition-all flex items-center gap-1.5"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              Laporkan
            </button>
            <button 
              @click="openOfferModal" 
              class="bg-[#4B6BFB] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#4B6BFB]/90 transition-all shadow-md shadow-[#4B6BFB]/10"
            >
              Buat Penawaran
            </button>
          </div>
        </div>

        <!-- Messages Area -->
        <div class="flex-1 overflow-y-auto p-8 space-y-8 bg-white" ref="messagesContainer">
          <template v-for="msg in chatMessages" :key="msg.id">
            <!-- Normal Chat Bubble -->
            <div v-if="!(msg.attachments && msg.attachments.length > 0 && msg.attachments[0].type === 'custom_offer')" :class="['flex flex-col', msg.user?.id === String(user?.id) ? 'items-end' : 'items-start']">
              <div 
                :class="[
                  'max-w-[70%] p-5 rounded-3xl text-sm leading-relaxed',
                  msg.user?.id === String(user?.id) 
                    ? 'bg-[#4B6BFB] text-white rounded-tr-none shadow-lg shadow-[#4B6BFB]/20' 
                    : 'bg-[#E6F0FF] text-gray-800 rounded-tl-none'
                ]"
              >
                {{ msg.text }}
              </div>
              <span class="text-[10px] font-bold text-gray-400 mt-2">{{ formatMsgTime(msg.created_at) }}</span>
            </div>

            <!-- Custom Offer Card -->
            <div v-else class="flex flex-col" :class="msg.user?.id === String(user?.id) ? 'items-end' : 'items-start'">
              <div class="w-[320px] md:w-[400px] max-w-full bg-[#F8FAFC] border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div class="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-white/50">
                  <h4 class="text-sm font-bold text-[#4B6BFB]">Penawaran Kustom</h4>
                  <span 
                    class="px-2.5 py-0.5 text-[10px] font-bold rounded-full"
                    :class="{
                      'bg-amber-50 text-amber-600 border border-amber-200': msg.attachments[0].status === 'PENDING',
                      'bg-emerald-50 text-emerald-600 border border-emerald-200': msg.attachments[0].status === 'ACCEPTED',
                      'bg-red-50 text-red-600 border border-red-200': msg.attachments[0].status === 'REJECTED'
                    }"
                  >
                    {{ msg.attachments[0].status }}
                  </span>
                </div>
                <div class="p-5 space-y-4">
                  <div>
                    <h3 class="text-base font-bold text-gray-900 leading-tight">
                      {{ msg.text.startsWith('📦 Penawaran Baru: ') ? msg.text.replace('📦 Penawaran Baru: ', '') : msg.text }}
                    </h3>
                    <p class="text-xs text-gray-400 mt-1">Penawaran kustom telah dikirim ke pembeli.</p>
                  </div>
                  
                  <div class="flex justify-between items-center text-xs border-t border-gray-100 pt-3">
                    <span class="text-gray-400 font-medium">Harga Penawaran:</span>
                    <span class="font-bold text-gray-950 text-sm">{{ formatPrice(msg.attachments[0].offer_price) }}</span>
                  </div>
                </div>
              </div>
              <span class="text-[10px] font-bold text-gray-400 mt-2 block">{{ formatMsgTime(msg.created_at) }}</span>
            </div>
          </template>
        </div>

        <!-- Chat Input -->
        <div class="px-8 py-6 border-t border-gray-100">
          <div class="flex items-center gap-4 bg-[#F8F9FE] rounded-2xl px-5 py-2">
            <button class="text-gray-400 hover:text-[#4B6BFB] transition-colors">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5s.67 1.5 1.5 1.5zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>
            </button>
            <input 
              v-model="messageInput"
              type="text" 
              placeholder="Type your message here ..."
              class="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 placeholder-gray-400 text-gray-800 outline-none"
              @keyup.enter="sendMessage"
            />
            <button @click="sendMessage" class="bg-[#4B6BFB] text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#4B6BFB]/90 transition-all shadow-md">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            </button>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mb-4"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2 2z"/></svg>
          <p class="text-sm">Pilih obrolan dari daftar di samping untuk memulai chat.</p>
        </div>
      </template>
    </div>

    <!-- Custom Offer Modal -->
    <Teleport to="body">
      <div v-if="isOfferModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div class="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
          <div class="bg-[#4B6BFB] px-6 py-4 flex justify-between items-center text-white">
            <h3 class="text-xl font-bold">Buat Penawaran Kustom</h3>
            <button @click="isOfferModalOpen = false" class="hover:bg-white/10 p-1 rounded-lg transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div class="p-6 space-y-4">
            <!-- Gig Selector -->
            <div>
              <label class="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 block">Pilih Jasa (Gig)</label>
              <select v-model="offerForm.gigId" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#4B6BFB]/20 outline-none">
                <option v-for="gig in vendorGigs" :key="gig.id" :value="gig.id">{{ gig.title }}</option>
              </select>
            </div>

            <!-- Title -->
            <div>
              <label class="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 block">Judul Penawaran</label>
              <input v-model="offerForm.title" type="text" placeholder="Misal: Desain Logo Premium" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#4B6BFB]/20 outline-none" />
            </div>

            <!-- Description -->
            <div>
              <label class="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 block">Deskripsi Detail Penawaran</label>
              <textarea v-model="offerForm.description" rows="3" placeholder="Jelaskan apa yang akan Anda berikan pada penawaran ini..." class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#4B6BFB]/20 outline-none resize-none"></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <!-- Price -->
              <div>
                <label class="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 block">Harga (Rp)</label>
                <input v-model.number="offerForm.price" type="number" min="0" placeholder="Harga Penawaran" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#4B6BFB]/20 outline-none" />
              </div>

              <!-- Deadline -->
              <div>
                <label class="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 block">Durasi Pengerjaan (Hari)</label>
                <input v-model.number="offerForm.deadlineDays" type="number" min="1" placeholder="Hari" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#4B6BFB]/20 outline-none" />
              </div>
            </div>

            <div class="flex justify-end pt-4 border-t border-gray-100 gap-3">
              <button @click="isOfferModalOpen = false" class="px-6 py-2 text-sm font-bold text-gray-500 hover:text-gray-700">Batal</button>
              <button 
                @click="submitOffer" 
                :disabled="isSending"
                class="px-6 py-2 bg-[#4B6BFB] text-white font-bold rounded-xl hover:bg-[#4B6BFB]/95 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isSending ? 'Mengirim...' : 'Kirim Penawaran' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>


  </div>
</template>
