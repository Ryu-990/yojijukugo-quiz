# 四字熟語協力クイズゲーム - Nuxt × WebSocket

2人で協力して四字熟語を完成させる、リアルタイム通信型のクイズゲームです。Socket.IO による WebSocket 通信と Nuxt 3 を組み合わせたシンプルかつ楽しい教育・交流アプリです。

## 🧩 機能概要

- 🎮 2人協力型の四字熟語クイズ（リアルタイム同期）
- 🔠 プレイヤーAとBが交互に文字を入力して答えを完成
- 🕒 タイマー制限あり、制限時間切れで次の問題へ
- 📢 ゲーム内チャット機能
- 📈 スコアボード表示（正解数・タイムアウト回数）
- 🔁 再マッチング（連戦プレイ）

## 🛠️ 使用技術

- [Nuxt 3](https://nuxt.com/)
- [Vue 3](https://vuejs.org/)
- [Socket.IO](https://socket.io/)
- TypeScript（サーバー側のみ）
- HTML / CSS（Scoped Style）

## 📦 セットアップ

### 前提条件

- Node.js 18+ 推奨
- npm または yarn
- Git

### クローン & インストール

```bash
git clone https://github.com/your-username/yojijukugo-quiz.git
cd yojijukugo-quiz
npm install
````

### 開発サーバー起動

```bash
npm run dev
```

### 本番ビルド & 起動

```bash
npm run build
npm start
```

## 📁 ディレクトリ構成（主なファイル）

```sh
.
├── pages/
│   └── index.vue              # メインゲーム画面（完成版）
├── components/
│   ├── GameChat.vue           # チャットコンポーネント
│   └── CharacterInput.vue     # 入力コンポーネント
├── server/
│   ├── websocket.js           # WebSocket サーバーロジック
│   ├── middleware/
│   │   └── websocket.ts       # Nuxt middleware統合
│   └── api/
│       └── socket.ts          # APIとしてのWebSocket監視
├── server.js                  # HTTP + Nuxt サーバー統合エントリ
├── nuxt.config.ts             # Nuxt 設定ファイル
├── package.json
└── README.md
```

## 💡 補足情報

* 同時接続数が偶数になると自動マッチングされます。
* タイマー終了時や片方のプレイヤー退出時には状態がリセットされます。
* プレイヤー名の入力必須。

## 📜 ライセンス

MIT License

---

## 👤 作者

* [Ryu Hazako](https://https://github.com/Ryu-990)

---

```
