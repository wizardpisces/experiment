import { render, h, useState } from "../../src/index"

function App() {
  console.log('父组件')
  const [count, setCount] = useState(0)
  const [buttonText, setButtonText] = useState("Click me,   please");

  function handleClick() {
    return setButtonText("Thanks, been clicked!");
  }
  return (
    <div>
      <B i={1}/>
      <br/>
      {/* <B i={2}/> */}
      <h1>You clicked {count} times</h1>
      <div>
        <button onClick={() => setCount(count + 1) }>+</button>
      </div>

      <br />
      <button onClick={handleClick}>{buttonText}</button>
    </div>
  )
}

function B({i}){
  console.log('子组件',i)
  return `${i}组件`
}

render(<App />, document.getElementById("app"))
