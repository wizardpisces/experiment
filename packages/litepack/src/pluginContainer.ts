/**
 * https://vitejs.dev/guide/api-plugin.html#rollup-plugin-compatibility
 */

import {
    PartialResolvedId,
    LoadResult,
    SourceDescription,
    PluginContext as RollupPluginContext,
    ResolvedId
} from 'rollup'

import { ResolvedConfig } from './plugin'

export interface PluginContainer {
    resolveId(
        id: string,
    ): Promise<PartialResolvedId | null>
    transform(
        code: string,
        id: string,
    ): Promise<SourceDescription | null>
    load(id: string): Promise<LoadResult | null>
}

type PluginContext = Pick<
    RollupPluginContext,
    'resolve'
>

export async function createPluginContainer({ plugins }: ResolvedConfig): Promise<PluginContainer> {

    class Context implements PluginContext {
        async resolve(id: string) {
            let out = await container.resolveId(id)
            if (typeof out === 'string') out = { id: out }
            return out as ResolvedId | null
        }

        error(e: Error) {
            throw e
        }
    }

    // for later source map handle
    class TransformContext extends Context {
        filename: string
        originalCode: string
        constructor(filename: string, code: string) {
            super()
            this.filename = filename
            this.originalCode = code
        }
    }

    const container: PluginContainer = {
        async resolveId(rawId) {
            const ctx = new Context()
            let id: string | null = null
            const partial: Partial<PartialResolvedId> = {}
            
            for (const plugin of plugins) {
                
                // console.log('---------------------------',plugin.name, plugin.resolveId,rawId)
                if (!plugin.resolveId) continue
                const result = await plugin.resolveId.call(ctx as any, rawId, '', {})
                
                if (!result) continue

                if (typeof result === 'string') {
                    id = result
                } else {
                    id = result.id
                    Object.assign(partial, result)
                }
                break
            }

            if (id) {
                partial.id = id
                return partial as PartialResolvedId
            } else {
                return null
            }
        },

        async load(id) {
            const ctx = new Context()
            for (const plugin of plugins) {
                if (!plugin.load) continue
                const result = await plugin.load.call(ctx as any, id)
                if (result != null) {
                    return result
                }
            }
            return null
        },

        async transform(code, id) {
            const ctx = new TransformContext(id, code)
            for (const plugin of plugins) {
                if (!plugin.transform) continue
                let result
                try {
                    result = await plugin.transform.call(ctx as any, code, id)
                } catch (e) {
                    ctx.error(e)
                }

                if (!result) continue
                if (typeof result === 'object') {
                    code = result.code || ''
                } else {
                    code = result
                }
            }
            return {
                code
            }
        },

    }

    return container
}