import type { Manifest } from "vite";
import { createRoot, type Root } from "react-dom/client";

type Prop = {
	propName: string;
	attrName?: string;
	initialValue?: unknown;
};

/**
 * Create new custom element which wraps provided React component, then define in Custom Elements Registry.
 *
 * @param ReactComponent - React Component to be wrapped inside a custom element.
 * @param tag - Name for the new custom element. Note that custom element names must contain a hyphen.
 * @param defaultProps - properties to provide to wrapped React component
 */
export function registerReactWebComponent(ReactComponent: React.FC, tag: string, defaultProps: Prop[] = []) {
	let webComponent: typeof WebComponent.prototype;

	const root = Symbol("root");
	const props = Symbol("props");
	const dirty = Symbol("dirty");
	const observer = Symbol("observer");

	function inferAttributeValue(attribute: string): boolean | number | string | null {
		const value = webComponent.getAttribute(attribute);

		const booleanCase = value === "" || value === null;
		if (booleanCase) {
			return value === "";
		}

		const numberCase = !Number.isNaN(Number.parseFloat(value)) && !Number.isNaN(Number(value));
		if (numberCase) {
			return Number(value);
		}

		const stringCase = value.charAt(0) === "'" && value.charAt(value.length - 1) === "'";
		if (stringCase) {
			return value.slice(1, -1);
		}

		return value;
	}

	function mapAttributesToProps(mutationList: MutationRecord[]): void {
		const attributes = new Set(
			mutationList
				.filter(({ type, attributeName }) => type === "attributes" && attributeName !== null)
				.map(({ attributeName }) => attributeName as string),
		);

		for (const attribute of attributes) {
			const prop = defaultProps.find(({ attrName, propName }) => (attrName ?? propName) === attribute);
			if (prop) {
				const value = inferAttributeValue(attribute);
				const valueChanged = webComponent[props][prop.propName] !== value;
				if (valueChanged) {
					webComponent[props][prop.propName] = value;
					webComponent[dirty].set(prop.propName, value);
				}
			}
		}

		webComponent.render();
	}

	function set(prop: Prop, value: unknown): void {
		const valueChanged = webComponent[props][prop.propName] !== value;
		if (valueChanged) {
			webComponent[props][prop.propName] = value;
			webComponent[dirty].set(prop.propName, value);
		}

		const qualifiedName = prop.attrName ?? prop.propName;
		switch (typeof value) {
			case "boolean":
				if (value) {
					webComponent.setAttribute(qualifiedName, "");
				} else {
					webComponent.removeAttribute(qualifiedName);
				}
				break;
			case "number":
				webComponent.setAttribute(qualifiedName, String(value));
				break;
			case "string":
				webComponent.setAttribute(qualifiedName, String(`'${value}'`));
				break;
			default:
				/**
				 * If prop value can not be reflected as an attribute, explicitly invoke render method for prop.
				 * Attributes automatically trigger render via `MutationObserver`define in the web component wrapper.
				 */
				webComponent.render();
		}
	}

	function initializeProperties(): void {
		for (const defaultProp of defaultProps) {
			const key = defaultProp.propName;
			const value = defaultProp.initialValue;

			Object.defineProperty(webComponent, key, {
				set: (value: unknown) => set(defaultProp, value),
				get: () => webComponent[props][key],
				configurable: true,
			});

			webComponent[props][key] = value;
			webComponent[dirty].set(key, value);
		}
	}

	const WebComponent = class ReactWebComponent extends HTMLElement {
		[propertyKey: PropertyKey]: unknown;

		[root]: Root;
		[props]: Record<PropertyKey, unknown> = {};
		[dirty]: Map<PropertyKey, unknown> = new Map();
		[observer]: MutationObserver;

		constructor() {
			super();
			webComponent = this;
			initializeProperties();

			const mountPoint = document.createElement("div");
			mountPoint.setAttribute("id", "root");

			const shadowRoot = this.attachShadow({ mode: "open" });
			shadowRoot.appendChild(mountPoint);

			const metaUrl = import.meta.url;
			const rootUrl = new URL("..", metaUrl);
			const manifestUrl = new URL(".vite/manifest.json", rootUrl).toString();

			fetch(manifestUrl)
				.then((response) => response.json())
				.then((manifest: Manifest) => {
					const entryChunk = Object.values(manifest).filter(({ isEntry }) => isEntry)[0];
					for (const cssPath of entryChunk.css ?? []) {
						const cssFile = document.createElement("link");
						cssFile.setAttribute("rel", "stylesheet");
						cssFile.setAttribute("href", new URL(cssPath, rootUrl).toString());
						cssFile.setAttribute("type", "text/css");
						shadowRoot.appendChild(cssFile);
					}
				});

			this[root] = createRoot(mountPoint);
			this[observer] = new MutationObserver((mutationList) => mapAttributesToProps(mutationList));
		}

		/**
		 * connectedCallback(): Invoked when the custom element is first connected to the document's DOM.
		 * https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#using_the_lifecycle_callbacks
		 */
		connectedCallback() {
			this.upgradeProperties();
			this.render();
			this[observer].observe(this, { attributes: true });
		}

		/**
		 * disconnectedCallback(): Invoked when the custom element is disconnected from the document's DOM.
		 * https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#using_the_lifecycle_callbacks
		 */
		disconnectedCallback() {
			setTimeout(() => this[root].unmount());
			this[observer].disconnect();
		}

		/**
		 * Initially render React component, re-renders triggered by attribute updates via MutationObserver
		 */
		render() {
			if (this[dirty].size > 0) {
				this[dirty].clear();
				this[root].render(<ReactComponent {...this[props]} />);
			}
		}

		/**
		 * Upgrade defined properties by checking if any properties have already been set on its instance.
		 *
		 * Method captures the value from the not upgraded instance and deletes the property, so
		 * it does not shadow the custom element's own property setter. This way, when the element's definition
		 * does finally load, it can immediately reflect the correct state.
		 *
		 * https://web.dev/custom-elements-best-practices/#make-properties-lazy
		 */
		upgradeProperties() {
			const upgradeRequired = Object.keys(this[props]).some((key) => this[key] !== undefined);
			if (upgradeRequired) {
				for (const key of Object.keys(this[props])) {
					const prop = defaultProps.find(({ propName }) => propName === key);
					const attribute = prop?.attrName ?? prop?.propName ?? "";
					const attrValue = inferAttributeValue(attribute);
					const descriptor = Object.getOwnPropertyDescriptor(this, key);

					if (Object.hasOwn(this, key) && descriptor) {
						const propValue = this[key];
						delete this[key];
						Object.defineProperty(this, key, descriptor);
						this[key] = propValue ?? attrValue ?? undefined;
					}
				}
			}
		}
	};

	/**
	 * Registers web component within DOM Window
	 * https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define
	 */
	customElements.define(tag, WebComponent);

	return WebComponent;
}
