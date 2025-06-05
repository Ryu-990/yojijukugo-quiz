<template>
  <div class="game-status">
    <div v-if="status === 'waiting'" class="status waiting">
      対戦相手を待っています...
      <div class="spinner"></div>
    </div>
    <div v-else-if="status === 'correct'" class="status correct">
      正解！次の問題に進みます...
    </div>
    <div v-else-if="status === 'timeUp'" class="status time-up">
      時間切れ！正解は「{{ correctAnswer }}」です
    </div>
    <div v-else-if="status === 'playerLeft'" class="status player-left">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
defineProps({
    status: {
        type: String,
        default: 'playing' // 'waiting', 'correct', 'timeUp', 'playerLeft', 'playing'
    },
    correctAnswer: {
        type: String,
        default: ''
    },
    message: {
        type: String,
        default: ''
    }
});
</script>

<style scoped>
.game-status {
    margin: 20px 0;
    padding: 15px;
    border-radius: 5px;
    text-align: center;
}

.status {
    padding: 15px;
    border-radius: 5px;
    font-size: 18px;
    font-weight: bold;
}

.waiting {
    background-color: #f0f4c3;
    color: #827717;
}

.correct {
    background-color: #dff2bf;
    color: #4f8a10;
}

.time-up {
    background-color: #ffecb3;
    color: #ff6f00;
}

.player-left {
    background-color: #ffcdd2;
    color: #c62828;
}

.spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border-left-color: #09f;
    animation: spin 1s linear infinite;
    margin: 10px auto 0;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>
```

#### components/ScoreBoard.vue
```vue
<template>
    <div class="scoreboard">
        <h3>スコアボード</h3>
        <div class="scores">
            <div class="score">
                <div class="score-label">正解数:</div>
                <div class="score-value">{{ score.correct }}</div>
            </div>
            <div class="score">
                <div class="score-label">タイムアウト:</div>
                <div class="score-value">{{ score.timeouts }}</div>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
  score: {
    type: Object,
    default: () => ({
      correct: 0,
      timeouts: 0
    })
  }
});
</script>

<style scoped>
.scoreboard {
    background-color: #e8eaf6;
    padding: 15px;
    border-radius: 5px;
    margin-top: 20px;
}

.scores {
    display: flex;
    justify-content: center;
    gap: 20px;
}

.score {
    display: flex;
    align-items: center;
    gap: 5px;
}

.score-label {
    font-weight: bold;
}

.score-value {
    background-color: #fff;
    padding: 5px 10px;
    border-radius: 3px;
    min-width: 30px;
    text-align: center;
}
</style>