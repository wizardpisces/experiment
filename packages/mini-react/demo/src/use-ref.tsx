import { h, Fragment, useReducer, useState, useEffect, useRef } from "../../src/index"

export {
    App
}

function App() {
    const countRef = useRef(0);
    useEffect(() => {
        console.warn('mounted useRef child')
    }, []);
    
    const handle = () => {
        countRef.current++;
        console.log(`Clicked ${countRef.current} times`);
    };

    return <>
        <h1>useRef</h1>
        <button onClick={handle}>Click me</button>
        <InputFocus />
        <br />
    </>
}

function InputFocus() {
    const inputRef = useRef();
    const refDiv = useRef();
    useEffect(() => {
        console.log('refDiv', refDiv.current); // logs <div>I'm an element</div>
        inputRef.current.focus();
        inputRef.current.value = 1
    });
    return (
        <div ref={refDiv}>
            <input id="myText"
                ref={inputRef}
                type="text"
            />
        </div>
    );
}