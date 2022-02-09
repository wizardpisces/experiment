import {
    createApp as CreateClientApp,
    createSSRApp
} from 'mini-vue'

import Layout from './Layout'
import App from './App'
import { createRouter } from './router'

// SSR requires a fresh app instance per request, therefore we export a function
// that creates a fresh app instance. If using Vuex, we'd also be creating a
// fresh store here.
const isBrowser = typeof window !== 'undefined';
export function createApp() {
    let app = isBrowser ? CreateClientApp(App) : createSSRApp(Layout)

    const router = createRouter()
    // app.use(router)
    return { app, router }
}
