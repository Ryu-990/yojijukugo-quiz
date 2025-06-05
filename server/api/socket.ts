import { Server } from 'socket.io'
import { defineEventHandler } from 'h3'

export default defineEventHandler((event) => {
    // API エンドポイントとして定義するだけで、
    // 実際の WebSocket 処理は middleware で行う
    return { status: 'WebSocket server is running' }
})