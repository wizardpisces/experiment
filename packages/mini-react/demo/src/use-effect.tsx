import { h, Fragment, useReducer, useState, useEffect } from "../../src/index"

export {
    App
}


function App(props) {
    let { count } = props;
    let [countDown, setCountDown] = useState(3);
    const [data, setData] = useState([{
        id: 'id',
        title: 'fetching data......'
    }]);

    useEffect(() => {
        document.title = data[0].title
        console.log('mounted useEffect child')
    }, []);

    useEffect(() => {
        setCountDown(countDown = 3)
        let timeoutID

        const fetchData = async () => {
            function countDownFn() {
                timeoutID = setTimeout(() => {
                    setCountDown(--countDown)
                    if (countDown <= 0) {
                        setData([
                            {
                                id: 'id changed',
                                title: 'data fetched : ' + Math.random()
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

        return () => {
            clearTimeout(timeoutID)
        }
    }, [count]);

    return (
        <>
            <h1>Use effect</h1>
            <div>title change in {countDown} seconds (countState will change by parent):</div>
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