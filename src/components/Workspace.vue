<template>
  <div class="workspace">
    <!-- 左侧网站链接区域 -->
    <div class="left-section">
      <div class="website-categories">
        <div class="category-tabs">
          <button 
            v-for="category in websiteCategories" 
            :key="category.id"
            :class="['tab-button', { active: activeCategory === category.id }]"
            @click="activeCategory = category.id"
          >
            <span class="category-icon">{{ category.icon }}</span>
            {{ category.name }}
          </button>
        </div>
        
        <!-- 如果当前分类有子分类，显示子分类结构 -->
        <div v-if="currentCategory && currentCategory.subcategories" class="subcategories-container">
          <div 
            v-for="subcategory in currentCategory.subcategories" 
            :key="subcategory.id"
            class="subcategory-section"
          >
            <div class="subcategory-header">
              <span class="subcategory-icon">{{ subcategory.icon }}</span>
              <h3 class="subcategory-title">{{ subcategory.name }}</h3>
            </div>
            <div class="website-grid">
              <div 
                v-for="website in subcategory.websites" 
                :key="website.id"
                class="website-card"
                @click="openWebsite(website.url)"
              >
                <div class="card-header">
                  <div class="website-icon">{{ website.icon }}</div>
                  <div class="website-info">
                    <h3 class="website-name">{{ website.name }}</h3>
                    <span class="website-version" v-if="website.version">{{ website.version }}</span>
                  </div>
                </div>
                <p class="website-description">{{ website.description }}</p>
                <div class="card-footer">
                  <span class="website-url">{{ website.displayUrl }}</span>
                  <div class="external-link-icon">🔗</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 如果当前分类没有子分类，显示扁平的网站列表 -->
        <div v-else class="website-grid">
          <div 
            v-for="website in currentCategoryWebsites" 
            :key="website.id"
            class="website-card"
            @click="openWebsite(website.url)"
          >
            <div class="card-header">
              <div class="website-icon">{{ website.icon }}</div>
              <div class="website-info">
                <h3 class="website-name">{{ website.name }}</h3>
                <span class="website-version" v-if="website.version">{{ website.version }}</span>
              </div>
            </div>
            <p class="website-description">{{ website.description }}</p>
            <div class="card-footer">
              <span class="website-url">{{ website.displayUrl }}</span>
              <div class="external-link-icon">🔗</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧区域 -->
    <div class="right-section">
      <!-- 时间问候语区域 -->
      <div class="greeting-section">
        <div class="time-display">
          <div class="current-time">{{ currentTime }}</div>
          <div class="current-date">{{ currentDate }}</div>
        </div>
        <div class="greeting-content">
          <p class="quote-text">{{ motivationalQuote }}</p>
        </div>
      </div>

      <!-- 系统工具/小应用区域 -->
      <div class="tools-section">
        <h3 class="section-title">系统工具</h3>
        <div class="tools-grid">
          <div 
            v-for="tool in systemTools" 
            :key="tool.id"
            class="tool-card"
            @click="openTool(tool)"
          >
            <div class="tool-icon">{{ tool.icon }}</div>
            <div class="tool-name">{{ tool.name }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Quote from 'inspirational-quotes'

// 时间相关的响应式数据
const currentTime = ref('')
const currentDate = ref('')
const motivationalQuote = ref('')
const activeCategory = ref('frontend-frameworks')

// 定时器
let timeInterval = null

// 励志语录 - 使用inspirational-quotes库
// 备用语录，当API调用失败时使用
const fallbackQuotes = [
  { text: '成功不是终点，失败不是末日，继续前进的勇气才最可贵。', author: '温斯顿·丘吉尔' },
  { text: '每一个优秀的程序员都是问题解决者，而不仅仅是代码编写者。', author: '约翰·约翰逊' },
  { text: '持续学习是程序员最重要的技能，技术在变，学习的能力不变。', author: '史蒂夫·乔布斯' },
  { text: '简洁的代码胜过聪明的代码，可读性永远比炫技更重要。', author: '罗伯特·马丁' },
  { text: '今天的努力是明天成功的基石，每一行代码都在为未来铺路。', author: '比尔·盖茨' },
  { text: '优秀的程序员不是写代码最多的，而是解决问题最有效的。', author: '林纳斯·托瓦兹' },
  { text: '编程不仅是技术，更是一种思维方式和解决问题的艺术。', author: '艾伦·凯' }
]

// 系统工具数据
const systemTools = ref([
  { id: 'calculator', name: '计算器', icon: '🧮', component: 'Calculator' },
  { id: 'unit', name: '单位转换', icon: '📏', component: 'UnitConverter' },
  { id: 'base64', name: 'Base64', icon: '🔄', component: 'ImageToBase64' },
  { id: 'qrcode', name: '二维码生成', icon: '📱', component: 'QRGenerator' },
  { id: 'color', name: '颜色工具', icon: '🎨', component: 'ColorPicker' },
  { id: 'json', name: 'JSON', icon: '📋', component: 'JsonFormatter' },
  { id: 'regex', name: '正则测试', icon: '🔍', component: 'RegexTester' },
  { id: 'memory', name: '记忆游戏', icon: '🧠', component: 'MemoryGame' }
])

// 网站分类数据
const websiteCategories = ref([
  {
    id: 'frontend-frameworks',
    name: '前端框架',
    icon: '⚛️',
    subcategories: [
      {
        id: 'web-frameworks',
        name: 'Web框架',
        icon: '🌐',
        websites: [
          {
            id: 'vue2',
            name: 'Vue.js 2',
            version: 'v2.x',
            icon: '💚',
            url: 'https://v2.vuejs.org/',
            displayUrl: 'v2.vuejs.org',
            description: 'Vue.js 2.x 官方文档，渐进式JavaScript框架'
          },
          {
            id: 'vue3',
            name: 'Vue.js 3',
            version: 'v3.x',
            icon: '💚',
            url: 'https://vuejs.org/',
            displayUrl: 'vuejs.org',
            description: 'Vue.js 3.x 官方文档，现代化的渐进式框架'
          },
          {
            id: 'react',
            name: 'React',
            version: 'v18.x',
            icon: '⚛️',
            url: 'https://react.dev/',
            displayUrl: 'react.dev',
            description: '用于构建用户界面的JavaScript库'
          },
          {
            id: 'angular',
            name: 'Angular',
            version: 'v17.x',
            icon: '🅰️',
            url: 'https://angular.io/',
            displayUrl: 'angular.io',
            description: '现代化的Web应用开发平台'
          },
          {
            id: 'svelte',
            name: 'Svelte',
            version: 'v4.x',
            icon: '🧡',
            url: 'https://svelte.dev/',
            displayUrl: 'svelte.dev',
            description: '编译时优化的现代前端框架'
          },
          {
            id: 'pinia',
            name: 'Pinia',
            version: 'v2.x',
            icon: '🍍',
            url: 'https://pinia.vuejs.org/',
            displayUrl: 'pinia.vuejs.org',
            description: 'Vue 3 的直观状态管理库'
          },
          {
            id: 'vuex',
            name: 'Vuex',
            version: 'v4.x',
            icon: '💚',
            url: 'https://vuex.vuejs.org/',
            displayUrl: 'vuex.vuejs.org',
            description: 'Vue.js 的状态管理模式'
          },
          {
            id: 'redux',
            name: 'Redux',
            version: 'v5.x',
            icon: '🟣',
            url: 'https://redux.js.org/',
            displayUrl: 'redux.js.org',
            description: 'JavaScript应用的可预测状态容器'
          },
          {
            id: 'zustand',
            name: 'Zustand',
            version: 'v4.x',
            icon: '🐻',
            url: 'https://zustand-demo.pmnd.rs/',
            displayUrl: 'zustand-demo.pmnd.rs',
            description: '小巧、快速、可扩展的状态管理'
          },
          {
            id: 'vue-router',
            name: 'Vue Router',
            version: 'v4.x',
            icon: '💚',
            url: 'https://router.vuejs.org/',
            displayUrl: 'router.vuejs.org',
            description: 'Vue.js 的官方路由管理器'
          },
          {
            id: 'react-router',
            name: 'React Router',
            version: 'v6.x',
            icon: '⚛️',
            url: 'https://reactrouter.com/',
            displayUrl: 'reactrouter.com',
            description: 'React 的声明式路由'
          },
          {
            id: 'next-router',
            name: 'Next.js Router',
            version: 'v14.x',
            icon: '▲',
            url: 'https://nextjs.org/docs/routing',
            displayUrl: 'nextjs.org/docs/routing',
            description: 'Next.js 的文件系统路由'
          }
        ]
      },
      {
        id: 'nodejs-frameworks',
        name: 'Node.js框架',
        icon: '🟢',
        websites: [
          {
            id: 'express',
            name: 'Express.js',
            version: 'v4.x',
            icon: '🚂',
            url: 'https://expressjs.com/',
            displayUrl: 'expressjs.com',
            description: '快速、开放、极简的Node.js Web框架'
          },
          {
            id: 'koa',
            name: 'Koa.js',
            version: 'v2.x',
            icon: '🥥',
            url: 'https://koajs.com/',
            displayUrl: 'koajs.com',
            description: '由Express团队设计的下一代Web框架'
          },
          {
            id: 'nestjs',
            name: 'NestJS',
            version: 'v10.x',
            icon: '🐱',
            url: 'https://nestjs.com/',
            displayUrl: 'nestjs.com',
            description: '构建高效、可扩展的Node.js服务器端应用'
          },
          {
            id: 'fastify',
            name: 'Fastify',
            version: 'v4.x',
            icon: '⚡',
            url: 'https://www.fastify.io/',
            displayUrl: 'fastify.io',
            description: '快速且低开销的Node.js Web框架'
          }
        ]
      },
      {
        id: 'fullstack-frameworks',
        name: '全栈框架',
        icon: '🌐',
        websites: [
          {
            id: 'nextjs',
            name: 'Next.js',
            version: 'v14.x',
            icon: '▲',
            url: 'https://nextjs.org/',
            displayUrl: 'nextjs.org',
            description: 'React全栈框架，用于生产环境'
          },
          {
            id: 'nuxtjs',
            name: 'Nuxt.js',
            version: 'v3.x',
            icon: '💚',
            url: 'https://nuxt.com/',
            displayUrl: 'nuxt.com',
            description: 'Vue.js全栈框架，直观的Web开发'
          },
          {
            id: 'sveltekit',
            name: 'SvelteKit',
            version: 'v2.x',
            icon: '🧡',
            url: 'https://kit.svelte.dev/',
            displayUrl: 'kit.svelte.dev',
            description: 'Svelte的全栈应用框架'
          },
          {
            id: 'remix',
            name: 'Remix',
            version: 'v2.x',
            icon: '💿',
            url: 'https://remix.run/',
            displayUrl: 'remix.run',
            description: '专注于Web标准的全栈React框架'
          }
        ]
      },
      {
        id: 'mobile-frameworks',
        name: '移动端框架',
        icon: '📱',
        websites: [
          {
            id: 'react-native',
            name: 'React Native',
            version: 'v0.73.x',
            icon: '⚛️',
            url: 'https://reactnative.dev/',
            displayUrl: 'reactnative.dev',
            description: '使用React构建原生移动应用'
          },
          {
            id: 'flutter',
            name: 'Flutter',
            version: 'v3.x',
            icon: '🐦',
            url: 'https://flutter.dev/',
            displayUrl: 'flutter.dev',
            description: 'Google的UI工具包，构建跨平台应用'
          },
          {
            id: 'ionic',
            name: 'Ionic',
            version: 'v7.x',
            icon: '⚡',
            url: 'https://ionicframework.com/',
            displayUrl: 'ionicframework.com',
            description: '跨平台移动应用开发框架'
          },
          {
            id: 'capacitor',
            name: 'Capacitor',
            version: 'v5.x',
            icon: '⚡',
            url: 'https://capacitorjs.com/',
            displayUrl: 'capacitorjs.com',
            description: '跨平台原生运行时，适用于Web应用'
          },
          {
            id: 'taro',
            name: 'Taro',
            version: 'v3.x',
            icon: '🥔',
            url: 'https://taro.jd.com/',
            displayUrl: 'taro.jd.com',
            description: '多端统一开发框架，支持小程序、H5、RN等'
          },
          {
            id: 'uniapp',
            name: 'uni-app',
            version: 'v3.x',
            icon: '🦄',
            url: 'https://uniapp.dcloud.net.cn/',
            displayUrl: 'uniapp.dcloud.net.cn',
            description: '使用Vue.js开发所有前端应用的框架'
          },
          {
            id: 'wepy',
            name: 'WePY',
            version: 'v2.x',
            icon: '🔥',
            url: 'https://wepyjs.github.io/wepy-docs/',
            displayUrl: 'wepyjs.github.io',
            description: '让小程序支持组件化开发的框架'
          },
          {
            id: 'mpvue',
            name: 'mpvue',
            version: 'v2.x',
            icon: '💚',
            url: 'http://mpvue.com/',
            displayUrl: 'mpvue.com',
            description: '基于Vue.js的小程序开发框架'
          }
        ]
      },
      {
        id: 'css-frameworks',
        name: 'CSS框架',
        icon: '🎭',
        websites: [
          {
            id: 'tailwindcss',
            name: 'Tailwind CSS',
            version: 'v3.x',
            icon: '🌊',
            url: 'https://tailwindcss.com/',
            displayUrl: 'tailwindcss.com',
            description: '实用优先的CSS框架'
          },
          {
            id: 'bootstrap',
            name: 'Bootstrap',
            version: 'v5.x',
            icon: '🅱️',
            url: 'https://getbootstrap.com/',
            displayUrl: 'getbootstrap.com',
            description: '强大的前端工具包'
          },
          {
            id: 'bulma',
            name: 'Bulma',
            version: 'v0.9.x',
            icon: '💪',
            url: 'https://bulma.io/',
            displayUrl: 'bulma.io',
            description: '基于Flexbox的现代CSS框架'
          }
        ]
      },
      {
        id: 'testing-frameworks',
        name: '测试框架',
        icon: '🧪',
        websites: [
          {
            id: 'vitest',
            name: 'Vitest',
            version: 'v1.x',
            icon: '⚡',
            url: 'https://vitest.dev/',
            displayUrl: 'vitest.dev',
            description: '由Vite提供支持的极速单元测试框架'
          },
          {
            id: 'jest',
            name: 'Jest',
            version: 'v29.x',
            icon: '🃏',
            url: 'https://jestjs.io/',
            displayUrl: 'jestjs.io',
            description: '令人愉快的JavaScript测试框架'
          },
          {
            id: 'cypress',
            name: 'Cypress',
            version: 'v13.x',
            icon: '🌲',
            url: 'https://www.cypress.io/',
            displayUrl: 'cypress.io',
            description: '快速、简单、可靠的端到端测试'
          },
          {
            id: 'playwright',
            name: 'Playwright',
            version: 'v1.x',
            icon: '🎭',
            url: 'https://playwright.dev/',
            displayUrl: 'playwright.dev',
            description: '现代Web应用的可靠端到端测试'
          }
        ]
      },
      {
        id: 'build-tools',
        name: '构建工具',
        icon: '🔧',
        websites: [
          {
            id: 'vite',
            name: 'Vite',
            version: 'v5.x',
            icon: '⚡',
            url: 'https://vitejs.dev/',
            displayUrl: 'vitejs.dev',
            description: '下一代前端构建工具'
          },
          {
            id: 'webpack',
            name: 'Webpack',
            version: 'v5.x',
            icon: '📦',
            url: 'https://webpack.js.org/',
            displayUrl: 'webpack.js.org',
            description: '现代JavaScript应用程序的静态模块打包器'
          },
          {
            id: 'rollup',
            name: 'Rollup',
            version: 'v4.x',
            icon: '📜',
            url: 'https://rollupjs.org/',
            displayUrl: 'rollupjs.org',
            description: 'JavaScript模块打包器'
          },
          {
            id: 'parcel',
            name: 'Parcel',
            version: 'v2.x',
            icon: '📮',
            url: 'https://parceljs.org/',
            displayUrl: 'parceljs.org',
            description: '零配置的Web应用打包工具'
          }
        ]
      },
      {
        id: 'database-tools',
        name: '数据库工具',
        icon: '🗄️',
        websites: [
          {
            id: 'prisma',
            name: 'Prisma',
            version: 'v5.x',
            icon: '🔷',
            url: 'https://www.prisma.io/',
            displayUrl: 'prisma.io',
            description: '下一代Node.js和TypeScript ORM'
          },
          {
            id: 'drizzle',
            name: 'Drizzle ORM',
            version: 'v0.29.x',
            icon: '🌧️',
            url: 'https://orm.drizzle.team/',
            displayUrl: 'orm.drizzle.team',
            description: 'TypeScript ORM，类型安全且高性能'
          },
          {
            id: 'supabase',
            name: 'Supabase',
            version: '',
            icon: '⚡',
            url: 'https://supabase.com/',
            displayUrl: 'supabase.com',
            description: '开源的Firebase替代方案'
          },
          {
            id: 'planetscale',
            name: 'PlanetScale',
            version: '',
            icon: '🪐',
            url: 'https://planetscale.com/',
            displayUrl: 'planetscale.com',
            description: '无服务器MySQL平台'
          }
        ]
      }
    ]
  },
  {
    id: 'component-solutions',
    name: '组件库与解决方案',
    icon: '🎨',
    subcategories: [
      {
        id: 'ui-libraries',
        name: 'UI组件库',
        icon: '🧩',
        websites: [
          {
            id: 'element-plus',
            name: 'Element Plus',
            version: 'Vue 3',
            icon: '🔷',
            url: 'https://element-plus.org/',
            displayUrl: 'element-plus.org',
            description: 'Vue 3 的桌面端组件库'
          },
          {
            id: 'ant-design-vue',
            name: 'Ant Design Vue',
            version: 'v4.x',
            icon: '🐜',
            url: 'https://antdv.com/',
            displayUrl: 'antdv.com',
            description: 'Vue.js 的企业级UI设计语言'
          },
          {
            id: 'naive-ui',
            name: 'Naive UI',
            version: 'Vue 3',
            icon: '🌿',
            url: 'https://www.naiveui.com/',
            displayUrl: 'naiveui.com',
            description: 'Vue 3 的现代化组件库'
          },
          {
            id: 'material-ui',
            name: 'Material-UI',
            version: 'v5.x',
            icon: '📱',
            url: 'https://mui.com/',
            displayUrl: 'mui.com',
            description: 'React 的 Material Design 组件库'
          },
          {
            id: 'chakra-ui',
            name: 'Chakra UI',
            version: 'v2.x',
            icon: '⚡',
            url: 'https://chakra-ui.com/',
            displayUrl: 'chakra-ui.com',
            description: 'React 的简洁模块化组件库'
          },
          {
            id: 'element-ui',
            name: 'Element UI',
            version: 'Vue 2',
            icon: '🔷',
            url: 'https://element.eleme.cn/',
            displayUrl: 'element.eleme.cn',
            description: 'Vue 2 的桌面端组件库'
          },
          {
            id: 'vant',
            name: 'Vant',
            version: 'v4.x',
            icon: '📱',
            url: 'https://vant-contrib.gitee.io/vant/',
            displayUrl: 'vant-contrib.gitee.io',
            description: '轻量、可靠的移动端Vue组件库'
          },
          {
            id: 'antd-mobile',
            name: 'Ant Design Mobile',
            version: 'v5.x',
            icon: '🐜',
            url: 'https://mobile.ant.design/',
            displayUrl: 'mobile.ant.design',
            description: 'Ant Design 的移动端设计规范'
          },
          {
            id: 'nutui',
            name: 'NutUI',
            version: 'v4.x',
            icon: '🥜',
            url: 'https://nutui.jd.com/',
            displayUrl: 'nutui.jd.com',
            description: '京东风格的移动端Vue组件库'
          },
          {
            id: 'varlet',
            name: 'Varlet',
            version: 'v3.x',
            icon: '🌈',
            url: 'https://varlet.gitee.io/varlet-ui/',
            displayUrl: 'varlet.gitee.io',
            description: 'Material风格的Vue3移动端组件库'
          },
          {
            id: 'quasar',
            name: 'Quasar',
            version: 'v2.x',
            icon: '⭐',
            url: 'https://quasar.dev/',
            displayUrl: 'quasar.dev',
            description: 'Vue.js的高性能全栈框架'
          }
        ]
      },
      {
        id: 'admin-solutions',
        name: '中后台解决方案',
        icon: '🏢',
        websites: [
          {
            id: 'ant-design-pro',
            name: 'Ant Design Pro',
            version: 'v6.x',
            icon: '🐜',
            url: 'https://pro.ant.design/',
            displayUrl: 'pro.ant.design',
            description: '开箱即用的中台前端/设计解决方案'
          },
          {
            id: 'vue-element-admin',
            name: 'vue-element-admin',
            version: 'v4.x',
            icon: '🔷',
            url: 'https://panjiachen.github.io/vue-element-admin/',
            displayUrl: 'panjiachen.github.io',
            description: '基于Vue和Element的后台管理系统'
          },
          {
            id: 'arco-design-pro',
            name: 'Arco Design Pro',
            version: 'v2.x',
            icon: '🌈',
            url: 'https://pro.arco.design/',
            displayUrl: 'pro.arco.design',
            description: '字节跳动出品的企业级后台解决方案'
          },
          {
            id: 'naive-ui-admin',
            name: 'Naive UI Admin',
            version: 'v1.x',
            icon: '🌿',
            url: 'https://www.naiveadmin.com/',
            displayUrl: 'naiveadmin.com',
            description: '基于Naive UI的现代化管理系统'
          },
          {
            id: 'soybean-admin',
            name: 'Soybean Admin',
            version: 'v1.x',
            icon: '🌱',
            url: 'https://soybeanjs.cn/',
            displayUrl: 'soybeanjs.cn',
            description: '清新优雅的中后台管理模板'
          },
          {
            id: 'vben-admin',
            name: 'Vue vben admin',
            version: 'v2.x',
            icon: '⚡',
            url: 'https://vben.vvbin.cn/',
            displayUrl: 'vben.vvbin.cn',
            description: '基于Vue3、Vite、TypeScript的后台解决方案'
          }
        ]
      }
    ]
  },
  {
    id: 'deployment-hosting',
    name: '部署托管',
    icon: '🚀',
    websites: [
      {
        id: 'vercel',
        name: 'Vercel',
        version: '',
        icon: '▲',
        url: 'https://vercel.com/',
        displayUrl: 'vercel.com',
        description: '前端开发者的部署平台'
      },
      {
        id: 'netlify',
        name: 'Netlify',
        version: '',
        icon: '🌐',
        url: 'https://www.netlify.com/',
        displayUrl: 'netlify.com',
        description: '现代Web项目的构建、部署和托管'
      },
      {
        id: 'github-pages',
        name: 'GitHub Pages',
        version: '',
        icon: '🐱',
        url: 'https://pages.github.com/',
        displayUrl: 'pages.github.com',
        description: '免费的静态网站托管服务'
      },
      {
        id: 'surge',
        name: 'Surge.sh',
        version: '',
        icon: '⚡',
        url: 'https://surge.sh/',
        displayUrl: 'surge.sh',
        description: '简单快速的静态网站发布'
      },
      {
        id: 'firebase-hosting',
        name: 'Firebase Hosting',
        version: '',
        icon: '🔥',
        url: 'https://firebase.google.com/products/hosting',
        displayUrl: 'firebase.google.com',
        description: 'Google的快速安全的Web托管'
      },
      {
        id: 'cloudflare-pages',
        name: 'Cloudflare Pages',
        version: '',
        icon: '☁️',
        url: 'https://pages.cloudflare.com/',
        displayUrl: 'pages.cloudflare.com',
        description: 'JAMstack平台，快速安全的静态站点'
      },
      {
        id: 'aws-amplify',
        name: 'AWS Amplify',
        version: '',
        icon: '🟠',
        url: 'https://aws.amazon.com/amplify/',
        displayUrl: 'aws.amazon.com/amplify',
        description: 'AWS的全栈应用开发平台'
      },
      {
        id: 'railway',
        name: 'Railway',
        version: '',
        icon: '🚂',
        url: 'https://railway.app/',
        displayUrl: 'railway.app',
        description: '简化的云基础设施'
      },
      {
        id: 'render',
        name: 'Render',
        version: '',
        icon: '🎨',
        url: 'https://render.com/',
        displayUrl: 'render.com',
        description: '统一的云平台，构建和运行应用'
      },
      {
        id: 'heroku',
        name: 'Heroku',
        version: '',
        icon: '💜',
        url: 'https://www.heroku.com/',
        displayUrl: 'heroku.com',
        description: '云应用平台，支持多种编程语言'
      },
      {
        id: 'digitalocean-app',
        name: 'DigitalOcean App Platform',
        version: '',
        icon: '🌊',
        url: 'https://www.digitalocean.com/products/app-platform',
        displayUrl: 'digitalocean.com',
        description: 'DigitalOcean的PaaS平台'
      },
      {
        id: 'fly-io',
        name: 'Fly.io',
        version: '',
        icon: '🪰',
        url: 'https://fly.io/',
        displayUrl: 'fly.io',
        description: '全球分布式应用平台'
      },
      {
        id: 'zeabur',
        name: 'Zeabur',
        version: '',
        icon: '🦓',
        url: 'https://zeabur.com/',
        displayUrl: 'zeabur.com',
        description: '现代化的应用部署平台'
      },
      {
        id: 'deno-deploy',
        name: 'Deno Deploy',
        version: '',
        icon: '🦕',
        url: 'https://deno.com/deploy',
        displayUrl: 'deno.com/deploy',
        description: 'Deno的边缘计算平台'
      },
      {
        id: 'supabase',
        name: 'Supabase',
        version: '',
        icon: '⚡',
        url: 'https://supabase.com/',
        displayUrl: 'supabase.com',
        description: '开源的Firebase替代方案'
      }
    ]
  },
  {
    id: 'ai-tools',
    name: 'AI工具',
    icon: '🤖',
    subcategories: [
      {
        id: 'ai-ide',
        name: 'AI IDE',
        icon: '💻',
        websites: [
          {
            id: 'cursor',
            name: 'Cursor',
            version: '',
            icon: '⚡',
            url: 'https://cursor.sh/',
            displayUrl: 'cursor.sh',
            description: 'AI驱动的代码编辑器'
          },
          {
            id: 'windsurf',
            name: 'Windsurf',
            version: '',
            icon: '🏄',
            url: 'https://codeium.com/windsurf',
            displayUrl: 'codeium.com/windsurf',
            description: 'Codeium的AI IDE'
          },
          {
            id: 'replit',
            name: 'Replit',
            version: '',
            icon: '🔄',
            url: 'https://replit.com/',
            displayUrl: 'replit.com',
            description: 'AI驱动的在线开发环境'
          },
          {
            id: 'bolt',
            name: 'Bolt.new',
            version: '',
            icon: '⚡',
            url: 'https://bolt.new/',
            displayUrl: 'bolt.new',
            description: 'StackBlitz的AI全栈开发工具'
          },
          {
            id: 'v0',
            name: 'v0.dev',
            version: '',
            icon: '🎯',
            url: 'https://v0.dev/',
            displayUrl: 'v0.dev',
            description: 'Vercel的AI UI生成工具'
          },
          {
            id: 'huawei-deveco',
            name: 'DevEco Studio',
            version: '',
            icon: '🌸',
            url: 'https://developer.harmonyos.com/cn/develop/deveco-studio',
            displayUrl: 'developer.harmonyos.com',
            description: '华为鸿蒙开发IDE'
          },
          {
            id: 'bytedance-marscode',
            name: 'MarsCode',
            version: '',
            icon: '🚀',
            url: 'https://www.marscode.cn/',
            displayUrl: 'marscode.cn',
            description: '字节跳动的AI编程平台'
          },

        ]
      },
      {
        id: 'ai-coding-assistant',
        name: 'AI编程助手',
        icon: '🔧',
        websites: [
          {
            id: 'github-copilot',
            name: 'GitHub Copilot',
            version: '',
            icon: '🐙',
            url: 'https://github.com/features/copilot',
            displayUrl: 'github.com/copilot',
            description: 'AI代码编程助手'
          },
          {
            id: 'tongyi-lingma',
            name: '通义灵码',
            version: '',
            icon: '🦄',
            url: 'https://tongyi.aliyun.com/lingma/',
            displayUrl: 'tongyi.aliyun.com',
            description: '阿里云的AI编程助手'
          },
          {
            id: 'baidu-comate',
            name: '百度Comate',
            version: '',
            icon: '🐾',
            url: 'https://comate.baidu.com/',
            displayUrl: 'comate.baidu.com',
            description: '百度的AI编程助手'
          },

          {
            id: 'codeium',
            name: 'Codeium',
            version: '',
            icon: '🌊',
            url: 'https://codeium.com/',
            displayUrl: 'codeium.com',
            description: '免费的AI编程助手'
          },
          {
            id: 'tabnine',
            name: 'Tabnine',
            version: '',
            icon: '🎯',
            url: 'https://www.tabnine.com/',
            displayUrl: 'tabnine.com',
            description: 'AI代码补全工具'
          },
          {
            id: 'amazon-codewhisperer',
            name: 'Amazon CodeWhisperer',
            version: '',
            icon: '🚀',
            url: 'https://aws.amazon.com/codewhisperer/',
            displayUrl: 'aws.amazon.com',
            description: 'AWS的AI编程助手'
          }
        ]
      },
      {
        id: 'ai-chat',
        name: '问答助手',
        icon: '💬',
        websites: [
          {
            id: 'chatgpt',
            name: 'ChatGPT',
            version: 'GPT-4',
            icon: '💬',
            url: 'https://chat.openai.com/',
            displayUrl: 'chat.openai.com',
            description: 'OpenAI的对话式AI助手'
          },
          {
            id: 'claude',
            name: 'Claude',
            version: 'v3',
            icon: '🎭',
            url: 'https://claude.ai/',
            displayUrl: 'claude.ai',
            description: 'Anthropic的AI助手'
          },
          {
            id: 'deepseek',
            name: 'DeepSeek',
            version: 'V3',
            icon: '🔍',
            url: 'https://chat.deepseek.com/',
            displayUrl: 'chat.deepseek.com',
            description: '深度求索AI对话助手'
          },
          {
            id: 'tongyi-qianwen',
            name: '通义千问',
            version: '',
            icon: '🌟',
            url: 'https://tongyi.aliyun.com/',
            displayUrl: 'tongyi.aliyun.com',
            description: '阿里云的大语言模型'
          },
          {
            id: 'baidu-wenxin',
            name: '文心一言',
            version: '',
            icon: '💙',
            url: 'https://yiyan.baidu.com/',
            displayUrl: 'yiyan.baidu.com',
            description: '百度的AI对话助手'
          },
          {
            id: 'tencent-hunyuan',
            name: '腾讯混元',
            version: '',
            icon: '🔮',
            url: 'https://hunyuan.tencent.com/',
            displayUrl: 'hunyuan.tencent.com',
            description: '腾讯的大语言模型'
          },
          {
            id: 'bytedance-doubao',
            name: '豆包',
            version: '',
            icon: '🫘',
            url: 'https://www.doubao.com/',
            displayUrl: 'doubao.com',
            description: '字节跳动的AI助手'
          },
          {
            id: 'zhipu-chatglm',
            name: 'ChatGLM',
            version: '',
            icon: '🧠',
            url: 'https://chatglm.cn/',
            displayUrl: 'chatglm.cn',
            description: '智谱AI的对话模型'
          },
          {
            id: 'moonshot-kimi',
            name: 'Kimi',
            version: '',
            icon: '🌙',
            url: 'https://kimi.moonshot.cn/',
            displayUrl: 'kimi.moonshot.cn',
            description: '月之暗面的AI助手'
          },
          {
            id: 'xunfei-xinghuo',
            name: '讯飞星火',
            version: '',
            icon: '✨',
            url: 'https://xinghuo.xfyun.cn/',
            displayUrl: 'xinghuo.xfyun.cn',
            description: '科大讯飞的AI助手'
          },
          {
            id: 'minimax-abab',
            name: 'ABAB',
            version: '',
            icon: '🎪',
            url: 'https://api.minimax.chat/',
            displayUrl: 'api.minimax.chat',
            description: 'MiniMax的对话AI'
          },
          {
            id: 'midjourney',
            name: 'Midjourney',
            version: 'v6',
            icon: '🎨',
            url: 'https://www.midjourney.com/',
            displayUrl: 'midjourney.com',
            description: 'AI图像生成工具'
          },
          {
            id: 'claude-artifacts',
            name: 'Claude Artifacts',
            version: '',
            icon: '🎭',
            url: 'https://claude.ai/',
            displayUrl: 'claude.ai',
            description: 'Claude的交互式代码生成'
          }
        ]
      }
    ]
  },
  {
    id: 'development-tools',
    name: '开发工具',
    icon: '🛠️',
    subcategories: [
      {
        id: 'repositories',
        name: '仓库',
        icon: '📚',
        websites: [
          {
            id: 'github',
            name: 'GitHub',
            version: '',
            icon: '🐱',
            url: 'https://github.com/',
            displayUrl: 'github.com',
            description: '全球最大的代码托管平台'
          },
          {
            id: 'gitlab',
            name: 'GitLab',
            version: '',
            icon: '🦊',
            url: 'https://gitlab.com/',
            displayUrl: 'gitlab.com',
            description: 'DevOps生命周期工具'
          },
          {
            id: 'bitbucket',
            name: 'Bitbucket',
            version: '',
            icon: '🪣',
            url: 'https://bitbucket.org/',
            displayUrl: 'bitbucket.org',
            description: 'Atlassian的Git代码管理'
          },
          {
            id: 'gitee',
            name: 'Gitee',
            version: '',
            icon: '🌸',
            url: 'https://gitee.com/',
            displayUrl: 'gitee.com',
            description: '开源中国的代码托管平台'
          },
          {
            id: 'coding',
            name: 'CODING',
            version: '',
            icon: '💻',
            url: 'https://coding.net/',
            displayUrl: 'coding.net',
            description: '腾讯云开发者平台'
          }
        ]
      },
      {
        id: 'package-managers',
        name: '包管理器',
        icon: '📦',
        websites: [
          {
            id: 'npm',
            name: 'NPM',
            version: '',
            icon: '📦',
            url: 'https://www.npmjs.com/',
            displayUrl: 'npmjs.com',
            description: 'Node.js包管理器'
          },
          {
            id: 'yarn',
            name: 'Yarn',
            version: 'v4.x',
            icon: '🧶',
            url: 'https://yarnpkg.com/',
            displayUrl: 'yarnpkg.com',
            description: '快速、可靠、安全的依赖管理'
          },
          {
            id: 'pnpm',
            name: 'pnpm',
            version: '',
            icon: '⚡',
            url: 'https://pnpm.io/',
            displayUrl: 'pnpm.io',
            description: '快速、节省磁盘空间的包管理器'
          },
          {
            id: 'pip',
            name: 'PyPI',
            version: '',
            icon: '🐍',
            url: 'https://pypi.org/',
            displayUrl: 'pypi.org',
            description: 'Python包索引'
          },
          {
            id: 'maven',
            name: 'Maven Central',
            version: '',
            icon: '☕',
            url: 'https://search.maven.org/',
            displayUrl: 'search.maven.org',
            description: 'Java包管理仓库'
          },
          {
            id: 'nuget',
            name: 'NuGet',
            version: '',
            icon: '📋',
            url: 'https://www.nuget.org/',
            displayUrl: 'nuget.org',
            description: '.NET包管理器'
          }
        ]
      },
      {
        id: 'useful-libraries',
        name: '好用的库',
        icon: '🔧',
        websites: [
          {
            id: 'lodash',
            name: 'Lodash',
            version: '',
            icon: '🔨',
            url: 'https://lodash.com/',
            displayUrl: 'lodash.com',
            description: 'JavaScript实用工具库'
          },
          {
            id: 'axios',
            name: 'Axios',
            version: '',
            icon: '🌐',
            url: 'https://axios-http.com/',
            displayUrl: 'axios-http.com',
            description: 'Promise based HTTP client'
          },
          {
            id: 'dayjs',
            name: 'Day.js',
            version: '',
            icon: '📅',
            url: 'https://day.js.org/',
            displayUrl: 'day.js.org',
            description: '轻量级日期库'
          },
          {
            id: 'uuid',
            name: 'UUID',
            version: '',
            icon: '🆔',
            url: 'https://www.npmjs.com/package/uuid',
            displayUrl: 'npmjs.com',
            description: '生成唯一标识符'
          },
          {
            id: 'validator',
            name: 'Validator.js',
            version: '',
            icon: '✅',
            url: 'https://github.com/validatorjs/validator.js',
            displayUrl: 'github.com',
            description: '字符串验证和清理库'
          },
          {
            id: 'crypto-js',
            name: 'CryptoJS',
            version: '',
            icon: '🔐',
            url: 'https://cryptojs.gitbook.io/docs/',
            displayUrl: 'cryptojs.gitbook.io',
            description: 'JavaScript加密库'
          },
          {
            id: 'jszip',
            name: 'JSZip',
            version: '',
            icon: '📦',
            url: 'https://stuk.github.io/jszip/',
            displayUrl: 'stuk.github.io',
            description: 'JavaScript创建和读取zip文件'
          },
          {
            id: 'file-saver',
            name: 'FileSaver.js',
            version: '',
            icon: '💾',
            url: 'https://github.com/eligrey/FileSaver.js',
            displayUrl: 'github.com',
            description: '客户端保存文件'
          },
          {
            id: 'qrcode',
            name: 'QRCode.js',
            version: '',
            icon: '📱',
            url: 'https://github.com/davidshimjs/qrcodejs',
            displayUrl: 'github.com',
            description: '生成二维码'
          },
          {
            id: 'clipboard',
            name: 'Clipboard.js',
            version: '',
            icon: '📋',
            url: 'https://clipboardjs.com/',
            displayUrl: 'clipboardjs.com',
            description: '现代复制到剪贴板'
          },
          {
            id: 'fuse',
            name: 'Fuse.js',
            version: '',
            icon: '🔍',
            url: 'https://fusejs.io/',
            displayUrl: 'fusejs.io',
            description: '轻量级模糊搜索'
          },
          {
            id: 'sortable',
            name: 'SortableJS',
            version: '',
            icon: '🔄',
            url: 'https://sortablejs.github.io/Sortable/',
            displayUrl: 'sortablejs.github.io',
            description: '可拖拽排序库'
          },
          {
            id: 'hammer',
            name: 'Hammer.js',
            version: '',
            icon: '👆',
            url: 'https://hammerjs.github.io/',
            displayUrl: 'hammerjs.github.io',
            description: '多点触控手势识别'
          },
          {
            id: 'color',
            name: 'Color.js',
            version: '',
            icon: '🎨',
            url: 'https://github.com/Qix-/color',
            displayUrl: 'github.com',
            description: '颜色转换和操作'
          },
          {
            id: 'numeral',
            name: 'Numeral.js',
            version: '',
            icon: '🔢',
            url: 'http://numeraljs.com/',
            displayUrl: 'numeraljs.com',
            description: '数字格式化库'
          },
          {
            id: 'big',
            name: 'Big.js',
            version: '',
            icon: '🧮',
            url: 'https://mikemcl.github.io/big.js/',
            displayUrl: 'mikemcl.github.io',
            description: '任意精度十进制运算'
          },
          {
            id: 'js-cookie',
            name: 'js-cookie',
            version: '',
            icon: '🍪',
            url: 'https://github.com/js-cookie/js-cookie',
            displayUrl: 'github.com',
            description: '简单的Cookie API'
          },
          {
            id: 'store',
            name: 'store.js',
            version: '',
            icon: '💾',
            url: 'https://github.com/marcuswestin/store.js',
            displayUrl: 'github.com',
            description: '跨浏览器本地存储'
          },
          {
            id: 'marked',
            name: 'Marked',
            version: '',
            icon: '📝',
            url: 'https://marked.js.org/',
            displayUrl: 'marked.js.org',
            description: 'Markdown解析器'
          },
          {
            id: 'dompurify',
            name: 'DOMPurify',
            version: '',
            icon: '🧹',
            url: 'https://github.com/cure53/DOMPurify',
            displayUrl: 'github.com',
            description: 'DOM XSS清理器'
          }
        ]
      }
    ]
  },
  {
    id: 'harmonyos',
    name: 'HarmonyOS',
    icon: '🌸',
    websites: [
      {
        id: 'harmonyos-developer',
        name: 'HarmonyOS开发者官网',
        version: '',
        icon: '🌸',
        url: 'https://developer.harmonyos.com/',
        displayUrl: 'developer.harmonyos.com',
        description: 'HarmonyOS官方开发者平台'
      },
      {
        id: 'deveco-studio',
        name: 'DevEco Studio',
        version: '',
        icon: '🛠️',
        url: 'https://developer.harmonyos.com/cn/develop/deveco-studio/',
        displayUrl: 'developer.harmonyos.com',
        description: 'HarmonyOS应用开发IDE'
      },
      {
        id: 'arkts',
        name: 'ArkTS',
        version: '',
        icon: '📝',
        url: 'https://developer.harmonyos.com/cn/docs/documentation/doc-guides-V3/arkts-get-started-0000001504769321-V3',
        displayUrl: 'developer.harmonyos.com',
        description: 'HarmonyOS应用开发语言'
      },
      {
        id: 'arkui',
        name: 'ArkUI',
        version: '',
        icon: '🎨',
        url: 'https://developer.harmonyos.com/cn/docs/documentation/doc-guides-V3/arkui-overview-0000001184610745-V3',
        displayUrl: 'developer.harmonyos.com',
        description: 'HarmonyOS声明式UI框架'
      },
      {
        id: 'harmony-docs',
        name: 'HarmonyOS文档',
        version: '',
        icon: '📚',
        url: 'https://developer.harmonyos.com/cn/docs/',
        displayUrl: 'developer.harmonyos.com',
        description: 'HarmonyOS开发文档'
      },
      {
        id: 'harmony-samples',
        name: 'HarmonyOS示例代码',
        version: '',
        icon: '💻',
        url: 'https://gitee.com/harmonyos/codelabs',
        displayUrl: 'gitee.com',
        description: 'HarmonyOS官方示例代码库'
      },
      {
        id: 'harmony-community',
        name: 'HarmonyOS开发者社区',
        version: '',
        icon: '👥',
        url: 'https://developer.harmonyos.com/cn/community/',
        displayUrl: 'developer.harmonyos.com',
        description: 'HarmonyOS开发者交流社区'
      },
      {
        id: 'harmony-appgallery',
        name: 'AppGallery Connect',
        version: '',
        icon: '🏪',
        url: 'https://developer.huawei.com/consumer/cn/service/josp/agc/index.html',
        displayUrl: 'developer.huawei.com',
        description: 'HarmonyOS应用分发平台'
      },
      {
        id: 'harmony-hms',
        name: 'HMS Core',
        version: '',
        icon: '🔧',
        url: 'https://developer.huawei.com/consumer/cn/hms/',
        displayUrl: 'developer.huawei.com',
        description: '华为移动服务核心能力'
      },
      {
        id: 'harmony-device-partner',
        name: 'HarmonyOS设备开发',
        version: '',
        icon: '📱',
        url: 'https://device.harmonyos.com/',
        displayUrl: 'device.harmonyos.com',
        description: 'HarmonyOS设备开发平台'
      }
    ]
  }
])

// 更新时间
const updateTime = () => {
  const now = new Date()
  
  // 格式化时间 (HH:MM:SS)
  currentTime.value = now.toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  
  // 格式化日期
  currentDate.value = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
  

}

// 随机选择励志语录 - 使用inspirational-quotes库
const updateMotivationalQuote = () => {
  try {
    // 使用inspirational-quotes库获取名人名言
    const quote = Quote.getQuote()
    if (quote && quote.text && quote.author) {
      motivationalQuote.value = `${quote.text} —— ${quote.author}`
    } else {
      // 如果库返回的数据格式不正确，使用备用语录
      const fallback = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)]
      motivationalQuote.value = `${fallback.text} —— ${fallback.author}`
    }
  } catch (error) {
    console.warn('获取名人名言失败，使用备用语录:', error)
    // 如果库调用失败，使用备用语录
    const fallback = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)]
    motivationalQuote.value = `${fallback.text} —— ${fallback.author}`
  }
}

// 计算属性：当前分类对象
const currentCategory = computed(() => {
  return websiteCategories.value.find(cat => cat.id === activeCategory.value)
})

// 计算属性：当前分类的网站
const currentCategoryWebsites = computed(() => {
  const category = currentCategory.value
  if (!category) return []
  
  // 如果有subcategories，返回所有子分类的网站
  if (category.subcategories) {
    return category.subcategories.flatMap(sub => sub.websites || [])
  }
  
  // 否则返回直接的websites
  return category.websites || []
})

// 打开网站
const openWebsite = (url) => {
  window.open(url, '_blank')
}

// 路由实例
const router = useRouter()

// 打开工具
const openTool = (tool) => {
  console.log('打开工具:', tool.name)
  // 根据工具ID跳转到对应路由
  const routeMap = {
    'calculator': '/calculator',
    'base64': '/image-to-base64',
    'qrcode': '/qr-generator',
    'color': '/color-picker',
    'json': '/json-formatter',
    'regex': '/regex-tester',
    'unit': '/unit-converter',
    'memory': '/memory-game'
  }
  
  const route = routeMap[tool.id]
  if (route) {
    router.push(route)
  } else {
    console.warn('未找到对应的路由:', tool.id)
  }
}

// 组件挂载时
onMounted(() => {
  updateTime()
  updateMotivationalQuote()
  
  // 每秒更新时间
  timeInterval = setInterval(updateTime, 1000)
  
  // 每5分钟更新励志语录
  setInterval(updateMotivationalQuote, 5 * 60 * 1000)
})

// 组件卸载时清理定时器
onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped>
.workspace {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  display: flex;
  gap: 2rem;
  overflow: hidden;
}

/* 左侧区域 */
.left-section {
  flex: 7;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 右侧区域 */
.right-section {
  flex: 3;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* 问候语区域 */
.greeting-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.time-display {
  text-align: center;
  margin-bottom: 1rem;
}

.current-time {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  margin-bottom: 0.3rem;
  font-family: 'Courier New', monospace;
}

.current-date {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 300;
}

.greeting-content {
  text-align: center;
}

.quote-text {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  font-style: italic;
  line-height: 1.4;
  margin: 0;
}

/* 系统工具区域 */
.tools-section {
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.section-title {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  text-align: center;
  font-weight: 500;
  color: white;
}

.tools-grid {
   display: flex;
   flex-wrap: wrap;
   gap: 1rem;
   flex: 1;
   overflow-y: auto;
   padding-right: 0.5rem;
   align-content: flex-start;
 }

/* 美化工具网格滚动条 */
.tools-grid::-webkit-scrollbar {
  width: 6px;
}

.tools-grid::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.tools-grid::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  transition: background 0.3s ease;
}

.tools-grid::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

.tool-card {
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   padding: 0.6rem;
   background: rgba(255, 255, 255, 0.1);
   border: 1px solid rgba(255, 255, 255, 0.1);
   border-radius: 12px;
   cursor: pointer;
   transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
   text-align: center;
   width: calc((100% - 5rem) / 5);
   aspect-ratio: 1;
   min-height: 0;
   backdrop-filter: blur(10px);
   flex-shrink: 0;
 }

.tool-card:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.tool-card:active {
  transform: translateY(0) scale(0.98);
  transition: all 0.1s ease;
}

.tool-icon {
   font-size: 1.6rem;
   margin-bottom: 0.4rem;
   transition: transform 0.3s ease;
 }

 .tool-card:hover .tool-icon {
   transform: scale(1.1);
 }

.tool-name {
   font-size: 0.75rem;
   font-weight: 500;
   line-height: 1.2;
   color: rgba(255, 255, 255, 0.95);
   text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
 }

/* 网站分类区域 */
.website-categories {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 分类标签页 */
.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-shrink: 0;
}

.tab-button {
  display: flex;
  align-items: center;
  padding: 0.8rem 1.2rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  font-weight: 500;
  line-height: 1;
}

.tab-button:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.tab-button.active {
  background: rgba(255, 255, 255, 0.25);
  color: white;
  border-color: rgba(255, 255, 255, 0.4);
}

.tab-button .category-icon {
  margin-right: 0.5rem;
  margin-bottom: 0;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.website-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  flex: 1;
  overflow-y: auto;
  padding-right: 0.5rem;
}

/* 美化滚动条 */
.website-grid::-webkit-scrollbar {
  width: 8px;
}

.website-grid::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.website-grid::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  transition: background 0.3s ease;
}

.website-grid::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

.website-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.website-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  background: rgba(255, 255, 255, 1);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.website-icon {
  font-size: 2rem;
  margin-right: 1rem;
}

.website-info {
  flex: 1;
}

.website-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  margin-bottom: 0.2rem;
}

.website-version {
  font-size: 0.8rem;
  color: #7f8c8d;
  background: #ecf0f1;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-weight: 500;
}

.website-description {
  color: #5a6c7d;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.website-url {
  font-size: 0.8rem;
  color: #95a5a6;
  font-family: 'Courier New', monospace;
}

.external-link-icon {
  font-size: 1rem;
  opacity: 0.6;
}

/* 子分类样式 */
.subcategories-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  flex: 1;
  overflow-y: auto;
  padding-right: 0.5rem;
}

/* 美化子分类容器滚动条 */
.subcategories-container::-webkit-scrollbar {
  width: 8px;
}

.subcategories-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.subcategories-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  transition: background 0.3s ease;
}

.subcategories-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

.subcategory-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.subcategory-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
}

.subcategory-icon {
  font-size: 1.5rem;
  margin-right: 0.8rem;
}

.subcategory-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: white;
  margin: 0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .tools-grid {
    gap: 0.9rem;
  }
  
  .tool-card {
    width: calc((100% - 4.5rem) / 5);
    padding: 0.5rem;
  }
  
  .tool-icon {
    font-size: 1.5rem;
  }
  
  .tool-name {
    font-size: 0.72rem;
  }
}

@media (max-width: 768px) {
  .workspace {
    flex-direction: column;
    padding: 1rem;
    gap: 1rem;
  }
  
  .left-section,
  .right-section {
    flex: none;
  }
  
  .greeting-section {
    padding: 1rem;
  }
  
  .current-time {
    font-size: 1.5rem;
  }
  
  .website-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .category-tabs {
    justify-content: center;
  }
  
  .tab-button {
    padding: 0.6rem 1rem;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
  }
  
  .tools-grid {
    gap: 0.8rem;
    max-height: none;
    overflow-y: visible;
  }
  
  .tool-card {
    width: calc((100% - 2.4rem) / 4);
    padding: 0.5rem;
  }
  
  .tool-icon {
    font-size: 1.4rem;
    margin-bottom: 0.3rem;
  }
  
  .tool-name {
    font-size: 0.7rem;
  }
  
  .subcategories-container {
    gap: 1.5rem;
  }
  
  .subcategory-section {
    padding: 1rem;
  }
  
  .subcategory-title {
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .current-time {
    font-size: 1.2rem;
  }
  
  .website-card {
    padding: 1rem;
  }
  
  .tools-grid {
    gap: 0.6rem;
    max-height: none;
    overflow-y: visible;
  }
  
  .tool-card {
    width: calc((100% - 1.2rem) / 3);
    padding: 0.4rem;
  }
  
  .tool-icon {
    font-size: 1.2rem;
    margin-bottom: 0.2rem;
  }
  
  .tool-name {
    font-size: 0.65rem;
    line-height: 1.1;
  }
}
</style>