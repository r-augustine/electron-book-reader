import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { URL } from 'url';
import { mkdir, access } from 'node:fs/promises';
import extract from 'extract-zip';
import { XMLBuilder, type XmlBuilderOptionsOptional, XMLParser } from 'fast-xml-parser';
import { readFile } from 'fs/promises';

async function createWindow() {
  const browserWindow = new BrowserWindow({
    // show: false, // Use the 'ready-to-show' event to show the instantiated BrowserWindow.
    width: 1600,
    height: 800,
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
      //browserWindow?.webContents.openDevTools();
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

  //   all you need to know is the first chapter of the book
  // itemref/spine is the table of contents ids are related to items
  // items container the path of the xml file to load
  // scan loaded xml files for css and load all css files dynamically
  // add animations after

  ipcMain.handle('getBooksPath', () => {
    const _path = join(__dirname, '../', '../', 'renderer', 'assets', 'tester.epub');
    return _path;
  });

  ipcMain.handle('openBook', async () => {
    return await openBook(bookPath);
  });

  ipcMain.handle('getItem', async (event, href: string) => {
    const options = {
      ignoreAttributes: false,
      preserveOrder: true,
      unpairedTags: ['br', 'hr', 'link', 'meta'],
      stopNodes: ['*.pre', '*.script'],
      processEntities: true,
      htmlEntities: true,
    };
    parseXml(href, options);
  });
}

async function getRootFile(rootPath: string) {
  const rootXml = await readFile(rootPath, { encoding: 'utf-8' });
  const rootXmlObj = parseXml(rootXml);
  return rootXmlObj;
}

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
    // show notification
    throw new Error('Invalid EPUB format');
  }

  const containerXml = await readFile(containerFilePath, { encoding: 'utf-8' });
  const xmlObj = parseXml(containerXml);

  if (!xmlObj.container?.rootfiles?.rootfile?.['full-path']) {
    throw new Error('Invalid EPUB format');
  }

  const path = xmlObj.container.rootfiles.rootfile['full-path'];
  const rootPath = join(bookPath, path.split('/').slice(0, -1).join('/'));
  const rootFilePath = join(bookPath, path);

  return { rootPath, rootFilePath };
}

function buildXml(data: object, options: XmlBuilderOptionsOptional = {}) {
  const builder = new XMLBuilder(options);
  return builder.build(data);
}

function buildHTML(
  data: object,
  options = {
    attributeNamePrefix: '@',
    ignoreAttributes: false,
    format: true,
    preserveOrder: true,
    suppressEmptyNode: true,
    unpairedTags: ['hr', 'br', 'link', 'meta'],
    stopNodes: ['*.pre', '*.script'],
  },
) {
  return buildXml(data, options);
}

function parseXml(data: string, options = {}) {
  const defaultOptions = { ignoreAttributes: false, attributeNamePrefix: '' };
  options = Object.assign({}, defaultOptions, options);
  const parser = new XMLParser(options);
  const xmlString = parser.parse(data);
  return xmlString;
}

function parseHTML(data: string, options = {}) {
  const defaultOptions = {
    attributeNamePrefix: '@',
    ignoreAttributes: false,
    preserveOrder: true,
    unpairedTags: ['hr', 'br', 'link', 'meta'],
    stopNodes: ['*.pre', '*.script'],
    processEntities: true,
    htmlEntities: true,
  };

  options = Object.assign({}, defaultOptions, options);

  return parseXml(data, options);
}

/**
 * Add a book to the application
 * @param epubPath string The location of the epub file
 * @param bookPath string The destination to save the extracted epub
 * @returns
 */
async function addBook(epubPath: string, bookPath: string) {
  if (await dirExists(bookPath)) {
    // if the boox already exists, open the book
    console.log('the book already exists');
    return -1;
  }

  // create directory to hold files
  await createDir(bookPath);

  // upzip files
  await unzipEpub(epubPath, bookPath);

  // verify if the EPUB is valid

  // throw error is not valid
}

/**
 * Returns book object
 * @param bookPath string
 * @returns object
 */
async function openBook(bookPath: string) {
  // parse META-INF/container.xml and find the root file path
  const { rootPath, rootFilePath } = await getRootFilePath(bookPath);

  // get the root file object
  const rootFile = await getRootFile(rootFilePath);

  // get chapters html
  const chapters = await getChapters(rootFile.package.manifest.item, rootPath);

  // replace chapters
  rootFile.package.manifest.item = chapters;

  // Find the css values from the root files.
  const css = await getCss(rootFile.package.manifest.item, rootPath);

  // Attach the location of the css files in separate variables.

  // Find the relative location of the images folder and replace
  // with absolute location.

  // return the root file
  return { ...rootFile.package, css, path: rootPath };
}

interface Chapter {
  id: string;
  href: string;
  'media-type': string;
}

async function getChapters(chapters: Chapter[], basePath: string) {
  const data = [];

  for (const chapter of chapters) {
    if (chapter['media-type'] === 'application/xhtml+xml') {
      const path = join(basePath, chapter.href);
      const htmlRaw = await readFile(path, { encoding: 'utf-8' });
      const htmlObj = parseHTML(htmlRaw);
      let html = buildHTML(htmlObj);
      html = html.replace(/<link.*">/g, '');
      html = html.replace(/css\//g, `${basePath}/css/`);
      html = html.replace(/images\//g, `${basePath}/images`);

      data.push({ ...chapter, html });
      continue;
    }
    data.push(chapter);
  }

  return data;
}

/**
 *
 * @param chapters Chapter[]
 * @param basePath string
 * @returns string[] | null
 */
async function getCss(chapters: Chapter[], basePath = '') {
  const css = chapters.filter(c => c['media-type'] === 'text/css');

  if (css.length !== 0) {
    return css.map(c => join(basePath, c.href));
  }

  return [];
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
    await access(dir);
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
