import { ipcRenderer } from 'electron';

export const getBooksPath = (args: string) => ipcRenderer.invoke('getBooksPath', args);
