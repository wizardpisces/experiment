export const CLIENT_PUBLIC_PATH = '/@mini-vite/client'
export const ENV_PUBLIC_PATH = `/@mini-vite/env`

export const DEFAULT_EXTENSIONS = [
    '.ts',
    '.js',
    '.json'
]

export const JS_TYPES_RE = /\.(?:j|t)sx?$|\.mjs$/
export const OPTIMIZABLE_ENTRY_RE = /\.(?:m?js|ts)$/

export const MODULE_DEPENDENCY_RE = /^[\w@][^:]/