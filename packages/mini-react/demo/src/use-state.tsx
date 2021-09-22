import { render, h, useState } from "../../src/index"

function App() {
  console.log('父组件')
  const [count, setCount] = useState(0)
  return (
    <div>
      <B i={1}/>
      <br/>
      {/* <B i={2}/> */}
      <h1>{count}</h1>
      <button onClick={() => setCount(count + 1) }>+</button>
    </div>
  )
}

function B({i}){
  console.log('子组件',i)
  return `${i}组件`
}

render(<App />, document.getElementById("app"))
