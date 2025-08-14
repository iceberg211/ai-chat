import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 使用自定义域名部署到 GitHub Pages 时保持默认 base 即可
  // 若使用仓库路径 gh-pages 部署（无自定义域），可将 base 设置为 '/repo-name/'
  base: '/',
  server: {
    port: 5173
  }
})

