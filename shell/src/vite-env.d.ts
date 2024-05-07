/// <reference types="vite/client" />

declare namespace React.JSX {
	interface IntrinsicElements {
		"vite-micro-ui-element": React.DetailedHTMLProps<
			React.HTMLAttributes<HTMLElement> & {
				null?: null;
				boolean?: boolean;
				number?: number;
				string?: string;
				object?: Record<string, unknown>;
			},
			HTMLElement
		>;
	}
}
