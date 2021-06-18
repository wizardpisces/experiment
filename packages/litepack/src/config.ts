import {
    Plugin as RollupPlugin,
} from 'rollup'

export interface Plugin extends RollupPlugin{

}

export type ResolvedConfig = {
    plugins: readonly Plugin[]
}