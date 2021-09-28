import { h, Fragment, useReducer, useState, useEffect, useMemo } from "../../src/index"

export {
    App
}


function App(props) {
    let { count } = props;

    let memoValue = useMemo(() => (count * 2), [count])

    return (
        <>
            <h1>Use Memo</h1>
            <div>this is memo count*2 value: {memoValue}</div>
        </>
    );
}