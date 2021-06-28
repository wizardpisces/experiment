import './env'

import { Update, HMRPayload} from '../type/hmr';

function warnFailedFetch(err: Error, path: string | string[]) {
    // if (!err.message.match('fetch')) {
    // }
    console.error(err)
    console.error(
        `[hmr] Failed to reload ${path}. ` +
        `This could be due to syntax errors or importing non-existent ` +
        `modules. (see errors above)`
    )
}

const socketPort = 24679

const socketProtocol = location.protocol === 'https:' ? 'wss' : 'ws'
const socketHost = `${location.hostname}:${socketPort}`
const base = '/'
const socket = new WebSocket(`${socketProtocol}://${socketHost}`, 'litepack-hmr')
// Listen for messages
socket.addEventListener('message', async ({ data }) => {
    handleMessage(JSON.parse(data))
})

async function fetchUpdate({ path, acceptedPath, timestamp }: Update) {
    const moduleMap = new Map()
    const isSelfUpdate = path === acceptedPath
    // make sure we only import each dep once
    const modulesToUpdate = new Set<string>()

    if (isSelfUpdate) {
        modulesToUpdate.add(path)
    }

    await Promise.all(Array.from(modulesToUpdate).map(async (dep) => {
        const [path, query] = dep.split(`?`)
        try {
            const newMod = await import(
                base +
                path.slice(1) +
                `?import&t=${timestamp}${query ? `&${query}` : ''}`
            )
            moduleMap.set(dep, newMod)
        } catch (e) {
            warnFailedFetch(e, dep)
        }
    }))

    return () => {
        // for (const { deps, fn } of qualifiedCallbacks) {
        //     fn(deps.map((dep) => moduleMap.get(dep)))
        // }
        const loggedPath = isSelfUpdate ? path : `${acceptedPath} via ${path}`
        console.log(`[litepack] hot updated: ${loggedPath}`)
    }
}

function handleMessage(payload: HMRPayload) {
    switch (payload.type) {
        case 'connected':
            console.log(`[litepack] connected.`)
            break
        case 'update':
            payload.updates.forEach((update) => {
                if (update.type === 'js-update') {
                    queueUpdate(fetchUpdate(update))
                }
            })
            break
    }
}

let pending = false
let queued: Promise<(() => void) | undefined>[] = []

/**
 * make sure change happen in handleMessage triggered order instead of await fetchUpdate finished order
 */
async function queueUpdate(p: Promise<(() => void) | undefined>) {
    queued.push(p)
    if (!pending) {
        pending = true
        // make below code run in queue end, in this scenario: to ensure below code run after payload.updates.foreach;
        await Promise.resolve()
        pending = false
        const loading = [...queued]
        queued = []
            ; (await Promise.all(loading)).forEach((fn) => fn && fn())

    }
}

async function waitForSuccessfulPing(ms = 1000) {
    // eslint-disable-next-line no-constant-condition
    while (true) {
        try {
            await fetch(`${base}__vitepack_ping`)
            break
        } catch (e) {
            await new Promise((resolve) => setTimeout(resolve, ms))
        }
    }
}

// ping server
socket.addEventListener('close', async ({ wasClean }) => {
    if (wasClean) return
    console.log(`[vite] server connection lost. polling for restart...`)
    await waitForSuccessfulPing()
    location.reload()
})

interface HotModule {
    id: string
    callbacks: HotCallback[]
}

interface HotCallback {
    // the dependencies must be fetchable paths
    deps: string[]
    fn: (modules: object[]) => void
}

const hotModulesMap = new Map<string, HotModule>()
export const createHotContext = (ownerPath: string) => {
    function acceptDeps(deps: string[], callback: HotCallback['fn'] = () => { }) {
        const mod: HotModule = hotModulesMap.get(ownerPath) || {
            id: ownerPath,
            callbacks: []
        }
        mod.callbacks.push({
            deps,
            fn: callback
        })
        hotModulesMap.set(ownerPath, mod)
    }
    const hot = {
        // accept(deps: any, callback?: any) {
        accept(deps: any) {
            if (typeof deps === 'function' || !deps) {
                // self-accept: hot.accept(() => {})
                acceptDeps([ownerPath], ([mod]) => deps && deps(mod))
            }
        }
    }
    return hot
}


/** css handling */
const sheetsMap = new Map()

export function updateStyle(id: string, content: string) {
    let style = sheetsMap.get(id);
    if (!style) {
        style = document.createElement('style')
        style.setAttribute('type', 'text/css')
        style.innerHTML = content
        document.head.appendChild(style)
    }else{
        style.innerHTML = content
    }

    sheetsMap.set(id, style);
}
