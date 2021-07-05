export type HMRPayload = ConnectedPayload | UpdatePayload | FullReloadPayload
export interface ConnectedPayload {
    type: 'connected'
}
export interface UpdatePayload {
    type: 'update'
    updates: Update[]
}
export interface Update {
    type: 'js-update' | 'css-update'
    path: string
    acceptedPath: string
    timestamp: number
}
export interface FullReloadPayload {
    type: 'full-reload'
    path?: string
}