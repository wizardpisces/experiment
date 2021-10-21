import { render, h, useState, Fragment, useEffect} from "../../src/index"

export {
  App
}

function App(props) {
  // console.log('父组件')
  let { count, upCount } = props
  useEffect(() => {
    console.warn('mounted useState child')
  }, []);
  return (
    <div>
      <h1>useState</h1>
      <SimpleChild i={1} />
      <br />
      <MultipleUseState />
      <br />
      <SimpleChild i={2}/>
      <h9>You clicked {count} times ( click below button will trigger useEffect and useMemo view change)</h9>
      <div>
        <button onClick={upCount}>+</button>
      </div>
    </div>
  )
}

function SimpleChild({ i }) {
  // console.log('子组件', i)
  return `${i}组件`
}

function MultipleUseState() {
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

