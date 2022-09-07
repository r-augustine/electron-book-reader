import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { URL } from 'url';
import { mkdir, access, constants } from 'node:fs/promises';
import extract from 'extract-zip';
import { XMLParser } from 'fast-xml-parser';
import { readFile } from 'fs/promises';

async function createWindow() {
  const browserWindow = new BrowserWindow({
    // show: false, // Use the 'ready-to-show' event to show the instantiated BrowserWindow.
    vibrancy: 'under-window',
    visualEffectState: 'active',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false, // Sandbox disabled because the demo of preload script depend on the Node.js api
      webviewTag: false, // The webview tag is not recommended. Consider alternatives like an iframe or Electron's BrowserView. @see https://www.electronjs.org/docs/latest/api/webview-tag#warning
      preload: join(app.getAppPath(), 'packages/preload/dist/index.cjs'),
    },
  });

  /**
   * If the 'show' property of the BrowserWindow's constructor is omitted from the initialization options,
   * it then defaults to 'true'. This can cause flickering as the window loads the html content,
   * and it also has show problematic behaviour with the closing of the window.
   * Use `show: false` and listen to the  `ready-to-show` event to show the window.
   *
   * @see https://github.com/electron/electron/issues/25012 for the afford mentioned issue.
   */
  browserWindow.on('ready-to-show', () => {
    browserWindow?.show();

    if (import.meta.env.DEV) {
      browserWindow?.webContents.openDevTools();
    }
  });

  /**
   * URL for main window.
   * Vite dev server for development.
   * `file://../renderer/index.html` for production and test.
   */
  const pageUrl =
    import.meta.env.DEV && import.meta.env.VITE_DEV_SERVER_URL !== undefined
      ? import.meta.env.VITE_DEV_SERVER_URL
      : new URL('../renderer/dist/index.html', 'file://' + __dirname).toString();

  await browserWindow.loadURL(pageUrl);

  return browserWindow;
}

/**
 * Restore an existing BrowserWindow or Create a new BrowserWindow.
 */
export async function restoreOrCreateWindow() {
  let window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());

  if (window === undefined) {
    window = await createWindow();
  }

  if (window.isMinimized()) {
    window.restore();
  }

  window.focus();

  const basePath = join(__dirname, '../', '../', 'renderer', 'assets');
  const epubPath = join(basePath, 'sample.epub');
  const bookPath = join(basePath, 'sample');
  await addBook(epubPath, bookPath);

  // after extracting the book
  // check if the file exists first
  // parse META-INF/container.xml and find the rootfile
  const root = await getRootFilePath(bookPath);
  console.log(JSON.stringify(root, null, 2));

  ipcMain.handle('getBooksPath', () => {
    const _path = join(__dirname, '../', '../', 'renderer', 'assets', 'tester.epub');
    return _path;
  });
}

// async function() {

// }

/**
 * Finds the location of the root file
 * @param bookPath string The location of the extracted EPUB
 * @returns string
 */
async function getRootFilePath(bookPath: string) {
  if (!(await dirExists(bookPath))) {
    throw new Error('book does not exist');
  }

  const containerFilePath = join(bookPath, 'META-INF/container.xml');

  if (!(await dirExists(containerFilePath))) {
    throw new Error('Invalid EPUB format');
  }

  const containerXml = await readFile(containerFilePath, { encoding: 'utf-8' });
  const xmlObj = parseXml(containerXml);
  console.log(xmlObj?.container);

  if (!xmlObj.container?.rootfiles?.rootfile?.['full-path']) {
    throw new Error('Invalid EPUB format');
  }

  return xmlObj.container.rootfiles.rootfile['full-path'];
}

function parseXml(data: string) {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });
  const xmlString = parser.parse(data);
  return xmlString;
}

/**
 * Add a book to the application
 * @param epubPath string The location of the epub file
 * @param bookPath string The destination to save the extracted epub
 * @returns
 */
async function addBook(epubPath: string, bookPath: string) {
  if (await dirExists(bookPath)) {
    // throw new Error("Book already exists");
    console.log('the book already exists');
    return -1;
  }

  // create directory to hold files
  await createDir(bookPath);

  // upzip files
  await unzipEpub(epubPath, bookPath);
}

async function createDir(dir: string) {
  console.log('creating the folder');
  await mkdir(dir);
}

/**
 * Checks if a directory exists
 * @param dir string Path
 * @returns
 */
async function dirExists(dir: string) {
  try {
    await access(dir, constants.R_OK | constants.W_OK);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Unzips epub files
 * @param epubPath string The location of the epub file
 * @param bookPath string The destination to save the extracted epub
 */
async function unzipEpub(epubPath: string, bookPath: string) {
  try {
    await extract(epubPath, { dir: bookPath });
  } catch (error) {
    console.log('could not extract the files', error);
  }
}
