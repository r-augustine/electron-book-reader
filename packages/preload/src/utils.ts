import { ipcRenderer } from 'electron';

export const getBooksPath = (args: string) => ipcRenderer.invoke('getBooksPath', args);
export const openBook = (args: string) => ipcRenderer.invoke('openBook', args);
