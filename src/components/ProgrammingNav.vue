<template>
  <div class="programming-nav">
    <!-- 页面标题 -->
    <div class="nav-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="nav-title">
            <span class="nav-icon">🧭</span>
            编程导航
          </h1>
          <p class="nav-description">精选开发者必备网站，助力编程之路</p>
        </div>
        <button class="home-button" @click="goHome" title="返回主页">
          <span class="home-icon">🏠</span>
          <span class="home-text">返回主页</span>
        </button>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="nav-content">
      <!-- 左侧分类导航 -->
      <div class="sidebar">
        <div class="category-list">
          <div 
            v-for="category in websiteCategories" 
            :key="category.id"
            class="category-item"
            :class="{ active: activeCategory === category.id }"
            @click="setActiveCategory(category.id)"
          >
            <span class="category-icon">{{ category.icon }}</span>
            <span class="category-name">{{ category.name }}</span>
          </div>
        </div>
      </div>

      <!-- 右侧内容展示区域 -->
      <div class="content-area">
        <div class="content-header">
          <span class="content-icon">{{ currentCategory.icon }}</span>
          <h2 class="content-title">{{ currentCategory.name }}</h2>
        </div>

        <div class="subcategories-content">
          <!-- 有子分类的情况 -->
          <div v-if="currentCategory.subcategories" class="subcategory-section" v-for="subcategory in currentCategory.subcategories" :key="subcategory.id">
            <div class="subcategory-header">
              <span class="subcategory-icon">{{ subcategory.icon }}</span>
              <h3 class="subcategory-title">{{ subcategory.name }}</h3>
            </div>
            <div class="websites-grid">
              <div 
                v-for="website in subcategory.websites" 
                :key="website.id"
                class="website-card"
                @click="openWebsite(website.url)"
              >
                <div class="website-icon">{{ website.icon }}</div>
                <div class="website-info">
                  <div class="website-name">{{ website.name }}</div>
                  <div class="website-version" v-if="website.version">{{ website.version }}</div>
                  <div class="website-url">{{ website.displayUrl }}</div>
                  <div class="website-description">{{ website.description }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 没有子分类的情况，直接显示网站 -->
          <div v-else class="websites-grid">
            <div 
              v-for="website in currentCategory.websites" 
              :key="website.id"
              class="website-card"
              @click="openWebsite(website.url)"
            >
              <div class="website-icon">{{ website.icon }}</div>
              <div class="website-info">
                <div class="website-name">{{ website.name }}</div>
                <div class="website-version" v-if="website.version">{{ website.version }}</div>
                <div class="website-url">{{ website.displayUrl }}</div>
                <div class="website-description">{{ website.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 当前激活的分类
const activeCategory = ref('frontend-frameworks')

// 网站分类数据
const websiteCategories = ref([
  {
    id: 'frontend-frameworks',
    name: '前端框架',
    icon: '⚛️',
    subcategories: [
      {
        id: 'vue-ecosystem',
        name: 'Vue.js 生态',
        icon: '💚',
        websites: [
          {
            id: 'vue2',
            name: 'Vue.js 2',
            version: 'v2.7.x',
            icon: '💚',
            url: 'https://v2.vuejs.org/',
            displayUrl: 'v2.vuejs.org',
            description: 'Vue.js 2.x 官方文档'
          },
          {
            id: 'vue3',
            name: 'Vue.js 3',
            version: 'v3.x',
            icon: '💚',
            url: 'https://vuejs.org/',
            displayUrl: 'vuejs.org',
            description: '渐进式JavaScript框架'
          }
        ]
      },
      {
        id: 'react-ecosystem',
        name: 'React 生态',
        icon: '⚛️',
        websites: [
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
            icon: '🔥',
            url: 'https://svelte.dev/',
            displayUrl: 'svelte.dev',
            description: '编译时优化的前端框架'
          },
          {
            id: 'nextjs',
            name: 'Next.js',
            version: 'v14.x',
            icon: '⚫',
            url: 'https://nextjs.org/',
            displayUrl: 'nextjs.org',
            description: 'React全栈框架'
          },
          {
            id: 'nuxtjs',
            name: 'Nuxt.js',
            version: 'v3.x',
            icon: '💚',
            url: 'https://nuxt.com/',
            displayUrl: 'nuxt.com',
            description: 'Vue.js全栈框架'
          },
          {
            id: 'sveltekit',
            name: 'SvelteKit',
            version: 'v2.x',
            icon: '🧡',
            url: 'https://kit.svelte.dev/',
            displayUrl: 'kit.svelte.dev',
            description: 'Svelte全栈框架'
          }
        ]
      }
    ]
  },
  {
    id: 'state-management',
    name: '状态管理',
    icon: '🗃️',
    websites: [
      {
        id: 'vuex',
        name: 'Vuex',
        version: 'v4.x',
        icon: '🗃️',
        url: 'https://vuex.vuejs.org/',
        displayUrl: 'vuex.vuejs.org',
        description: 'Vue.js 的状态管理模式'
      },
      {
        id: 'redux',
        name: 'Redux',
        version: 'v4.x',
        icon: '🔄',
        url: 'https://redux.js.org/',
        displayUrl: 'redux.js.org',
        description: 'JavaScript 状态容器'
      },
      {
        id: 'zustand',
        name: 'Zustand',
        version: 'v4.x',
        icon: '🐻',
        url: 'https://zustand-demo.pmnd.rs/',
        displayUrl: 'zustand-demo.pmnd.rs',
        description: '小型、快速、可扩展的状态管理'
      }
    ]
  },
  {
    id: 'backend-development',
    name: '后端开发',
    icon: '🔧',
    websites: [
      {
        id: 'nodejs',
        name: 'Node.js',
        url: 'https://nodejs.org/',
        displayUrl: 'nodejs.org',
        description: 'JavaScript运行时环境',
        icon: '🟢'
      },
      {
        id: 'express',
        name: 'Express.js',
        url: 'https://expressjs.com/',
        displayUrl: 'expressjs.com',
        description: 'Node.js Web应用框架',
        icon: '🚀'
      },
      {
        id: 'nestjs',
        name: 'Nest.js',
        url: 'https://nestjs.com/',
        displayUrl: 'nestjs.com',
        description: '构建高效、可扩展的Node.js服务器端应用',
        icon: '🐱'
      },
      {
        id: 'fastify',
        name: 'Fastify',
        url: 'https://www.fastify.io/',
        displayUrl: 'fastify.io',
        description: '快速且低开销的Node.js Web框架',
        icon: '⚡'
      },
      {
        id: 'koa',
        name: 'Koa.js',
        url: 'https://koajs.com/',
        displayUrl: 'koajs.com',
        description: 'Express团队打造的下一代Node.js框架',
        icon: '🌿'
      },
      {
        id: 'deno',
        name: 'Deno',
        url: 'https://deno.land/',
        displayUrl: 'deno.land',
        description: '现代化的JavaScript和TypeScript运行时',
        icon: '🦕'
      },
      {
        id: 'bun',
        name: 'Bun',
        url: 'https://bun.sh/',
        displayUrl: 'bun.sh',
        description: '快速的JavaScript运行时和包管理器',
        icon: '🥟'
      }
    ]
  },
  {
    id: 'databases',
    name: '数据库',
    icon: '🗄️',
    websites: [
      {
        id: 'postgresql',
        name: 'PostgreSQL',
        version: 'v16.x',
        icon: '🐘',
        url: 'https://www.postgresql.org/',
        displayUrl: 'postgresql.org',
        description: '世界上最先进的开源关系数据库'
      },
      {
        id: 'mongodb',
        name: 'MongoDB',
        version: 'v7.x',
        icon: '🍃',
        url: 'https://www.mongodb.com/',
        displayUrl: 'mongodb.com',
        description: '现代应用的数据库'
      },
      {
        id: 'mysql',
        name: 'MySQL',
        url: 'https://www.mysql.com/',
        displayUrl: 'mysql.com',
        description: '世界上最流行的开源数据库',
        icon: '🐬'
      },
      {
        id: 'redis',
        name: 'Redis',
        url: 'https://redis.io/',
        displayUrl: 'redis.io',
        description: '内存数据结构存储',
        icon: '🔴'
      },
      {
        id: 'supabase',
        name: 'Supabase',
        url: 'https://supabase.com/',
        displayUrl: 'supabase.com',
        description: '开源的Firebase替代方案',
        icon: '⚡'
      },
      {
        id: 'planetscale',
        name: 'PlanetScale',
        url: 'https://planetscale.com/',
        displayUrl: 'planetscale.com',
        description: '无服务器MySQL平台',
        icon: '🪐'
      },
      {
        id: 'prisma',
        name: 'Prisma',
        url: 'https://www.prisma.io/',
        displayUrl: 'prisma.io',
        description: '下一代Node.js和TypeScript ORM',
        icon: '🔷'
      }
    ]
  },
  {
    id: 'development-tools',
    name: '开发工具',
    icon: '🛠️',
    websites: [
      {
        id: 'vscode',
        name: 'VS Code',
        version: 'v1.x',
        icon: '💙',
        url: 'https://code.visualstudio.com/',
        displayUrl: 'code.visualstudio.com',
        description: '免费的源代码编辑器'
      },
      {
        id: 'git',
        name: 'Git',
        version: 'v2.x',
        icon: '📚',
        url: 'https://git-scm.com/',
        displayUrl: 'git-scm.com',
        description: '分布式版本控制系统'
      },
      {
        id: 'github',
        name: 'GitHub',
        icon: '🐙',
        url: 'https://github.com/',
        displayUrl: 'github.com',
        description: '全球最大的代码托管平台'
      },
      {
        id: 'gitlab',
        name: 'GitLab',
        icon: '🦊',
        url: 'https://gitlab.com/',
        displayUrl: 'gitlab.com',
        description: 'DevOps平台和代码托管'
      },
      {
        id: 'docker',
        name: 'Docker',
        icon: '🐳',
        url: 'https://www.docker.com/',
        displayUrl: 'docker.com',
        description: '容器化应用开发平台'
      },
      {
        id: 'postman',
        name: 'Postman',
        icon: '📮',
        url: 'https://www.postman.com/',
        displayUrl: 'postman.com',
        description: 'API开发和测试工具'
      },
      {
        id: 'figma',
        name: 'Figma',
        icon: '🎨',
        url: 'https://www.figma.com/',
        displayUrl: 'figma.com',
        description: '协作式界面设计工具'
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
    id: 'deployment-hosting',
    name: '部署托管',
    icon: '🚀',
    websites: [
      {
        id: 'vercel',
        name: 'Vercel',
        icon: '▲',
        url: 'https://vercel.com/',
        displayUrl: 'vercel.com',
        description: '前端开发者的部署平台'
      },
      {
        id: 'netlify',
        name: 'Netlify',
        icon: '🌐',
        url: 'https://www.netlify.com/',
        displayUrl: 'netlify.com',
        description: '现代Web项目的构建、部署和托管'
      },
      {
        id: 'github-pages',
        name: 'GitHub Pages',
        icon: '🐱',
        url: 'https://pages.github.com/',
        displayUrl: 'pages.github.com',
        description: '免费的静态网站托管服务'
      },
      {
        id: 'firebase-hosting',
        name: 'Firebase Hosting',
        icon: '🔥',
        url: 'https://firebase.google.com/products/hosting',
        displayUrl: 'firebase.google.com',
        description: 'Google的快速安全的Web托管'
      },
      {
        id: 'cloudflare-pages',
        name: 'Cloudflare Pages',
        icon: '☁️',
        url: 'https://pages.cloudflare.com/',
        displayUrl: 'pages.cloudflare.com',
        description: 'JAMstack平台，快速安全的静态站点'
      },
      {
        id: 'railway',
        name: 'Railway',
        icon: '🚂',
        url: 'https://railway.app/',
        displayUrl: 'railway.app',
        description: '简化的云基础设施'
      }
    ]
  },
  {
    id: 'harmonyos',
    name: 'HarmonyOS',
    icon: '🌸',
    websites: [
      {
        id: 'harmonyos-dev',
        name: 'HarmonyOS开发者官网',
        icon: '🌸',
        url: 'https://developer.harmonyos.com/',
        displayUrl: 'developer.harmonyos.com',
        description: 'HarmonyOS官方开发者平台'
      },
      {
        id: 'deveco-studio',
        name: 'DevEco Studio',
        icon: '🛠️',
        url: 'https://developer.harmonyos.com/cn/develop/deveco-studio/',
        displayUrl: 'developer.harmonyos.com',
        description: 'HarmonyOS应用开发IDE'
      },
      {
        id: 'arkts',
        name: 'ArkTS',
        icon: '📝',
        url: 'https://developer.harmonyos.com/cn/docs/documentation/doc-guides-V3/arkts-get-started-0000001504769321-V3',
        displayUrl: 'developer.harmonyos.com',
        description: 'HarmonyOS应用开发语言'
      },
      {
        id: 'arkui',
        name: 'ArkUI',
        icon: '🎨',
        url: 'https://developer.harmonyos.com/cn/docs/documentation/doc-guides-V3/arkui-overview-0000001184610745-V3',
        displayUrl: 'developer.harmonyos.com',
        description: 'HarmonyOS声明式UI框架'
      },
      {
        id: 'harmonyos-docs',
        name: 'HarmonyOS文档',
        icon: '📚',
        url: 'https://developer.harmonyos.com/cn/docs/',
        displayUrl: 'developer.harmonyos.com',
        description: 'HarmonyOS开发文档'
      },
      {
        id: 'harmonyos-codelabs',
        name: 'HarmonyOS示例代码',
        icon: '💻',
        url: 'https://gitee.com/harmonyos/codelabs',
        displayUrl: 'gitee.com',
        description: 'HarmonyOS官方示例代码库'
      }
    ]
  },
  {
    id: 'ai-tools',
    name: 'AI工具',
    icon: '🤖',
    websites: [
      {
        id: 'chatgpt',
        name: 'ChatGPT',
        icon: '🤖',
        url: 'https://chat.openai.com/',
        displayUrl: 'chat.openai.com',
        description: 'OpenAI的对话式AI助手'
      },
      {
        id: 'github-copilot',
        name: 'GitHub Copilot',
        icon: '🚁',
        url: 'https://github.com/features/copilot',
        displayUrl: 'github.com/features/copilot',
        description: 'AI代码助手，提升编程效率'
      },
      {
        id: 'claude',
        name: 'Claude',
        icon: '🎭',
        url: 'https://claude.ai/',
        displayUrl: 'claude.ai',
        description: 'Anthropic的AI助手'
      },
      {
        id: 'cursor',
        name: 'Cursor',
        icon: '🎯',
        url: 'https://cursor.sh/',
        displayUrl: 'cursor.sh',
        description: 'AI驱动的代码编辑器'
      },
      {
        id: 'tabnine',
        name: 'Tabnine',
        icon: '⚡',
        url: 'https://www.tabnine.com/',
        displayUrl: 'tabnine.com',
        description: 'AI代码补全工具'
      }
    ]
  }
])

// 当前选中的分类
const currentCategory = computed(() => {
  return websiteCategories.value.find(category => category.id === activeCategory.value)
})

// 设置激活的分类
const setActiveCategory = (categoryId) => {
  activeCategory.value = categoryId
}

// 打开网站
const openWebsite = (url) => {
  window.open(url, '_blank')
}

// 返回主页
const goHome = () => {
  window.location.href = '/'
}
</script>

<style scoped>
.programming-nav {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e0 100%);
  padding: 1rem 2rem 2rem 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  display: flex;
  flex-direction: column;
}

.nav-header {
  margin-bottom: 1.5rem;
  color: #2d3748;
  flex-shrink: 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.title-section {
  text-align: left;
}

.home-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  flex-shrink: 0;
}

.home-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  background: linear-gradient(135deg, #5a67d8, #6b46c1);
}

.home-icon {
  font-size: 1.1rem;
}

.home-text {
  font-size: 0.9rem;
}

.nav-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-icon {
  font-size: 3rem;
}

.nav-description {
  font-size: 1.1rem;
  opacity: 0.8;
  margin: 0;
  color: #4a5568;
}

.nav-content {
  display: flex;
  flex: 1;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  height: calc(100vh - 160px);
}

/* 左侧分类导航 */
.sidebar {
  width: 280px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow-y: auto;
  max-height: 100%;
}

/* 美化滚动条 */
.sidebar::-webkit-scrollbar,
.content-area::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track,
.content-area::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb,
.content-area::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 3px;
  transition: all 0.3s ease;
}

.sidebar::-webkit-scrollbar-thumb:hover,
.content-area::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #5a67d8, #6b46c1);
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.2rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: transparent;
  border: 2px solid transparent;
}

.category-item:hover {
  background: rgba(102, 126, 234, 0.1);
  border-color: rgba(102, 126, 234, 0.2);
}

.category-item.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.category-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.category-name {
  font-size: 1rem;
  font-weight: 500;
}

/* 右侧内容区域 */
.content-area {
  flex: 1;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow-y: auto;
  max-height: 100%;
}

.content-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.content-icon {
  font-size: 2rem;
}

.content-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.subcategories-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.subcategory-section {
  background: rgba(248, 250, 252, 0.8);
  border-radius: 15px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.subcategory-header {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1.5rem;
}

.subcategory-icon {
  font-size: 1.5rem;
}

.subcategory-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: #444;
  margin: 0;
}

.websites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.website-card {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(226, 232, 240, 0.8);
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  position: relative;
  overflow: hidden;
}

.website-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.website-card:hover::before {
  transform: scaleX(1);
}

.website-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(102, 126, 234, 0.15);
  border-color: rgba(102, 126, 234, 0.3);
}

.website-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  border-radius: 15px;
  border: 2px solid rgba(102, 126, 234, 0.1);
  transition: all 0.3s ease;
}

.website-card:hover .website-icon {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  transform: scale(1.05);
}

.website-info {
  flex: 1;
  min-width: 0;
}

.website-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 0.3rem;
}

.website-version {
  font-size: 0.9rem;
  color: #667eea;
  font-weight: 500;
  margin-bottom: 0.3rem;
}

.website-url {
  font-size: 0.9rem;
  color: #718096;
  margin-bottom: 0.5rem;
  font-family: 'Courier New', monospace;
}

.website-description {
  font-size: 0.9rem;
  color: #4a5568;
  line-height: 1.4;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .nav-content {
    flex-direction: column;
    height: auto;
  }
  
  .sidebar {
    width: 100%;
    margin-bottom: 1rem;
  }
  
  .category-list {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .category-item {
    flex: 0 0 auto;
    padding: 0.8rem 1rem;
  }
  
  .content-area {
    max-height: 70vh;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .title-section {
    text-align: center;
    width: 100%;
  }
  
  .home-button {
    align-self: flex-start;
  }
}

@media (max-width: 768px) {
  .programming-nav {
    padding: 0.5rem 1rem 1rem 1rem;
  }
  
  .nav-title {
    font-size: 2rem;
    justify-content: center;
  }
  
  .nav-icon {
    font-size: 2.5rem;
  }
  
  .websites-grid {
    grid-template-columns: 1fr;
  }
  
  .website-card {
    padding: 1rem;
  }
  
  .sidebar {
    padding: 1rem;
  }
  
  .content-area {
    padding: 1.5rem;
  }
  
  .header-content {
    text-align: center;
  }
  
  .title-section {
    text-align: center;
  }
}
</style>