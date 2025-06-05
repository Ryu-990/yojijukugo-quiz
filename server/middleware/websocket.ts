import { defineEventHandler } from 'h3'
import setupWebSocketServer from '../websocket'

export default defineEventHandler((event) => {
  const { req, res } = event.node

  // WebSocketサーバーをHTTPサーバーに接続
  // この関数は最初の呼び出し時にのみWebSocketサーバーをセットアップする
  const socket: any = res.socket as any;
  if (socket?.server && !socket.server.io) {
    console.log('Setting up Socket.IO server')
    socket.server.io = setupWebSocketServer(socket.server)
  }
})