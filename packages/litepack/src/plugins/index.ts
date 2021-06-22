import { Plugin } from "../plugin";
import htmlPlugin from './html'
import importAnalysisPlugin from './importAnalysis'
import resolvePlugin from './resolve'
import vuePlugin from './plugin-vue/index'

export async function resolvePlugins(): Promise<Plugin[]>{
    // 注意顺序，比如 importAnalysisPlugin 需要在 其它特别的 transform 结果之后进行
    return [
        htmlPlugin(),
        resolvePlugin(),
        vuePlugin(),
        importAnalysisPlugin(),
    ]
}