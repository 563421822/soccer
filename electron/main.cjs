const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });
    const indexPath = path.join(__dirname, '../dist/index.html');
    win.loadURL(`file://${indexPath}`);
    win.webContents.openDevTools();
}

app.whenReady().then(createWindow);
