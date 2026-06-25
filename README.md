# Linux.do 增强脚本 - 模块化开发版

## 项目结构

```
linuxdoS/
├── src/
│   ├── main.js              # 入口文件
│   ├── modules/             # 核心模块
│   │   ├── constants.js     # 常量定义
│   │   ├── utils.js         # 工具函数
│   │   ├── ad-remover.js    # 广告移除模块
│   │   ├── item-blocker.js  # 内容屏蔽模块
│   │   ├── webdav.js        # WebDAV 同步
│   │   ├── theme.js         # 主题管理
│   │   └── ui.js            # UI 面板
│   └── styles/
│       └── panel.js         # 样式定义
├── dev.user.js              # 开发模式脚本
├── vite.config.js           # Vite 配置
├── package.json
└── dist/                    # 构建输出目录
    └── linuxdo-enhanced.user.js
```

## 快速开始

### 1. 安装依赖

```bash
cd f:\TestApp\linuxdoS
npm install
```

### 2. 开发模式

启动开发服务器：

```bash
npm run dev
```

服务器将在 `http://localhost:5173` 启动。

**在 Tampermonkey 中安装开发脚本：**

1. 在 Tampermonkey 中打开 `dev.user.js`
2. 安装该脚本
3. 访问 `https://linux.do`，脚本会自动从本地服务器加载
4. 修改 `src/` 下的任何文件，页面会自动热重载

### 3. 构建生产版本

```bash
npm run build
```

构建完成后，在 `dist/` 目录下生成 `linuxdo-enhanced.user.js`，可直接安装到 Tampermonkey。

## 模块说明

### constants.js
定义所有常量：配置键、选择器、默认值等。

### utils.js
工具函数：日志、防抖、列表解析、日期处理等。

### ad-remover.js
广告移除模块：
- UI 元素移除
- 已读帖子管理
- 动态样式注入

### item-blocker.js
内容屏蔽模块：
- 用户/关键词/分区屏蔽
- 旧帖屏蔽
- 帖子过滤逻辑

### webdav.js
WebDAV 云端同步：
- 备份设置到云端
- 从云端恢复设置

### theme.js
主题管理：
- 检测网站主题
- 应用面板主题
- 主题变化监听

### ui.js
UI 面板管理：
- 面板创建和显示
- 设置保存/加载
- Toast 提示
- 全局点击处理

### panel.js
样式定义：
- 面板样式
- Toast 样式
- 移动端适配

## 开发技巧

### 实时调试

开发模式下：
1. 打开浏览器开发者工具
2. 修改源代码
3. Vite 会自动编译并热重载
4. 在 Console 中查看日志（需在 `constants.js` 中设置 `DEBUG = true`）

### 模块热替换

修改任何模块文件后，Vite 会自动重新加载该模块，无需刷新页面。

### 调试日志

在 `constants.js` 中设置 `DEBUG = true` 启用详细日志：

```javascript
export const DEBUG = true;
```

## 常见问题

### Q: 开发模式无法加载？
A: 确保：
1. 开发服务器正在运行 (`npm run dev`)
2. Tampermonkey 允许访问本地文件
3. 浏览器未阻止 `localhost:5173` 的请求

### Q: 如何禁用某个功能模块？
A: 在对应模块中注释掉相关代码，或在 `main.js` 中移除该模块的导入。

### Q: 构建后脚本不工作？
A: 检查：
1. Tampermonkey 的 `@grant` 权限是否正确
2. 构建输出的 `dist/linuxdo-enhanced.user.js` 是否完整
3. 浏览器控制台是否有错误信息

## 许可

同原脚本许可
