# Linux.do Enhanced

A Tampermonkey userscript that enhances Linux.do with ad hiding, topic filtering, visited-topic styling, header search, theme adaptation, and WebDAV backup.

## Features

- Hide configured global notices, homepage ads, topic page ads, and homepage banner content.
- Filter topics by user, title keyword, category, and tag.
- Filter old homepage topics by activity date.
- Mark visited topics with lower opacity.
- Add a consistent header search button on list pages.
- Adapt the settings panel to the site theme.
- Back up and restore settings through WebDAV.

## Requirements

- Node.js 20 or newer.
- npm.
- Tampermonkey or a compatible userscript manager.
- A browser that can access `https://linux.do`.

## Installation

### Development Script

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Install `dev.user.js` in Tampermonkey.
4. Open `https://linux.do`.

The development script loads modules from `http://localhost:5173` and supports hot updates.

### Production Build

```bash
npm run build
```

The production userscript is generated at:

```text
dist/linuxdo-enhanced.user.js
```

Install that file in Tampermonkey.

## Usage

Open Linux.do and use the gear button in the header to configure:

- Content hiding switches.
- Blocked users.
- Blocked categories and tags.
- Blocked title keywords.
- Old-topic filtering.
- WebDAV backup credentials.

Settings are stored locally by the userscript manager. WebDAV credentials are also stored locally, so use them only on trusted devices.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local Vite development server |
| `npm run build` | Build the production userscript |
| `npm run syntax` | Run JavaScript syntax checks |
| `npm run lint` | Run ESLint |
| `npm run format` | Format source files with Prettier |
| `npm run format:check` | Check Prettier formatting |
| `npm run check` | Run syntax, lint, format check, and build |

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Maintenance Guide](docs/MAINTENANCE.md)
- [Contributing](CONTRIBUTING.md)
- [Security Policy](SECURITY.md)

## Project Layout

```text
src/
  main.js
  modules/
  styles/
scripts/
docs/
.github/
```

Detailed module responsibilities are documented in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Development Notes

- Do not commit `dist/`.
- Run `npm run check` before committing.
- Keep userscript grants in `vite.config.js` aligned with actual `GM_*` usage.
- Register persisted settings in `src/modules/settings-schema.js`.
- Remove credentials, cookies, tokens, and private WebDAV URLs from issues and logs.

## License

MIT. See [LICENSE](LICENSE).
