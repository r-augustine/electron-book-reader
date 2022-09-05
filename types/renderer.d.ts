export interface IElectronAPI {
  getBooksPath: () => Promise<void>;
}

declare global {
  interface Window {
    api: IElectronAPI;
  }
}
