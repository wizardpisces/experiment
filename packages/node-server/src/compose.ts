import { Handler,Next } from './type'

export default function compose<T, U, V = void>(handlers: Handler<T, U, V>[]) {
    let len = handlers.length,
        i = 0;
    return (req: T, res: U, done: Next<V>) => {

        function dispatch(i: number, err?: any) {
            if (i === len) return done(err)
            handlers[i](req, res, (err) => {
                dispatch(i + 1, err);
            })
        }

        dispatch(i)
    }
}
