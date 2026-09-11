# Rshell-web - Web Frontend for the Rshell C2

English | **[简体中文](./README_zh-CN.md)**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
![Language](https://img.shields.io/badge/Language-Vue-blue)
![GitHub Stars](https://img.shields.io/github/stars/Rubby2001/Rshell-web?style=social)

> ⚠️ **Disclaimer**: This project is intended solely for security research, **authorized** penetration testing, red/blue teaming and education. Do not use it for any unauthorized purpose. See the full disclaimer in the [main repository](https://github.com/Rubby2001/Rshell---A-Cross-Platform-C2#disclaimer).

Rshell-web is the **web management frontend** of the [Rshell](https://github.com/Rubby2001/Rshell---A-Cross-Platform-C2) C2 framework, built with Vue 3 + TypeScript + Vite + Element Plus, talking to the server over WebSocket / HTTP.

## Rshell Project Matrix

| Project | Description |
|---|---|
| [Rshell---A-Cross-Platform-C2](https://github.com/Rubby2001/Rshell---A-Cross-Platform-C2) | C2 server (Go) |
| [Rshell-client](https://github.com/Rubby2001/Rshell-client) | Golang client |
| [Rshell-client-rust](https://github.com/Rubby2001/Rshell-client-rust) | Rust client |
| **Rshell-web** | Web frontend (this repo) |

## Feature Modules

- **Overview (Home)**: callback status and statistics dashboard
- **Listeners**: create and manage TCP / WebSocket / KCP / HTTP(S) / OSS listeners and generate clients
- **Clients**: callback host list, interactive terminal, file manager, process manager
- **Credentials**: collected credential management
- **Plugins**: plugin upload with dynamic loading and execution
- **WebShell**: webshell management
- **System (Server / Settings / User)**: server configuration, credential changes, theme customization

## Development

```bash
yarn install    # or npm install
yarn dev        # local dev server
```

## Build & Deployment

```bash
yarn build      # outputs to dist/
```

`dist/` is served statically by the Rshell server — deploy it alongside the server; no separate web hosting is required.

## License

[MIT](./LICENSE) © Rubby2001
