import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../components/Workspace.vue')
  },
  {
    path: '/markdown-editor',
    name: 'MarkdownEditor',
    component: () => import('../components/tools/MarkdownEditor.vue')
  },
  {
    path: '/calculator',
    name: 'Calculator',
    component: () => import('../components/tools/Calculator.vue')
  },
  {
    path: '/unit-converter',
    name: 'UnitConverter',
    component: () => import('../components/tools/UnitConverter.vue')
  },
  {
    path: '/image-to-base64',
    name: 'ImageToBase64',
    component: () => import('../components/tools/ImageToBase64.vue')
  },
  {
    path: '/image-compressor',
    name: 'ImageCompressor',
    component: () => import('../components/tools/ImageCompressor.vue')
  },
  {
    path: '/qr-generator',
    name: 'QRGenerator',
    component: () => import('../components/tools/QRGenerator.vue')
  },
  {
    path: '/color-picker',
    name: 'ColorPicker',
    component: () => import('../components/tools/ColorPicker.vue')
  },
  {
    path: '/json-formatter',
    name: 'JsonFormatter',
    component: () => import('../components/tools/JsonFormatter.vue')
  },
  {
    path: '/regex-tester',
    name: 'RegexTester',
    component: () => import('../components/tools/RegexTester.vue')
  },
  {
    path: '/code-snippets',
    name: 'CodeSnippets',
    component: () => import('../components/tools/CodeSnippets.vue')
  },
  {
    path: '/code-image-generator',
    name: 'CodeImageGenerator',
    component: () => import('../components/tools/CodeImageGenerator.vue')
  },
  {
    path: '/ocr-tool',
    name: 'OCRTool',
    component: () => import('../components/tools/OCRTool.vue')
  },
  {
    path: '/memory-game',
    name: 'MemoryGame',
    component: () => import('../components/tools/MemoryGame.vue')
  },
  {
    path: '/whiteboard',
    name: 'Whiteboard',
    component: () => import('../components/tools/KonvaWhiteboard.vue')
  },
  {
    path: '/todo-kanban',
    name: 'FullscreenTodo',
    component: () => import('../components/tools/FullscreenTodo.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router