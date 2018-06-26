import {app, BrowserWindow, ipcMain, shell} from 'electron';

const UI_Settings = {
    height: 800,
    width: 1400,
    useContentSize: true,
    show: false,
};

if (process.env.NODE_ENV !== 'development') {
    UI_Settings.transparent = true;
    UI_Settings.alwaysOnTop = true;
    UI_Settings.frame = false;
    UI_Settings.toolbar = false;
}

const isSecondInstance = app.makeSingleInstance((commandLine, workingDirectory) => {
    if (UI) {
        if (UI.isMinimized()) UI.restore();
        UI.focus()
    }
});

if (isSecondInstance) app.quit();

if (process.env.NODE_ENV !== 'development') global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\');

let UI;
const winURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`;


const handleRedirect = (e, url) => {
    if (url !== UI.webContents.getURL()) {
        e.preventDefault();
        shell.openExternal(url);
    }
};


function createWindow() {
    UI = new BrowserWindow(UI_Settings);
    UI.loadURL(winURL);
    UI.on('closed', () => {
        UI = null;
        app.quit();
    });


    if (process.env.NODE_ENV !== 'development') {
        UI.webContents.on('did-finish-load', function () {
            UI.webContents.insertCSS('html,body{ background-color: rgba(0,0,0,.9) !important;}')
        });
    }

    UI.maximize();
    UI.webContents.on('will-navigate', handleRedirect);
    UI.webContents.on('new-window', handleRedirect);
    UI.webContents.on('dom-ready', () => UI.show());
}

app.on('ready', createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() });
app.on('activate', () => { if (UI === null) createWindow() });


/*

    LET'S CHECK CONFIGS...

*/
ipcMain.on('ipc', function (event, c, data) {
    switch (c) {
        case 'shutdown':
            app.quit();
            break;
        default:
            console.log('IPC/UI:', c, data);
    }

});

// todo: decide where we going to track hot-keys and how to display overlay
function send2UI(c, data) {
    if (UI && UI.webContents) {
        UI.webContents.send('ipc', c, data);
    } else {
        console.log(`Unable to send ${c} to UI - No UI ready`, {c, data});
    }
}