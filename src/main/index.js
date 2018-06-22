import {app, BrowserWindow, ipcMain} from 'electron';
import {Journal} from './journal';

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
        height: 963,
        useContentSize: true,
        width: 1600
    });
    UI.loadURL(winURL);
    UI.on('closed', () => {
        J.stop();
        UI = null;
    })
}

app.on('ready', createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() });
app.on('activate', () => { if (UI === null) createWindow() });


/*

    LET'S CHECK CONFIGS...

*/
const J = new Journal();

J.on('ready', (arg) => { console.log('yea, J seems ready', arg)});
J.on('stop', (reason, code, err) => {
    UI.webContents.send('ipc', 'log', {reason, code, err});
    console.log('J STOPPED!', {reason, code, err});
});

// Listen for async message from renderer process
ipcMain.on('ipc', function (event, c, data)  {
    console.log(c, data);
    //event.sender.send('ping', 'one');
    //UI.webContents.send('ping', 'two');

    J.go();
});

