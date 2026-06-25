import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.js',
      userscript: {
        name: 'Linux.do 增强脚本',
        namespace: 'http://tampermonkey.net/',
        version: '8.24.1',
        description: '去除广告，根据用户名、分区、标签和关键词屏蔽帖子，支持屏蔽指定天数前的旧帖，支持 WebDAV 同步，并自动适配网站主题。',
        author: 'fork25 & AI Assistant',
        match: ['https://linux.do/*'],
        grant: ['GM_setValue', 'GM_getValue', 'GM_addStyle', 'GM_xmlhttpRequest'],
        'run-at': 'document-start',
      },
      build: {
        externalGlobals: {},
      },
    }),
  ],
  server: {
    port: 5173,
  },
});
