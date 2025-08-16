import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 配置为在 /aichat 路径下访问
  base: "/",
  server: {
    port: 5173,
  },
});

