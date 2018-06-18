import Vue from 'vue'
import axios from 'axios'
import App from './App'


if (!process.env.IS_WEB) Vue.use(require('vue-electron'));
Vue.http = Vue.prototype.$http = axios;
Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
    components: {App},
    template: '<App/>'
}).$mount('#app');
















var {ipcRenderer} = require('electron');

// Send async message to main process
ipcRenderer.send('async', 1);

// Listen for async-reply message from main process
ipcRenderer.on('async-reply', (event, arg) => {
    // Print 2
    console.log(arg);
    // Send sync message to main process
    let mainValue = ipcRenderer.sendSync('sync', 3);
    // Print 4
    console.log(mainValue);
});

// Listen for main message
ipcRenderer.on('ping', (event, arg) => {
    // Print 5
    console.log(arg);

});



