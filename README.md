# ED-VOID Client

Simple CLI Journal reader for ED-VOID.
Read journals and upload it to ed-void server, where server process it and re-route to online web-clients.

Registered pilots can also download client on cmdr's page as well.
To make your own build you need "npm pkg" module installed.

### About ED-VOID
ED-VOID is THE ULTIMATE EXPLORER'S TOOL, designed by explorers for explorers.
http://ed-void.com/

It helps you with scanned stellar bodies, navigation, reporting your exploration data, and get extended body information, based on existing reports.

**dɪsˈkleɪmə:**

*Unfortunately, I am not a part of Frontier Developments Plc. I'm using assets from original Elite Dangerous game to make people feel more comfortable playing with ED-VOID tools. All right on Elite Dangerous and assets belongs to Frontier Dev Plc.*

### VERSIONS
**v.0.2b - CURRENT**
- automatically retrieve api-key on first start.
- automatically search for saved games folder and cmdr's journals.
- filewatcher improved.
- status & position update decreased to ~1 sec.
- status data goes through web-socket (faster)
