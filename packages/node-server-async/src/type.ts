
export type Next<T = Promise<any>> = (err?: Error | null) => T;
export type RequestHandler<T, V = void> = (
    ctx: T,
    next: Next<V>
) => any;

/**
 * Todos
 * replace any with actual req/res.next type
 */
export type Handle = RequestHandler<Context, Promise<any>>

export type LayerOptions = {
    handle: Handle;
    path: string
}

export type Context = {
    res: any;
    req: any;
    body: any
}