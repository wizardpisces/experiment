import { render, h, useState, Fragment } from "../../src/index"

export {
  App
}

function App() {
  console.log('父组件')
  const [count, setCount] = useState(0)

  return (
    <div>
      <h1>useState</h1>
      <SimpleChild i={1}/>
      <br />
      <MultipleUseState/>
      <br/>
      {/* <SimpleChild i={2}/> */}
      <h9>You clicked {count} times</h9>
      <div>
        <button onClick={() => setCount(count + 1) }>+</button>
      </div>
    </div>
  )
}

function SimpleChild({i}){
  console.log('子组件',i)
  return `${i}组件`
}

function MultipleUseState(){
  const [up, setUp] = useState(0)
  const [down, setDown] = useState(0)
  return (
    // Support Fragment
    <>
      <span>{up}</span><button onClick={() => setUp(up + 1)}>+</button>
      <span>{down}</span><button onClick={() => setDown(down - 1)}>-</button>
    </>
  )
}

