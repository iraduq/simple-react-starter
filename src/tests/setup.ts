import { GlobalWindow } from 'happy-dom';

const win = new GlobalWindow();
// @ts-ignore
globalThis.window = win;
// @ts-ignore
globalThis.document = win.document;
// @ts-ignore
globalThis.navigator = win.navigator;
// @ts-ignore
globalThis.HTMLElement = win.HTMLElement;
// @ts-ignore
globalThis.localStorage = win.localStorage;
