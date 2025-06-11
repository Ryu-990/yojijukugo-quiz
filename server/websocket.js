import { Server } from 'socket.io';

let io;
let players = [];
let currentRoomId = 1;
let rooms = {};

// 四字熟語データの拡充  
const quizData = new Map([
  ['一石二鳥', 'ひとつの行動で二つの利益を得ること'],
  ['四面楚歌', '味方がおらず孤立無援の状態'],
  ['前人未到', '過去に誰も到達したことのない境地'],
  ['一期一会', '今この瞬間の出会いを大切にする心構え'],
  ['臥薪嘗胆', '苦難に耐えて大きな目標達成のために努力すること'],
  ['温故知新', '古いことを学び、新しい知識や道理を見出すこと'],
  ['因果応報', '良い行いには良い結果が、悪い行いには悪い結果が返ってくること'],
  ['魑魅魍魎', '奇怪で不気味なもののたとえ'],
  ['天衣無縫', 'きわめて自然で、少しの欠点もないさま'],
  ['起死回生', '死にかけたものを生き返らせること'],
  ['百花繚乱', '様々な美しいものが咲き誇る様子'],
  ['電光石火', '電光や火花のように素早い様子'],
  ['明鏡止水', '心が澄み切って、何の迷いもない状態'],
  ['八方美人', '誰に対してもいい顔をする人'],
  ['大義名分', '行動の正当な理由や名目'],
  ['唯我独尊', '自分だけが尊いと思う考え方'],
]);

export default function (httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // プレイヤー参加処理  
    socket.on('join', (playerName) => {
      const player = {
        id: socket.id,
        name: playerName,
        roomId: null,
        score: {
          correct: 0,
          timeouts: 0
        }
      };

      players.push(player);
      console.log(`Player ${playerName} joined`);

      // マッチメイキング  
      matchPlayers();
    });

    // 文字入力処理  
    socket.on('inputCharacter', ({ position, character }) => {
      const player = players.find(p => p.id === socket.id);
      if (!player?.roomId) return;

      const room = rooms[player.roomId];
      if (!room || room.gameStatus !== 'playing') return;

      // 入力可能なポジションかチェック  
      const isPlayerA = player.id === room.playerA.id;
      if ((isPlayerA && (position === 0 || position === 2)) ||
        (!isPlayerA && (position === 1 || position === 3))) {
        room.currentAnswer[position] = character;

        // 入力状況を全員に通知  
        io.to(player.roomId).emit('updateAnswer', room.currentAnswer);

        // 解答チェック  
        checkAnswer(room);
      }
    });

    // リトライ要求  
    socket.on('requestNewGame', () => {
      const player = players.find(p => p.id === socket.id);
      if (!player) return;

      // 新しいゲーム要求処理  
      handleNewGameRequest(player);
    });

    // 切断処理  
    socket.on('disconnect', () => {
      const playerIndex = players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        const player = players[playerIndex];

        // ルームがあれば解散  
        if (player.roomId && rooms[player.roomId]) {
          io.to(player.roomId).emit('playerLeft', {
            message: `${player.name} が退出しました。ゲームを終了します。`
          });

          // ルームのもう一人のプレイヤーにも通知  
          const otherPlayerId = rooms[player.roomId].playerA.id === player.id ?
            rooms[player.roomId].playerB.id : rooms[player.roomId].playerA.id;

          const otherPlayer = players.find(p => p.id === otherPlayerId);
          if (otherPlayer) {
            otherPlayer.roomId = null;
          }

          delete rooms[player.roomId];
        }

        players.splice(playerIndex, 1);
        console.log(`Player ${player.name} disconnected`);
      }
    });
  });

  return io;
}

function matchPlayers() {
  const waitingPlayers = players.filter(p => !p.roomId);

  if (waitingPlayers.length >= 2) {
    const playerA = waitingPlayers[0]; // 修正
    const playerB = waitingPlayers[1]; // 修正

    const roomId = `room-${currentRoomId++}`;
    playerA.roomId = roomId;
    playerB.roomId = roomId;

    // ルーム作成  
    const quiz = getRandomQuiz();
    rooms[roomId] = {
      id: roomId,
      playerA,
      playerB,
      quiz: quiz.yojijukugo,
      hint: quiz.hint,
      currentAnswer: ['', '', '', ''],
      timer: 30,
      timerInterval: null,
      gameStatus: 'playing', // 'playing', 'correct', 'timeUp'  
      usedQuizzes: [quiz.yojijukugo] // 出題済みの問題を記録  
    };

    // プレイヤーをルームに参加させる  
    io.sockets.sockets.get(playerA.id).join(roomId);
    io.sockets.sockets.get(playerB.id).join(roomId);

    // ゲーム開始通知  
    io.to(roomId).emit('gameStart', {
      roomId,
      playerA: {
        id: playerA.id,
        name: playerA.name,
        score: playerA.score
      },
      playerB: {
        id: playerB.id,
        name: playerB.name,
        score: playerB.score
      },
      hint: rooms[roomId].hint,
      //quiz: rooms[roomId].quiz, // ← 追加
      timer: rooms[roomId].timer
    });

    // タイマー開始  
    startTimer(roomId);
  }
}

// ランダムに問題を選択（出題済みを除外）  
function getRandomQuiz(roomId) {
  const room = roomId ? rooms[roomId] : null;
  const usedQuizzes = room ? room.usedQuizzes : [];

  // 出題済みを除いたクイズデータを作成  
  const availableQuizzes = Array.from(quizData.entries())
    .filter(([yojijukugo]) => !usedQuizzes.includes(yojijukugo));

  // すべて出題済みなら全問リセット  
  if (availableQuizzes.length === 0) {
    if (room) room.usedQuizzes = [];
    return getRandomQuiz(roomId);
  }

  const randomIndex = Math.floor(Math.random() * availableQuizzes.length);
  const [yojijukugo, hint] = availableQuizzes[randomIndex];
  return { yojijukugo, hint };
}

// タイマー処理  
function startTimer(roomId) {
  const room = rooms[roomId];
  if (!room) return;

  room.timerInterval = setInterval(() => {
    room.timer--;
    io.to(roomId).emit('updateTimer', room.timer);

    if (room.timer <= 0) {
      clearInterval(room.timerInterval);
      room.gameStatus = 'timeUp';

      // プレイヤーのタイムアウトスコアを更新  
      if (room.playerA && room.playerB) {
        room.playerA.score.timeouts++;
        room.playerB.score.timeouts++;
      }

      io.to(roomId).emit('timeUp', {
        correctAnswer: room.quiz
      });

      // 少し待ってから次の問題  
      setTimeout(() => {
        if (rooms[roomId]) {
          resetRoom(roomId);
        }
      }, 3000);
    }
  }, 1000);
}

// 解答チェック  
function checkAnswer(room) {
  const answer = room.currentAnswer.join('');
  if (answer.length === 4 && answer === room.quiz) {
    clearInterval(room.timerInterval);
    room.gameStatus = 'correct';

    // プレイヤーの正解スコアを更新  
    room.playerA.score.correct++;
    room.playerB.score.correct++;

    io.to(room.id).emit('correct', {
      message: '正解です！',
      answer: answer
    });

    // 少し待ってから次の問題  
    setTimeout(() => {
      if (rooms[room.id]) {
        resetRoom(room.id);
      }
    }, 3000);
  }
}

// ルームをリセットして次の問題へ  
function resetRoom(roomId) {
  const room = rooms[roomId];
  if (!room) return;

  const quiz = getRandomQuiz(roomId);
  room.quiz = quiz.yojijukugo;
  room.hint = quiz.hint;
  room.currentAnswer = ['', '', '', ''];
  room.timer = 30;
  room.gameStatus = 'playing';

  // 出題済みに追加  
  room.usedQuizzes.push(quiz.yojijukugo);

  io.to(roomId).emit('nextQuestion', {
    hint: room.hint,
    timer: room.timer,
    currentAnswer: room.currentAnswer,
    quiz: room.quiz // 追加
  });

  startTimer(roomId);
}

// 新しいゲーム要求の処理  
function handleNewGameRequest(player) {
  // すでにルームに所属していれば何もしない  
  if (player.roomId) return;

  // マッチング処理を実行  
  matchPlayers();
}  