import Context from './context';
import {  Handle, Next } from './type'

export default function compose(handlers: Handle[]): Handle {
    let len = handlers.length,
        i = 0;
        
    return async (ctx: Context, next: Next) => {

        async function dispatch(i: number, err?: any) {
            if (i === len) return next(err)
            await handlers[i](ctx, async (err) => {
                dispatch(i + 1, err);
            })
        }

        await dispatch(i)
    }
}
