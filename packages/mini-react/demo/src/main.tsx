import { render, h, useEffect, Fragment, useState } from "../../src/index"

import { App as UseStateApp } from './use-state'
import { App as UseReducerApp } from './use-reducer'
import { App as UseEffectApp } from './use-effect'
import { App as UseMemoApp } from './use-memo'
import { App as UseRefApp } from './use-ref'
import { default as Demo } from './demo'

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
        <UseRefApp/>
        <Demo/>
    </>
}

render(<App />, document.getElementById("app"))
