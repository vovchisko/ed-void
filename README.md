# ed-void-client

> ED-VOID Client

Overlay and client app for ED-VOID.
Read journals and upload it to ed-void server, where server process it and re-route to online web-clients. Provide fast fps-friendly overlay with basic information.

### About ED-VOID
ED-VOID is THE ULTIMATE EXPLORER'S TOOL, designed by explorers for explorers.
http://ed-void.com/

It helps you with scanned stellar bodies, navigation, reporting your exploration data, and get extended body information, based on existing reports.

### COMING FEATURES
-- Auto-update
-- Racing Module (don't tell anyone)
-- Search for public reports
-- + Overlay-version of most modules from web version

### VERSIONS
**v.0.3dev - EXTREMELY-UNSTABLE**
- migrated to electron-based client
- journal reader performance ++
- overlay prototype with basic feature - login :3
- cross-cleint modules (any module can be used on client and overlay)

**v.0.2b - CLI VERSION**
- automatically retrieve api-key on first start.
- automatically search for saved games folder and cmdr's journals.
- filewatcher improved.
- status & position update decreased to ~1 sec.
- status data goes through web-socket (faster)

#### Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:9080
npm run dev

# build electron application for production
npm run build

```

---
This project was generated with [electron-vue](https://github.com/SimulatedGREG/electron-vue)@[4c6ee7b](https://github.com/SimulatedGREG/electron-vue/tree/4c6ee7bf4f9b4aa647a22ec1c1ca29c2e59c3645) using [vue-cli](https://github.com/vuejs/vue-cli).
---

**dɪsˈkleɪmə:**
*Unfortunately, I am not a part of Frontier Developments Plc. I'm using assets from original Elite Dangerous game to make people feel more comfortable playing with ED-VOID tools. All right on Elite Dangerous and assets belongs to Frontier Dev Plc.*
