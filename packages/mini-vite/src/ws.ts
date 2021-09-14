import WebSocket from 'ws'
import { HMRPayload } from './type/hmr'

export interface WebSocketServer {
    send(payload: HMRPayload): void
    sendDebug(payload: any): void
    close(): Promise<void>
}

// safely handles circular references
// @ts-ignore
const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (_: any, value: any) => {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                return 'circular: '+value.toString();
            }
            seen.add(value);
        }
        return value;
    };
};

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
        sendDebug(payload: any) {
            if (process.env.DEBUG) {
                payload = {
                    type: 'debug',
                    payload
                }

                // @ts-ignore
                const stringified = JSON.stringify((payload), getCircularReplacer())
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(stringified)
                    }
                })
            }
        },
        close() {
            return new Promise((resolve, reject) => {
                wss.close((err) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve()
                    }
                })
            })
        }
    }
}