import {app, BrowserWindow, ipcMain} from 'electron'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
    global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow;
const winURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`;

function createWindow() {
    /**
     * Initial window options
     */
    mainWindow = new BrowserWindow({
        height: 563,
        useContentSize: true,
        width: 1200
    });

    mainWindow.loadURL(winURL);

    mainWindow.on('closed', () => {mainWindow = null})

}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow()
    }
});












// Listen for async message from renderer process
ipcMain.on('async', (event, arg) => {
    // Print 1
    console.log(arg);
    // Reply on async message from renderer process
    event.sender.send('async-reply', 2);
});

// Listen for sync message from renderer process
ipcMain.on('sync', (event, arg) => {
    // Print 3
    console.log(arg);
    // Send value synchronously back to renderer process
    event.returnValue = 4;
    // Send async message to renderer process
    mainWindow.webContents.send('ping', 5);
});
























/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
