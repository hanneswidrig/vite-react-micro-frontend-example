/// <reference types="vite/client" />

declare namespace JSX {
	interface IntrinsicElements {
		[customElementName: string]: React.DetailedHTMLProps<
			React.HTMLAttributes<HTMLElement>,
			React.ClassAttributes<HTMLElement>,
			HTMLElement
		>;
	}
}
