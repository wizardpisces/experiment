import { render, h, useState, Fragment } from "../../src/index"

import { App as UseStateApp } from './use-state'
import { App as UseReducerApp } from './use-reducer'

function App() {
    return <>
        <UseStateApp />
        <UseReducerApp/>
    </>
}

render(<App />, document.getElementById("app"))
