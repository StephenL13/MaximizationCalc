// electron/main.js (ESM-compatible version)
import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
        },
    });

    if (app.isPackaged) {
        // Production: load the built index.html
        win.loadFile(path.join(__dirname, '../dist/index.html'));
    } else {
        // Development: load Vite dev server
        win.loadURL('http://localhost:5173');
    }
    win.webContents.openDevTools();

    win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error(`Failed to load page: ${errorDescription} (${errorCode})`);
    });
}

app.whenReady().then(createWindow);
