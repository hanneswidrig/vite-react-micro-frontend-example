import { useState } from "react";

import "./main.css";

export function App(props: { number?: number }) {
	const [count, setCount] = useState(0);

	return (
		<div className="grid place-items-center border-2 border-blue-500 px-3 py-2">
			<div className="flex w-full mb-4">
				<span className="font-bold text-blue-800">Micro UI Container</span>
			</div>
			<div className="flex justify-between w-full gap-2">
				<button
					className="bg-blue-800 hover:bg-blue-900 text-white py-2 px-4 rounded-full"
					onClick={() => setCount((count) => count + 1)}
				>
					micro-ui count is {count}
				</button>
				<div className="py-2 px-4">
					<span>shell count is {props.number}</span>
				</div>
			</div>
		</div>
	);
}
