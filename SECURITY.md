# Security Policy

## Supported Versions

Only the latest code on the default branch is maintained.

## Reporting a Vulnerability

Do not open a public issue for sensitive reports.

Send a private report to the maintainer through the repository owner's preferred contact channel. Include:

- Affected version or commit.
- Steps to reproduce.
- Impact and affected data.
- Any relevant console errors or network behavior.

## Security Notes

- WebDAV credentials are stored locally by the userscript manager.
- Backup restore validates known setting keys and value types before writing them.
- Never include credentials, cookies, tokens, or private WebDAV endpoints in issues or pull requests.
