import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // 字符串简写写法
      // '/foo': 'http://localhost:4567',
      // 选项写法
      '/api': {
        target: 'http://localhost:3002', // 代理的目标地址
        changeOrigin: true, // 需要虚拟主机站点
        // 如果你的后端接口路径没有 /api 前缀，可以用 rewrite 去掉
        // rewrite: (path) => path.replace(/^\/api/, '') 
      },
    },
     // 【重要修改】在这里添加 build 配置
     build: {
      /**
       * 指定生成静态资源的存放路径
       * (相对于 build.outDir，即 dist 目录)
       */
      assetsDir: 'static'
    }
  }
})