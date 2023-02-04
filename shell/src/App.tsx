import { Manifest } from "vite";
import { useState, useEffect, useRef } from "react";

import reactLogo from "./assets/react.svg";

async function fetchMicroUis() {
	const manifestUrl = "http://127.0.0.1:8080/micro-ui/manifest.json";
	const manifest = await fetch(manifestUrl).then<Manifest>((response) => response.json());
	const microUis = Object.values(manifest).filter(({ isEntry }) => isEntry);
	for (const microUi of microUis) {
		const script = document.createElement("script");
		script.type = "module";
		script.src = `http://127.0.0.1:8080/micro-ui/${microUi.file}`;
		document.body.insertAdjacentElement("beforeend", script);
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
	const { microUiLoaded } = useMicroUiComponent("vite-micro-ui-element");
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
		<div className="grid place-items-center border-2 border-gray-500 px-3 py-2">
			<div className="flex w-full">
				<span className="font-bold text-gray-800">Shell Container</span>
			</div>
			<div className="flex justify-center w-full">
				<a href="https://vitejs.dev" target="_blank">
					<img src="/vite.svg" className="h-24 p-6" alt="Vite logo" />
				</a>
				<a href="https://reactjs.org" target="_blank">
					<img src={reactLogo} className="h-24 p-6" alt="React logo" />
				</a>
			</div>
			<div className="p-8">
				<button
					className="bg-gray-800 hover:bg-gray-900 text-white py-2 px-4 rounded-full"
					onClick={() => setCount((count) => count + 1)}
				>
					shell count is {count}
				</button>
			</div>
			<vite-micro-ui-element ref={microUiRef}></vite-micro-ui-element>
		</div>
	);
}

export default App;
