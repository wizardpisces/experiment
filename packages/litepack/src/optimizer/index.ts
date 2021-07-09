import fs from 'fs'
import {
    build,
    // BuildOptions as EsbuildBuildOptions 
} from 'esbuild'
import { ServerDevContext } from "../context";
import { createDebugger } from '../util';
import { scanImports} from './scan'
// import { esbuildDepPlugin} from './esbuildDepPlugin'

let debug = createDebugger('litepack:optimizer')

export async function optimizeDeps(
    serverDevContext: ServerDevContext,
    newDeps?: Record<string, string> // missing imports encountered after server has started
) {
    const { cacheDir, mode } = serverDevContext
    const define: Record<string, string> = {
        'process.env.NODE_ENV': JSON.stringify(mode)
    }
    if (!cacheDir) {
        fs.mkdirSync(cacheDir, { recursive: true })
    }

    let deps: Record<string, string>;

    // missing: Record<string, string>
    if (!newDeps) {
        ; ({ 
            deps, 
            // missing 
        } = await scanImports(serverDevContext))

    } else {
        deps = newDeps
    }


    // const flatIdDeps: Record<string, string> = {}

    const result = await build({
        entryPoints: Object.keys(deps),
        bundle: true,
        format: 'esm',
        logLevel: 'error',
        splitting: true,
        sourcemap: true,
        outdir: cacheDir,
        treeShaking: 'ignore-annotations',
        metafile: true,
        define,
        // plugins: [esbuildDepPlugin()]
    })

    const meta = result.metafile!

    debug(meta)
}