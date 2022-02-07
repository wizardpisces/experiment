import {
    // createApp,
    createSSRApp
} from 'mini-vue'

import App from './App'
import { createRouter } from './router'

// SSR requires a fresh app instance per request, therefore we export a function
// that creates a fresh app instance. If using Vuex, we'd also be creating a
// fresh store here.
export function createApp() {
    console.log('createSSRApp', createSSRApp)
    const app = createSSRApp(App)
    const router = createRouter()
    // app.use(router)
    return { app, router }
}
