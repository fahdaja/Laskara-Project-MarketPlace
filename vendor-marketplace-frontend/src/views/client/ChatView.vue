<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { StreamChat } from 'stream-chat'
import { useAuth } from '../../composables/useAuth'
import api from '../../api/axios'

const router = useRouter()
const { user } = useAuth()

const chatClient = ref<StreamChat | null>(null)
const channels = ref<any[]>([])
const activeChannelId = ref<string | null>(null)
const messageText = ref('')
const isLoading = ref(true)
const isSending = ref(false)

const messagesContainer = ref<HTMLElement | null>(null)
const messageTrigger = ref(0)

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
  if (!messageText.value.trim() || !activeChannel.value || isSending.value) return
  isSending.value = true
  try {
    await activeChannel.value.sendMessage({
      text: messageText.value
    })
    messageText.value = ''
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

async function acceptOffer(offerId: number, messageId: string) {
  try {
    isLoading.value = true
    const res = await api.patch(`/custom-offers/${offerId}/accept`, { messageId })
    alert('Penawaran berhasil diterima! Mengalihkan ke halaman pembayaran...')
    const order = res.data.order
    router.push(`/jelajahi/${order.gigId}/checkout?orderId=${order.id}&price=${order.totalAmount}&plan=Custom Offer`)
  } catch (err: any) {
    console.error('Failed to accept offer:', err)
    alert(err.response?.data?.message || 'Gagal menerima penawaran.')
  } finally {
    isLoading.value = false
  }
}

async function rejectOffer(offerId: number, messageId: string) {
  try {
    isLoading.value = true
    await api.patch(`/custom-offers/${offerId}/reject`, { messageId })
    alert('Penawaran berhasil ditolak.')
    await queryChannels()
  } catch (err: any) {
    console.error('Failed to reject offer:', err)
    alert(err.response?.data?.message || 'Gagal menolak penawaran.')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  initChat()
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target) } })
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' })
  document.querySelectorAll('.anim-in').forEach((el) => observer.observe(el))
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
  <div class="chat-container">
    <div class="chat-layout anim-in">
      
      <!-- Sidebar -->
      <aside class="chat-sidebar">
        <!-- Sidebar Header -->
        <div class="chat-sidebar__header">
          <button class="chat-sidebar__filter">
            Obrolan Chat
          </button>
        </div>

        <!-- Chat List -->
        <div class="chat-list">
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
            class="chat-item"
            :class="{ 'chat-item--active': activeChannelId === chat.id }"
            @click="selectChannel(chat.id)"
          >
            <img :src="chat.avatar" :alt="chat.name" class="chat-item__avatar" />
            <div class="chat-item__content">
              <div class="chat-item__top">
                <h4 class="chat-item__name">{{ chat.name }}</h4>
              </div>
              <p class="chat-item__last-message">{{ chat.lastMessage }}</p>
              <div class="chat-item__time" v-if="chat.time">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {{ chat.time }}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Chat Area -->
      <main class="chat-main">
        <template v-if="activeChannel">
          <!-- Chat Header -->
          <header class="chat-header">
            <div class="chat-header__user">
              <img :src="getOtherMember(activeChannel)?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(getOtherMember(activeChannel)?.name || 'User')}&background=3B5BDB&color=fff`" alt="User avatar" class="chat-header__avatar" />
              <h3 class="chat-header__name">{{ getOtherMember(activeChannel)?.name || 'Merchant' }}</h3>
            </div>
          </header>

          <!-- Chat Messages -->
          <div class="chat-messages" ref="messagesContainer">
            <div 
              v-for="msg in chatMessages" 
              :key="msg.id" 
              class="message-wrapper"
              :class="msg.user?.id === String(user?.id) ? 'message-wrapper--me' : 'message-wrapper--them'"
            >
              <!-- Detect Custom Offer Attachment -->
              <template v-if="msg.attachments && msg.attachments.length > 0 && msg.attachments[0].type === 'custom_offer'">
                <div class="offer-card">
                  <div class="offer-card__header">
                    <h4 class="offer-card__title">Penawaran Kustom</h4>
                  </div>
                  <div class="offer-card__body">
                    <h5 class="offer-card__item-title">{{ msg.text.replace('📦 Penawaran Baru: ', '') }}</h5>
                    <p class="offer-card__item-desc">Penawaran kustom khusus untuk kebutuhan proyek Anda.</p>
                    
                    <div class="offer-card__meta">
                      <div class="meta-block">
                        <span class="meta-label">HARGA PENAWARAN</span>
                        <strong class="meta-value" style="color: #3B5BDB;">{{ formatPrice(msg.attachments[0].offer_price) }}</strong>
                      </div>
                    </div>
                  </div>
                  
                  <div class="offer-card__actions" v-if="msg.attachments[0].status === 'PENDING'">
                    <button class="btn-accept" @click="acceptOffer(msg.attachments[0].offer_id, msg.id)">Terima Tawaran</button>
                    <button class="btn-reject" @click="rejectOffer(msg.attachments[0].offer_id, msg.id)">Tolak</button>
                  </div>
                  <div class="offer-card__actions" v-else-if="msg.attachments[0].status === 'ACCEPTED'">
                    <span style="font-weight: 700; color: #16A34A; font-size: 0.875rem;">✅ Penawaran Diterima</span>
                  </div>
                  <div class="offer-card__actions" v-else-if="msg.attachments[0].status === 'REJECTED'">
                    <span style="font-weight: 700; color: #DC2626; font-size: 0.875rem;">❌ Penawaran Ditolak</span>
                  </div>
                </div>
                <span class="message-time">{{ formatMsgTime(msg.created_at) }}</span>
              </template>

              <!-- Standard Message -->
              <template v-else>
                <div class="message-bubble">{{ msg.text }}</div>
                <span class="message-time">{{ formatMsgTime(msg.created_at) }}</span>
              </template>
            </div>
          </div>

          <!-- Chat Input -->
          <footer class="chat-input-area">
            <form @submit.prevent="sendMessage" class="chat-input-container">
              <div class="input-wrapper">
                <input v-model="messageText" type="text" placeholder="Tulis pesan Anda di sini..." :disabled="isSending" />
              </div>
              <button type="submit" class="btn-send" :disabled="isSending || !messageText.trim()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </form>
          </footer>
        </template>
        <template v-else>
          <div class="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mb-4"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 12-2h14a2 2 0 0 1 2 2z"/></svg>
            <p class="text-sm">Pilih obrolan dari daftar di samping untuk memulai chat.</p>
          </div>
        </template>
      </main>

    </div>
  </div>
</template>


<style scoped>
/* Animations */
.anim-in { opacity: 0; transform: translateY(20px); transition: all 0.8s cubic-bezier(0.16,1,0.3,1); }
.anim-in.visible { opacity: 1; transform: translateY(0); }

/* Layout container to respect navbar */
.chat-container {
  height: calc(100vh - 64px); /* Assuming navbar is 64px tall */
  background-color: #F8FAFC;
  padding: 1.5rem;
  display: flex;
  justify-content: center;
}

.chat-layout {
  width: 100%;
  max-width: 1200px;
  background-color: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  display: flex;
  overflow: hidden;
  border: 1px solid #E2E8F0;
}

/* Sidebar */
.chat-sidebar {
  width: 320px;
  border-right: 1px solid #E2E8F0;
  display: flex;
  flex-direction: column;
  background-color: #FFFFFF;
}

.chat-sidebar__header {
  padding: 1rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #E2E8F0;
}

.chat-sidebar__filter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 1.125rem;
  color: #1E293B;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.chat-sidebar__more {
  background: none;
  border: none;
  color: #64748B;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-sidebar__search {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #E2E8F0;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #F8FAFC;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
}

.search-input-wrapper input {
  border: none;
  background: transparent;
  width: 100%;
  font-size: 0.875rem;
  color: #334155;
  outline: none;
}

.search-input-wrapper input::placeholder {
  color: #94A3B8;
}

/* Chat List */
.chat-list {
  flex: 1;
  overflow-y: auto;
}

.chat-item {
  display: flex;
  gap: 1rem;
  padding: 1rem 1.25rem;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #F1F5F9;
}

.chat-item:hover {
  background-color: #F8FAFC;
}

.chat-item--active {
  background-color: #F8FAFC;
}

.chat-item__avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.chat-item__content {
  flex: 1;
  min-width: 0;
}

.chat-item__top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.25rem;
}

.chat-item__name {
  font-weight: 600;
  font-size: 0.9375rem;
  color: #1E293B;
  margin: 0;
}

.chat-item__star {
  background: none;
  border: none;
  color: #CBD5E1;
  cursor: pointer;
  padding: 0;
}

.chat-item__star--active {
  color: #3B5BDB;
}

.chat-item__last-message {
  font-size: 0.875rem;
  color: #64748B;
  margin: 0 0 0.5rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-item__time {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #94A3B8;
}

/* Main Chat Area */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #FFFFFF;
}

.chat-header {
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #E2E8F0;
}

.chat-header__user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.chat-header__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.chat-header__name {
  font-weight: 600;
  font-size: 1rem;
  color: #1E293B;
  margin: 0;
}

.btn-create-offer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #3B5BDB;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-create-offer:hover {
  background-color: #2e4aae;
}

/* Messages Area */
.chat-messages {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.message-wrapper {
  display: flex;
  flex-direction: column;
  max-width: 70%;
}

.message-wrapper--them {
  align-self: flex-start;
  align-items: flex-start;
}

.message-wrapper--me {
  align-self: flex-end;
  align-items: flex-end;
}

.message-bubble {
  padding: 0.75rem 1rem;
  border-radius: 16px;
  font-size: 0.9375rem;
  line-height: 1.5;
  white-space: pre-wrap;
}

.message-wrapper--them .message-bubble {
  background-color: #EBF1FF; /* Light blue matching design */
  color: #1E293B;
  border-bottom-left-radius: 4px;
}

.message-wrapper--me .message-bubble {
  background-color: #3B5BDB;
  color: #FFFFFF;
  border-bottom-right-radius: 4px;
}

.message-time {
  font-size: 0.75rem;
  color: #94A3B8;
  margin-top: 0.25rem;
}

/* Offer Card */
.offer-card {
  width: 400px;
  max-width: 100%;
  background-color: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  overflow: hidden;
}

.offer-card__header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #E2E8F0;
}

.offer-card__title {
  color: #3B5BDB;
  font-weight: 700;
  font-size: 1rem;
  margin: 0;
}

.offer-card__body {
  padding: 1.25rem;
}

.offer-card__item-title {
  font-weight: 700;
  font-size: 1.125rem;
  color: #000000;
  margin: 0 0 0.5rem 0;
}

.offer-card__item-desc {
  font-size: 0.875rem;
  color: #64748B;
  line-height: 1.5;
  margin: 0 0 1.5rem 0;
}

.offer-card__meta {
  display: flex;
  gap: 3rem;
}

.meta-block {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.meta-label {
  font-size: 0.75rem;
  color: #94A3B8;
  font-weight: 600;
  text-transform: uppercase;
}

.meta-value {
  font-size: 1rem;
  font-weight: 700;
  color: #000000;
}

.meta-value-with-icon {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 1rem;
  color: #000000;
}

.offer-card__actions {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  background-color: #FFFFFF;
  border-top: 1px solid #E2E8F0;
}

.btn-accept {
  flex: 1;
  background-color: #3B5BDB;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  padding: 0.75rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-accept:hover {
  background-color: #2e4aae;
}

.btn-reject {
  flex: 1;
  background-color: #FFFFFF;
  color: #3B5BDB;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 0.75rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-reject:hover {
  background-color: #F8FAFC;
}

/* Chat Input */
.chat-input-area {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid #E2E8F0;
  background-color: #FFFFFF;
}

.chat-input-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.input-wrapper {
  flex: 1;
  background-color: #F8FAFC;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  border: 1px solid #E2E8F0;
}

.input-wrapper input {
  width: 100%;
  border: none;
  background: transparent;
  font-size: 0.9375rem;
  color: #334155;
  outline: none;
}

.input-wrapper input::placeholder {
  color: #94A3B8;
}

.btn-send {
  background-color: #3B5BDB;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-send:hover {
  background-color: #2e4aae;
}
</style>
