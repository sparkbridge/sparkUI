import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { readFileSync } from 'fs';

// 读取 package.json 的内容
const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default defineConfig({
  plugins: [vue()],
  define: {
    // 定义全局常量，注意字符串需要通过 JSON.stringify 处理
    __APP_VERSION__: JSON.stringify(`v${packageJson.version}`),
    // 也可以自动生成编译时间
    __BUILD_TIME__: JSON.stringify(new Date().toLocaleString())
  },
  server: {
    proxy: {
      // 将 /api 开头的请求代理到后端
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
      // 将插件静态资源路径也进行代理
      '/plugin-views': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      }
    }
  }
})