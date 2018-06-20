import {app, BrowserWindow, ipcMain} from 'electron'
import {CONFIG} from './config';

const isSecondInstance = app.makeSingleInstance((commandLine, workingDirectory) => {
    if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus()
    }
});

if (isSecondInstance) app.quit();

if (process.env.NODE_ENV !== 'development') global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\');

let mainWindow;
const winURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`;

function createWindow() {
    mainWindow = new BrowserWindow({
        height: 563,
        useContentSize: true,
        width: 1200
    });
    mainWindow.loadURL(winURL);
    mainWindow.on('closed', () => {mainWindow = null})
}

app.on('ready', createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() });
app.on('activate', () => { if (mainWindow === null) createWindow() });


/*

    LET'S CHECK CONFIGS...

*/


const J = new Journal();
const CONFIG = new Config(function (cfg) {
    console.log(cfg);
    J.go(this);
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

