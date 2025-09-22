import { createRouter, createWebHistory } from 'vue-router'
import Workspace from '@/components/Workspace.vue'
import Calculator from '@/components/tools/Calculator.vue'
import ColorPicker from '@/components/tools/ColorPicker.vue'
import UnitConverter from '@/components/tools/UnitConverter.vue'
import QRGenerator from '@/components/tools/QRGenerator.vue'
import JsonFormatter from '@/components/tools/JsonFormatter.vue'
import RegexTester from '@/components/tools/RegexTester.vue'
import MemoryGame from '@/components/tools/MemoryGame.vue'
import ImageToBase64 from '@/components/tools/ImageToBase64.vue'
import CodeSnippets from '@/components/tools/CodeSnippets.vue'
import OCRTool from '@/components/tools/OCRTool.vue'
import ImageCompressor from '@/components/tools/ImageCompressor.vue'
import FullscreenTodo from '@/components/tools/FullscreenTodo.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Workspace
    },
    {
      path: '/calculator',
      name: 'Calculator',
      component: Calculator
    },

    {
      path: '/color-picker',
      name: 'ColorPicker',
      component: ColorPicker
    },
    {
      path: '/image-to-base64',
      name: 'ImageToBase64',
      component: ImageToBase64
    },
    {
      path: '/json-formatter',
      name: 'JsonFormatter',
      component: JsonFormatter
    },
    {
      path: '/memory-game',
      name: 'MemoryGame',
      component: MemoryGame
    },

    {
      path: '/qr-generator',
      name: 'QRGenerator',
      component: QRGenerator
    },
    {
      path: '/regex-tester',
      name: 'RegexTester',
      component: RegexTester
    },

    {
      path: '/unit-converter',
      name: 'UnitConverter',
      component: UnitConverter
    },
    {
      path: '/code-snippets',
      name: 'CodeSnippets',
      component: CodeSnippets
    },
    {
      path: '/ocr-tool',
      name: 'OCRTool',
      component: OCRTool
    },
    {
      path: '/image-compressor',
      name: 'ImageCompressor',
      component: ImageCompressor
    },
    {
      path: '/todo-kanban',
      name: 'TodoKanban',
      component: FullscreenTodo
    },
    {
      path: '/fullscreen-todo',
      name: 'FullscreenTodo',
      component: FullscreenTodo
    }
  ],
})

export default router
