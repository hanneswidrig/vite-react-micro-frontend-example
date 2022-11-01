import { createRoot } from 'react-dom/client';

import App from './App';
import { registerReactWebComponent } from './registerReactWebComponent';

if (import.meta.env.DEV) {
    const root = document.getElementById('root') as HTMLElement;
    createRoot(root).render(<App />);
}

if (import.meta.env.PROD) {
    registerReactWebComponent(App, 'vite-micro-ui-element', [
        { propName: 'null' },
        { propName: 'boolean' },
        { propName: 'number' },
        { propName: 'string' },
        { propName: 'object' },
    ]);
}
