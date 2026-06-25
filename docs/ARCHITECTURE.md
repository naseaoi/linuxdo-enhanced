# Architecture

Linux.do Enhanced is a Tampermonkey userscript built with Vite and `vite-plugin-monkey`.

## Runtime Flow

1. `src/main.js` injects base styles, installs global click handling, loads persisted settings, creates the settings panel, and starts observers.
2. `src/modules/ad-remover.js` loads UI toggles, injects dynamic CSS, removes configured DOM targets, and manages visited topic state.
3. `src/modules/item-blocker.js` applies user, keyword, category, tag, and old-post filtering to topic list items and topic posts.
4. `src/modules/dom-observer.js` watches Discourse route content and schedules incremental processing.
5. `src/modules/route-observer.js` watches SPA route changes by wrapping history methods and listening to browser navigation events.
6. `src/modules/ui.js` creates the settings panel and wires settings actions.

## Module Map

| Module | Responsibility |
| --- | --- |
| `main.js` | Startup, scheduling, route refresh orchestration |
| `constants.js` | Selectors, storage keys, defaults, IDs |
| `settings-schema.js` | Setting defaults, backup keys, restore validation |
| `ad-remover.js` | Ad hiding, dynamic styles, visited topic storage |
| `item-blocker.js` | Topic/user/category/keyword filtering |
| `dom-observer.js` | MutationObserver classification and processing hooks |
| `route-observer.js` | SPA route change detection |
| `header-buttons.js` | Header settings and search buttons |
| `ui.js` | Settings panel lifecycle and event binding |
| `panel-template.js` | Settings panel HTML |
| `panel-drag.js` | Desktop panel dragging |
| `toast-controller.js` | Global toast UI |
| `webdav.js` | WebDAV backup and restore |
| `theme.js` | Theme detection and panel theme application |
| `utils.js` | Shared parsing, route, and encoding helpers |

## Storage

Settings use Tampermonkey `GM_getValue` and `GM_setValue`.

Visited topics now use `GM_*` storage under `VISITED_TOPICS_KEY`. The loader still reads legacy `localStorage` data once when GM data is missing, then migrates it into GM storage.

WebDAV backup uses `settings-schema.js` to select backup keys and validate restore data before writing.

## Styles

Styles are generated as strings and injected through `GM_addStyle`.

| File | Responsibility |
| --- | --- |
| `src/styles/panel.js` | Main settings panel |
| `src/styles/toast.js` | Global toast |
| `src/styles/mobile.js` | Mobile panel layout |

## Build Outputs

`npm run build` writes the production userscript to `dist/`. The `dist/` directory is ignored by Git.
