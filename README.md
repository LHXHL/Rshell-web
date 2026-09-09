# Rshell-web - Rshell C2 Web 前端

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
![Language](https://img.shields.io/badge/Language-Vue-blue)
![GitHub Stars](https://img.shields.io/github/stars/Rubby2001/Rshell-web?style=social)

> ⚠️ **免责声明**：本项目仅供安全研究人员在**授权范围内**进行渗透测试、红蓝对抗与安全教育使用，禁止用于任何未授权用途。完整声明见 [Rshell 主仓库](https://github.com/Rubby2001/Rshell---A-Cross-Platform-C2#免责声明)。

Rshell-web 是 [Rshell](https://github.com/Rubby2001/Rshell---A-Cross-Platform-C2) C2 框架的 **Web 管理前端**，基于 Vue 3 + TypeScript + Vite + Element Plus 构建，通过 WebSocket / HTTP 与服务端交互。

## Rshell 项目矩阵

| 项目 | 说明 |
|---|---|
| [Rshell---A-Cross-Platform-C2](https://github.com/Rubby2001/Rshell---A-Cross-Platform-C2) | C2 服务端（Go） |
| [Rshell-client](https://github.com/Rubby2001/Rshell-client) | Golang 客户端 |
| [Rshell-client-rust](https://github.com/Rubby2001/Rshell-client-rust) | Rust 客户端 |
| **Rshell-web** | Web 前端（本仓库） |

## 功能模块

- **总览（Home）**：上线情况与数据概览
- **监听器管理（Listener）**：添加/管理 TCP、WebSocket、KCP、HTTP(S)、OSS 等协议监听，生成客户端
- **客户端管理（Clients）**：上线主机列表、交互式终端、文件管理、进程管理
- **凭据与信息（Credentials）**：凭据收集结果管理
- **插件管理（Plugin）**：插件上传与动态加载执行
- **WebShell**：WebShell 管理
- **系统设置（Server / Settings / User）**：服务配置、账号密码修改、主题自定义

## 开发

```bash
yarn install    # 或 npm install
yarn dev        # 本地开发调试
```

## 构建部署

```bash
yarn build      # 产物输出到 dist/
```

`dist/` 由 Rshell 服务端静态托管，构建后随服务端一起部署即可，无需单独部署 Web 服务。

## License

[MIT](./LICENSE) © Rubby2001
