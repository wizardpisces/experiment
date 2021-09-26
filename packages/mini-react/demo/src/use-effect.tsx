import { h, Fragment, useReducer, useState, useEffect } from "../../src/index"

export {
    App
}


function App() {
    const [data, setData] = useState([{
        id: 'id',
        title: 'title1'
    }]);

    useEffect(() => {
        // const fetchData = async () => {
        //     setData([
        //         {
        //             id: 'id changed',
        //             title: 'title changed'
        //         }
        //     ]);
        // };

        // fetchData();
        document.title = data[0].title
        console.log('mounted useEffect child')
    },[]);

    return (
        <ul>
            {data.map(item => (
                <li key={item.id}>
                    {item.title}
                </li>
            ))}
        </ul>
    );
}