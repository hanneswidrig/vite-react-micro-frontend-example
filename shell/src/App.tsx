import { Manifest } from 'vite';
import { useState, useEffect, useRef } from 'react';

import './App.css';
import reactLogo from './assets/react.svg';

async function fetchMicroUis() {
    const manifestUrl = 'http://127.0.0.1:8080/manifest.json';
    const manifest = await fetch(manifestUrl).then<Manifest>((response) => response.json());
    const microUis = Object.values(manifest).filter(({ isEntry }) => isEntry);
    for (const microUi of microUis) {
        const script = document.createElement('script');
        script.type = 'module';
        script.src = `http://127.0.0.1:8080/${microUi.file}`;
        document.body.insertAdjacentElement('beforeend', script);
    }
}

function useMicroUiComponent(name: string) {
    const [microUiLoaded, setMicroUiLoaded] = useState(false);

    useEffect(() => {
        Promise.all([fetchMicroUis(), customElements.whenDefined(name)])
            .then(() => setMicroUiLoaded(true))
            .catch((error) => console.error(error));
    }, []);

    return { microUiLoaded };
}

function App() {
    const [count, setCount] = useState(0);
    const { microUiLoaded } = useMicroUiComponent('vite-micro-ui-element');
    const microUiRef = useRef<(HTMLElement & Record<string, any>) | null>(null);

    useEffect(() => {
        if (microUiLoaded && microUiRef.current) {
            microUiRef.current.null = null;
            microUiRef.current.boolean = true;
            microUiRef.current.number = count;
            microUiRef.current.string = count.toString();
            microUiRef.current.object = { count };
        }
    }, [microUiLoaded, count]);

    return (
        <div className="App">
            <div>
                <a href="https://vitejs.dev" target="_blank">
                    <img src="/vite.svg" className="logo" alt="Vite logo" />
                </a>
                <a href="https://reactjs.org" target="_blank">
                    <img src={reactLogo} className="logo react" alt="React logo" />
                </a>
            </div>
            <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
            </div>
            <vite-micro-ui-element ref={microUiRef}></vite-micro-ui-element>
        </div>
    );
}

export default App;
