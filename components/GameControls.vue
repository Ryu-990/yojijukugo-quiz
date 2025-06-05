<template>
    <div class="game-controls">
        <button @click="requestNewGame" class="control-button new-game-btn" :disabled="loading">
            新しいゲームを探す
        </button>

<div class="toggle-container">
    <input type="checkbox" id="sound-toggle" v-model="soundEnabled" class="visually-hidden">
    <label for="sound-toggle" class="switch">
        <span class="slider"></span>
    </label>
    <span>効果音: {{ soundEnabled ? 'ON' : 'OFF' }}</span>
</div>


        <button @click="showHelp = !showHelp" class="control-button help-btn">
            ゲームのルール
        </button>

        <div v-if="showHelp" class="help-modal">
            <div class="help-content">
                <button @click="showHelp = false" class="close-btn">×</button>
                <h3>四字熟語協力クイズのルール</h3>
                <ul>
                    <li>プレイヤーAは1文字目と3文字目を担当します</li>
                    <li>プレイヤーBは2文字目と4文字目を担当します</li>
                    <li>ヒントをもとに協力して四字熟語を完成させてください</li>
                    <li>制限時間は30秒です</li>
                    <li>正解すると次の問題に進みます</li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    socket: {
        type: Object,
        required: true
    },
    loading: {
        type: Boolean,
        default: false
    }
});

const soundEnabled = ref(true);
const showHelp = ref(false);

const emit = defineEmits(['sound-toggle']);

function requestNewGame() {
    props.socket.emit('requestRematch');
}

watch(soundEnabled, (newValue) => {
    emit('sound-toggle', newValue);
});
</script>

<style scoped>
.game-controls {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 15px;
    margin: 20px 0;
    padding: 15px;
    background-color: #f5f5f5;
}
.visually-hidden {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
}

</style>
