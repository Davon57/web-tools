import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { splitVendorChunkPlugin } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      // 启用响应式语法糖
      reactivityTransform: true,
      // 生产环境移除开发工具
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('ion-')
        }
      }
    }),
    // 自动分割第三方库
    splitVendorChunkPlugin(),
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
  // 静态资源处理
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg'],
  // 优化依赖预构建
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'element-plus',
      'konva',
      'axios',
      'html2canvas',
      'tesseract.js',
      'three',
      'highlight.js',
      'md-editor-v3'
    ],
    // 排除不需要预构建的依赖
    exclude: ['@vavt/v3-extension'],
    // 强制预构建这些依赖
    force: false
  },
  // 构建优化
  build: {
    // 构建优化
    minify: 'terser', // 使用 terser 进行代码压缩
    cssCodeSplit: true, // 启用 CSS 代码分割
    sourcemap: false, // 生产环境不生成 sourcemap
    // 资源内联阈值
    assetsInlineLimit: 4096, // 小于 4kb 的资源内联为 base64
    // 压缩配置
    terserOptions: {
      compress: {
        drop_console: true, // 移除 console
        drop_debugger: true, // 移除 debugger
        pure_funcs: ['console.log'] // 移除指定函数调用
      }
    },
    // 分包大小警告阈值
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // 手动分包，将大型依赖单独打包
        manualChunks: {
          // Vue 核心库
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          // UI 组件库
          'ui-vendor': ['element-plus'],
          // 图形处理库
          'graphics-vendor': ['konva', 'three', 'three-orbitcontrols'],
          // 工具库
          'utils-vendor': ['axios', 'html2canvas', 'tesseract.js', 'browser-image-compression'],
          // 编辑器相关
          'editor-vendor': ['md-editor-v3', 'highlight.js', 'markdown-it-mark']
        }
      }
    }
  }
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
