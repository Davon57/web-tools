import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/api/proxy/juhe': {
        target: 'https://v.juhe.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/proxy\/juhe/, '')
      }
    }
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: [
      'react',
      'react-dom/client',
      'konva',
      'react-konva',
      'element-plus'
    ],
    // 强制预构建这些依赖
    force: false
  },
  // 构建优化
  build: {
    // 增加 chunk 大小警告阈值
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // 手动分包，将大型依赖单独打包
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'konva-vendor': ['konva', 'react-konva'],
          'element-plus-vendor': ['element-plus']
        }
      }
    },
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 生成 source map 用于生产环境调试
    sourcemap: true
  },
  // 预加载优化 - 移除有问题的 renderBuiltUrl 配置
  // experimental.renderBuiltUrl 的 runtime 选项需要预定义的全局函数
  // 暂时移除此配置，使用默认的资源路径处理
  // experimental: {
  //   renderBuiltUrl(filename, { hostType }) {
  //     if (hostType === 'js') {
  //       return { runtime: `window.__assetsPath(${JSON.stringify(filename)})` }
  //     }
  //   }
  // }
})
