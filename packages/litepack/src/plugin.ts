import {
    Plugin as RollupPlugin,
} from 'rollup'
import { ServerHook } from '.'
import { HmrContext } from './hmr'
import { ModuleNode } from './moduleGraph'
export interface Plugin extends RollupPlugin{
    configureServer?:ServerHook
    handleHotUpdate?(
        ctx: HmrContext
    ): Array<ModuleNode> | void | Promise<Array<ModuleNode> | void>
}

export type ResolvedConfig = {
    plugins: readonly Plugin[]
}