import { render, h, useEffect, Fragment, useState } from "../../src/index"

import { App as UseStateApp } from './use-state'
import { App as UseReducerApp } from './use-reducer'
import { App as UseEffectApp } from './use-effect'
import { App as UseMemoApp } from './use-memo'

function App() {
    useEffect(() => {
        console.log('mounted App main useEffect Root')
    }, []);
    
    const [count, setCount] = useState(0)

    function upCount(){
        setCount(count + 1)
    }

    return <>
        <UseStateApp count={count} upCount={upCount} />
        <UseReducerApp />
        <UseEffectApp count={count}/>
        <UseMemoApp count={count}/>
    </>
}

render(<App />, document.getElementById("app"))
