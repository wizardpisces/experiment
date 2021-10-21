import { h, Fragment, useReducer, useState, useEffect, useMemo } from "../../src/index"

export {
    App
}


function App(props) {
    let { count } = props;

    let memoValue = useMemo(() => (count * 2), [count])
    useEffect(() => {
        console.warn('mounted useMemo child')
    }, []);
    return (
        <>
            <h1>useMemo</h1>
            <span>memoValue:{memoValue}</span>
            {/* <div>this is memo count*2 value: {memoValue}</div> */}
        </>
    );
}