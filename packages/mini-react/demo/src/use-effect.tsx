import { h, Fragment, useReducer, useState, useEffect } from "../../src/index"
import Demo from './demo'
export {
    UseEffectApp
}


function UseEffectApp(props) {
    let { count } = props;
    let [countDown, setCountDown] = useState(2);
    const [data, setData] = useState([{
        id: 'id',
        title: 'fetching data......'
    }]);

    useEffect(() => {
        document.title = data[0].title
        console.warn('mounted useEffect child')
    }, []);

    useEffect(() => {
        console.warn('running useEffect cb', `count:${count}`, `countDown:${countDown}`)
        setCountDown(countDown = 2)
        let timeoutID
        const fetchData = () => {
                timeoutID = setTimeout(() => {
                    
                    console.warn('setTimeout triggered', `count:${count}`, `countDown:${countDown}`,timeoutID)
                    setCountDown(--countDown)
                    if (countDown <= 0) {
                        // setData([
                        //     {
                        //         id: 'id changed',
                        //         title: 'data fetched : ' + Math.random()
                        //     }
                        // ]);
                        return
                    }
                    fetchData()
                }, 1000)
        };

        fetchData();

        return () => {
            clearTimeout(timeoutID)
        }
    }, [count]);

    return (
        <div class="use-effect">
            <h1>useEffect</h1>
            <div>title change in {countDown} seconds (countState will change by parent):</div>
            <ul>
                {data.map(item => (
                    <li key={item.id}>
                        {item.title}
                    </li>
                ))}
            </ul>
            {/* <Demo/> */}
        </div>
    );
}