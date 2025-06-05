<template>
  <div class="container">
    <header>
      <h1>四字熟語協力クイズゲーム</h1>
    </header>

    <main>
      <!-- ログインフォーム -->
      <div v-if="gameState.status === 'login'" class="login-form">
        <h2>プレイヤー名を入力してください</h2>
        <input v-model="inputPlayerName" type="text" placeholder="あなたの名前" class="name-input" @keyup.enter="joinGame" />
        <button @click="joinGame" class="join-button" :disabled="!inputPlayerName.trim()">ゲームに参加</button>
      </div>

      <!-- 待機ルーム -->
      <div v-else-if="gameState.status === 'waiting'" class="waiting-room">
        <h2>対戦相手を待っています...</h2>
        <p>待機中のプレイヤー数: {{ gameState.waitingCount || 1 }}</p>
        <div class="spinner"></div>
        <button @click="cancelWaiting" class="cancel-button">キャンセル</button>
      </div>

      <!-- ゲーム画面 -->
      <div v-else-if="gameState.status === 'playing'" class="game-container">
        <div class="players-info">
          <div class="player player-a" :class="{ 'current-player': isPlayerA }">
            <strong>{{ gameState.playerA.name }}</strong>
            <span class="role">(1文字目・3文字目を担当)</span>
          </div>
          <div class="vs">VS</div>
          <div class="player player-b" :class="{ 'current-player': !isPlayerA }">
            <strong>{{ gameState.playerB.name }}</strong>
            <span class="role">(2文字目・4文字目を担当)</span>
          </div>
        </div>

        <div class="timer" :class="{ 'warning': gameState.timer <= 10 }">
          残り時間: {{ gameState.timer }}秒
        </div>

        <div class="quiz-hint">
          <h3>ヒント:</h3>
          <p>{{ gameState.hint }}</p>
        </div>

        <div class="answer-container">
          <div v-for="(char, index) in gameState.currentAnswer" :key="index" class="character-input">
            <input
              type="text"
              v-model="gameState.currentAnswer[index]"
              maxlength="1"
              class="input-field"
              :class="{
                'player-a': isPlayerA && (index === 0 || index === 2),
                'player-b': !isPlayerA && (index === 1 || index === 3)
              }"
              :disabled="gameState.roundStatus !== 'playing' ||
                        !(isPlayerA && (index === 0 || index === 2)) &&
                        !(!isPlayerA && (index === 1 || index === 3))"
              @input="handleInputCharacter(index, $event)"
            />
          </div>
        </div>

        <div v-if="gameState.roundStatus === 'correct'" class="info-banner success">
          <p>正解！次の問題に進みます...</p>
        </div>

        <div v-if="gameState.roundStatus === 'timeUp'" class="info-banner warning">
          <p>時間切れ！正解は「{{ gameState.correctAnswer }}」です</p>
        </div>

        <div class="scoreboard">
          <h3>スコアボード</h3>
          <div class="scores">
            <div class="score">
              <div class="score-label">正解数:</div>
              <div class="score-value">{{ gameState.score.correct }}</div>
            </div>
            <div class="score">
              <div class="score-label">タイムアウト:</div>
              <div class="score-value">{{ gameState.score.timeouts }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- プレイヤー退出 -->
      <div v-else-if="gameState.status === 'playerLeft'" class="player-left">
        <h2>{{ gameState.message }}</h2>
        <button @click="resetGame" class="join-button">トップに戻る</button>
      </div>
    </main>

    <div class="instructions">
      <h3>遊び方</h3>
      <p>
        2人のプレイヤーで協力して四字熟語を完成させよう！<br />
        プレイヤーA（1人目）は1文字目と3文字目、<br />
        プレイヤーB（2人目）は2文字目と4文字目を入力します。<br />
        ヒントを見て制限時間内に正解を完成させましょう！
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import io from 'socket.io-client';

const socket = ref(null);
const baseURL = process.dev ? 'http://localhost:3000' : window.location.origin;

const inputPlayerName = ref('');
const isPlayerA = ref(false);
const gameState = reactive({
  status: 'login',
  roundStatus: 'playing',
  roomId: null,
  playerA: { id: '', name: '' },
  playerB: { id: '', name: '' },
  hint: '',
  timer: 30,
  currentAnswer: ['', '', '', ''],
  correctAnswer: '',
  message: '',
  waitingCount: 0,
  score: { correct: 0, timeouts: 0 }
});

function joinGame() {
  if (!inputPlayerName.value.trim()) return;
  if (!socket.value) {
    socket.value = io(baseURL);
    setupSocketHandlers();
  }
  socket.value.emit('join', inputPlayerName.value.trim());
  gameState.status = 'waiting';
}

function cancelWaiting() {
  if (socket.value) {
    socket.value.emit('cancelWaiting');
    resetGame();
  }
}

function resetGame() {
  Object.assign(gameState, {
    status: 'login',
    roundStatus: 'playing',
    roomId: null,
    playerA: { id: '', name: '' },
    playerB: { id: '', name: '' },
    hint: '',
    timer: 30,
    currentAnswer: ['', '', '', ''],
    correctAnswer: '',
    message: '',
    waitingCount: 0,
    score: { correct: 0, timeouts: 0 }
  });
}

function handleInputCharacter(index, event) {
  const character = event.target.value.slice(-1);
  socket.value.emit('inputCharacter', { position: index, character });
}

function setupSocketHandlers() {
  socket.value.on('updateWaitingCount', count => gameState.waitingCount = count);
  socket.value.on('gameStart', data => {
    Object.assign(gameState, {
      status: 'playing',
      roundStatus: 'playing',
      roomId: data.roomId,
      playerA: data.playerA,
      playerB: data.playerB,
      hint: data.hint,
      timer: data.timer,
      currentAnswer: ['', '', '', '']
    });
    isPlayerA.value = socket.value.id === data.playerA.id;
  });
  socket.value.on('updateTimer', timer => gameState.timer = timer);
  socket.value.on('updateAnswer', answer => gameState.currentAnswer = answer);
  socket.value.on('correct', () => {
    gameState.roundStatus = 'correct';
    gameState.score.correct++;
  });
  socket.value.on('timeUp', data => {
    gameState.roundStatus = 'timeUp';
    gameState.correctAnswer = data.correctAnswer;
    gameState.score.timeouts++;
  });
  socket.value.on('playerLeft', data => {
    gameState.status = 'playerLeft';
    gameState.message = data.message;
  });
}
</script>