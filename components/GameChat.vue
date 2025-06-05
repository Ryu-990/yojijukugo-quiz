<template>
  <div class="game-chat">
    <h3>チャット</h3>
    <div class="chat-messages" ref="chatContainer">
      <div
        v-for="(msg, idx) in messages"
        :key="idx"
        class="chat-message"
        :class="{ 'my-message': msg.senderId === myId }"
      >
        <div class="message-header">
          <span class="sender-name">{{ msg.senderName }}</span>
          <span class="timestamp">{{ formatTime(msg.timestamp) }}</span>
        </div>
        <div class="message-content">{{ msg.message }}</div>
      </div>
    </div>
    <div class="chat-input">
      <input
        v-model="newMessage"
        type="text"
        placeholder="メッセージを入力..."
        @keyup.enter="sendMessage"
      />
      <button @click="sendMessage">送信</button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  myId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['send-message']);

const messages = ref([]);
const newMessage = ref('');
const chatContainer = ref(null);

// メッセージ送信
function sendMessage() {
  if (newMessage.value.trim()) {
    emit('send-message', newMessage.value.trim());
    newMessage.value = '';
  }
}

// 新しいメッセージを追加
function addMessage(message) {
  messages.value.push(message);
  scrollToBottom();
}

// チャット履歴の最下部にスクロール
function scrollToBottom() {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  });
}

// 時刻フォーマット
function formatTime(timestamp) {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

// メッセージの受信をセットアップ
function setupChatListener(socket) {
  socket.on('chatMessage', (message) => {
    addMessage(message);
  });
}

// 外部からのインターフェース
defineExpose({
  addMessage,
  setupChatListener
});
</script>

<style scoped>
.game-chat {
  margin-top: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
  overflow: hidden;
  height: 300px;
  display: flex;
  flex-direction: column;
}

h3 {
  margin: 0;
  padding: 10px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  background-color: #fff;
}

.chat-message {
  margin-bottom: 10px;
  padding: 8px;
  border-radius: 5px;
  background-color: #f1f0f0;
  max-width: 80%;
}

.my-message {
  background-color: #e3f2fd;
  margin-left: auto;
}

.message-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.8em;
  margin-bottom: 5px;
}

.sender-name {
  font-weight: bold;
}

.timestamp {
  color: #666;
}

.message-content {
  word-break: break-word;
}

.chat-input {
  display: flex;
  border-top: 1px solid #ddd;
  padding: 10px;
  background-color: #f9f9f9;
}

.chat-input input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 3px;
  margin-right: 10px;
}
.chat-input button {
  padding: 8px 15px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}
</style>