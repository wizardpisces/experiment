import {
    Plugin as RollupPlugin,
} from 'rollup'
import { ServerHook } from '.'

export interface Plugin extends RollupPlugin{
    configureServer?:ServerHook
}

export type ResolvedConfig = {
    plugins: readonly Plugin[]
}