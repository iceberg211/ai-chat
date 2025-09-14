import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vitePluginImp from "vite-plugin-imp";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  // 配置为在 /aichat 路径下访问
  base: "/",
  server: {
    port: 5173,
  },
  build: {
    minify: "esbuild", // 或者 'terser' 获得更好的压缩率
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          antd: ["antd", "@ant-design/icons"],
        },
      },
    },
  },
});

