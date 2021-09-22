import { createLogger } from "./util"
import { rerender } from './render'
export {
    useState
}

const logger = createLogger('[hooks]')

let stateList:any[] = [],
    stateIndex:number;

function resetStateIndex(){
    stateIndex = -1
}

resetStateIndex()

function useState<T>(initState: T): [T, Function] {
    let curIndex = ++stateIndex
    if (!stateList[curIndex]) {
        stateList[curIndex] = initState
    }
    
    function setState(s: T): T {
        logger('triggered', s);
        stateList[curIndex] = s
        resetStateIndex()
        rerender()
        return s
    }
    return [stateList[curIndex], setState]
}