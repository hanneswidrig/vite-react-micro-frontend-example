import { useState } from 'react';

import './main.css';

function App(props: { number?: number }) {
    const [count, setCount] = useState(0);

    return (
        <div className="grid place-items-center border-2 border-blue-500 px-3 py-2">
            <div className="flex w-full mb-4">
                <span className="font-bold text-blue-700">Micro UI Container</span>
            </div>
            <div className="flex justify-between w-full gap-2">
                <button
                    className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-md"
                    type="button"
                    onClick={() => setCount((count) => count + 1)}
                >
                    micro-ui count is {count}
                </button>
                <div className="bg-blue-300 font-bold flex py-2 px-4">
                    <span>shell count is {props.number}</span>
                </div>
            </div>
        </div>
    );
}

export default App;
