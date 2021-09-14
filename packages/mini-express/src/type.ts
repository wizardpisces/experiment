
export type Next<T = any> = (err?: Error | null) => T;
export type RequestHandler<T, U, V = void> = (
    req: T,
    res: U,
    next: Next<V>
) => V;

/**
 * Todos
 * replace any with actual req/res.next type
 */
export type Handle = RequestHandler<any, any, any>

export type LayerOptions = {
    handle: Handle;
    path: string
}