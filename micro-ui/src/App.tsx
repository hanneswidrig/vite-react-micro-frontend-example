import { useState, useEffect } from 'react';

import './main.css';

function App(props: unknown) {
    const [count, setCount] = useState(0);

    useEffect(() => console.log('App', props), [props]);

    return (
        <div className="grid place-items-center">
            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                type="button"
                onClick={() => setCount((count) => count + 1)}
            >
                micro-ui count is {count}
            </button>
            <code>{JSON.stringify(props)}</code>
        </div>
    );
}

export default App;
