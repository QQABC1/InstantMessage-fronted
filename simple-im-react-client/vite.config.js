import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173, // 前端端口
    proxy: {
      // 字符串简写写法：http://localhost:5173/api -> http://localhost:8080/api
      '/api': {
        target: 'http://localhost:8080', // 后端地址
        changeOrigin: true, // 允许跨域
        secure: false,      // 如果是https接口，需要配置这个参数
      }
    }
  }
})
