#!/usr/bin/env zx

import "zx/globals";

await fs.rm("web-server", { recursive: true, force: true });
await fs.mkdir("web-server");

const startWebServer = () => $`cd web-server; pnpm dlx http-server --silent --cors`;
const buildMicroUi = () => $`cd micro-ui; pnpm build`;
const startShell = () => $`cd shell; pnpm dev`;

await Promise.all([startWebServer(), buildMicroUi(), startShell()]);
