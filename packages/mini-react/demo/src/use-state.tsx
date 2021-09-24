import { render, h, useState, Fragment } from "../../src/index"

function App() {
  console.log('父组件')
  const [count, setCount] = useState(0)
  const [buttonText, setButtonText] = useState("Click me,   please");

  function handleClick() {
    return setButtonText("Thanks, been clicked!");
  }
  return (
    <div>
      <SimpleChild i={1}/>
      <MultipleUseState/>
      <br/>
      {/* <SimpleChild i={2}/> */}
      <h1>You clicked {count} times</h1>
      <div>
        <button onClick={() => setCount(count + 1) }>+</button>
      </div>

      <br />
      <button onClick={handleClick}>{buttonText}</button>
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

render(<App />, document.getElementById("app"))
