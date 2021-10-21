import { h, Fragment, useReducer, useState, useEffect } from "../../src/index"

export default function Counter() {
    const [count, setCount] = useState(0);

    const add = () => setCount((prev) => prev + 1);

    useEffect(() => {
        console.warn("Mounted count,count updated", count);
    }, [count]);

    return (
        <div class="demo">
            <h1>React count Demo</h1>
            <span>{count}</span>
            <button onClick={add}> +1 </button>
        </div>
        // <>
        //     <h1>React count Demo</h1>
        //     <span>{count}</span>
        //     <button onClick={add}> +1 </button>
        // </>
    );
}