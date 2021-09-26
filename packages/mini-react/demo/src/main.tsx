import { render, h, useEffect, Fragment } from "../../src/index"

import { App as UseStateApp } from './use-state'
import { App as UseReducerApp } from './use-reducer'
import { App as UseEffectApp } from './use-effect'

function App() {
    useEffect(() => {
        console.log('mounted App main useEffect Root')
    }, []);
    return <>
        <UseStateApp />
        <UseReducerApp/>
        <UseEffectApp/>
    </>
}

render(<App />, document.getElementById("app"))
