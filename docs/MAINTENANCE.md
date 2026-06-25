# Maintenance Guide

## Release Checklist

1. Update the version in `package.json` and `vite.config.js`.
2. Run:

   ```bash
   npm run check
   ```

3. Build:

   ```bash
   npm run build
   ```

4. Install or inspect `dist/linuxdo-enhanced.user.js` in Tampermonkey.
5. Smoke test:
   - `/latest`
   - `/new`
   - `/hot`
   - A topic page
   - Settings panel open/close
   - Search button open behavior
   - WebDAV backup and restore when credentials are available

## Dependency Updates

Use normal semver updates first:

```bash
npm update
npm run check
```

Avoid `npm audit fix --force` unless the breaking changes are reviewed. It may upgrade Vite or plugin dependencies across major versions.

## Settings Schema

All persisted settings that are backed up or restored must be registered in `src/modules/settings-schema.js`.

When adding a setting:

1. Add the storage key and default value in `constants.js`.
2. Register the key, type, default, and backup behavior in `settings-schema.js`.
3. Use `normalizeSettingValue` when reading untrusted or restored values.
4. Add UI controls in `panel-template.js` and load/save behavior in the owning module.

## WebDAV Restore Safety

Restore data is validated by key and type. Unknown keys are ignored. Invalid known keys reject the restore.

Do not bypass `normalizeRestoreSettings` in `webdav.js`.

## Userscript Permissions

Keep `vite.config.js` grants aligned with actual usage:

- `GM_getValue`
- `GM_setValue`
- `GM_addStyle`
- `GM_xmlhttpRequest`

Add new grants only when a module uses the matching API.

## Browser Verification

Use the development userscript for local verification:

1. Start `npm run dev`.
2. Install `dev.user.js` in Tampermonkey.
3. Open `https://linux.do/latest`.
4. Check the browser console for userscript errors.
5. Test SPA navigation between list pages and topic pages.

## Common Failure Areas

- Discourse header DOM changes can affect `header-buttons.js`.
- Topic list selector changes can affect `item-blocker.js` and `dom-observer.js`.
- Site theme selector changes can affect `theme.js`.
- WebDAV providers may differ in MKCOL and path behavior.
