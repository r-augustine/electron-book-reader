import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import theme from './app/theme';
import { type IpcRenderer } from 'electron';

declare global {
  interface Window {
    __electron_preload__openBook: (a?: string) => IpcRenderer;
  }
}

const node = document.getElementById('root') as HTMLElement;
const root = ReactDOM.createRoot(node);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ChakraProvider theme={theme}>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <App />
      </ChakraProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
