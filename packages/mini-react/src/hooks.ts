import { createLogger } from "./util"
import { rerender } from './render'
export {
    useState
}

const logger = createLogger('[hooks]')

let _state: any;
function useState<T>(initState: T): [T, Function] {
    if (!_state) {
        _state = initState
    }
    logger('enter useState')
    function setState(s: T): T {
        logger('triggered', s);
        _state = s
        rerender()
        return s
    }
    return [_state, setState]
}