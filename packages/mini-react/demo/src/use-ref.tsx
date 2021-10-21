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
    console.log('I rendered!');

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

// function App() {
//     const timerIdRef = useRef(0);
//     const [count, setCount] = useState(0);
//     // console.log('timerIdRef.current', timerIdRef.current)

//     const startHandler = () => {
//         if (timerIdRef.current) { return; }
//         timerIdRef.current = setInterval(() => setCount((c) => c + 1), 1000);
//         console.log('timerIdRef.current', timerIdRef.current)
//     };
//     const stopHandler = () => {
//         clearInterval(timerIdRef.current);
//         timerIdRef.current = 0;
//     };
//     useEffect(() => {
//         return () => {
//             clearInterval(timerIdRef.current)
//             console.log('cleaned up timerIdRef.current', timerIdRef.current)
//         };
//     }, []);
//     return (
//         <div>
//             <div>Timer: {count}s</div>
//             <div>
//                 <button onClick={startHandler}>Start</button>
//                 <button onClick={stopHandler}>Stop</button>
//             </div>
//         </div>
//     );
// }