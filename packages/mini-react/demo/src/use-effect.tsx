import { h, Fragment, useReducer, useState, useEffect } from "../../src/index"

export {
    App
}


function App(props) {
    let { count } = props;
    let [countDown,setCountDown] = useState(3);
    const [data, setData] = useState([{
        id: 'id',
        title: 'title1'
    }]);

    useEffect(() => {
        document.title = data[0].title
        console.log('mounted useEffect child')
    }, [count]);
    useEffect(() => {
        const fetchData = async () => {
            function countDownFn() {
                setTimeout(() => {
                    setCountDown(--countDown)
                    if (countDown <= 0) {
                        setData([
                            {
                                id: 'id changed',
                                title: 'title changed'
                            }
                        ]);
                        return
                    }
                    countDownFn()
                }, 1000)
            }

            countDownFn()
        };
        fetchData();

    }, []);

   
    return (
        <>
            <h1>Use effect</h1>
            <div>title change in {countDown} seconds:</div>
            <ul>
                {data.map(item => (
                    <li key={item.id}>
                        {item.title}
                    </li>
                ))}
            </ul>
        </>
    );
}