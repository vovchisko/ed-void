import {app, BrowserWindow, ipcMain} from 'electron';


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

function createWindow() {
    UI = new BrowserWindow({
        height: 800,
        useContentSize: true,
        width: 1400
    });
    UI.loadURL(winURL);
    UI.on('closed', () => {
        UI = null;
        app.quit();
    })
}

app.on('ready', createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() });
app.on('activate', () => { if (UI === null) createWindow() });


/*

    LET'S CHECK CONFIGS...

*/
ipcMain.on('ipc', function (event, c, data) {
    switch (c) {

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
