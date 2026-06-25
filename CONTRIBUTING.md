# Contributing

Thanks for helping improve Linux.do Enhanced.

## Development Setup

```bash
npm install
npm run dev
```

Install `dev.user.js` in Tampermonkey, then open `https://linux.do`.

## Quality Checks

Run the full check before opening a pull request:

```bash
npm run check
```

Use the formatter before committing larger changes:

```bash
npm run format
```

## Pull Request Guidelines

- Keep changes scoped to one feature or fix.
- Include behavior notes for UI, storage, route, or WebDAV changes.
- Run `npm run check` and mention the result in the PR.
- Do not commit built output from `dist/`.
- Do not add secrets, tokens, private WebDAV URLs, or real credentials.

## Code Style

- Prefer small modules over large files.
- Reuse selectors, constants, and schema helpers already in `src/modules`.
- Validate external input before storing or applying it.
- Keep userscript permissions in `vite.config.js` aligned with actual usage.
