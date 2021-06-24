import WebSocket from 'ws'
import { HMRPayload } from './type/hmr'

export interface WebSocketServer {
    send(payload: HMRPayload): void
    close(): Promise<void>
}

export function createWebSocketServer(): WebSocketServer {
    let wss: WebSocket.Server = new WebSocket.Server({ port: 24679 })
    wss.on('connection', (socket) => {
        socket.send(JSON.stringify({ type: 'connected' }))
    })
    return {
        send(payload: HMRPayload) {
            const stringified = JSON.stringify(payload)
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(stringified)
                }
            })
        },
        close() {
            return new Promise((resolve, reject) => {
                wss.close((err) => {
                    if (err) {
                        reject(err)
                    }else{
                        resolve()
                    }
                })
            })
        }
    }
}