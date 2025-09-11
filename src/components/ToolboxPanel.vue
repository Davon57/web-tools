<template>
  <div class="toolbox-panel">
    <div class="toolbox-header">
      <h3 class="toolbox-title">🧰 工具箱</h3>
      <p class="toolbox-subtitle">选择您需要的工具分类</p>
    </div>
    
    <div class="toolbox-categories">
      <div 
        v-for="category in categories" 
        :key="category.id"
        class="category-item"
        :class="{ 'expanded': expandedCategories.includes(category.id) }"
      >
        <div 
          class="category-header"
          @click="toggleCategory(category.id)"
        >
          <div class="category-info">
            <span class="category-icon">{{ category.icon }}</span>
            <div class="category-text">
              <h4 class="category-name">{{ category.name }}</h4>
              <p class="category-desc">{{ category.description }}</p>
            </div>
          </div>
          <div class="category-controls">
            <span class="tool-count">{{ category.tools.length }}个工具</span>
            <span class="expand-icon" :class="{ 'rotated': expandedCategories.includes(category.id) }">
              ▼
            </span>
          </div>
        </div>
        
        <transition name="slide-down">
          <div v-if="expandedCategories.includes(category.id)" class="category-tools">
            <div 
              v-for="tool in category.tools" 
              :key="tool.id"
              class="tool-item"
              :class="{ 'tool-unavailable': !tool.component }"
              @click="selectTool(category.id, tool.id)"
            >
              <div class="tool-icon">{{ tool.icon }}</div>
              <div class="tool-info">
                <h5 class="tool-name">{{ tool.name }}</h5>
                <p class="tool-desc">{{ tool.desc }}</p>
              </div>
              <div class="tool-status">
                <span v-if="!tool.component" class="status-badge coming-soon">即将推出</span>
                <span v-else class="status-badge available">可用</span>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue'

// 定义事件
const emit = defineEmits(['selectTool'])

// 响应式数据
const expandedCategories = ref([])

// 定义属性
const props = defineProps({
  categories: {
    type: Array,
    required: true
  }
})

// 方法
const toggleCategory = (categoryId) => {
  const index = expandedCategories.value.indexOf(categoryId)
  if (index > -1) {
    expandedCategories.value.splice(index, 1)
  } else {
    expandedCategories.value.push(categoryId)
  }
}

const selectTool = (categoryId, toolId) => {
  emit('selectTool', { categoryId, toolId })
}
</script>

<style scoped>
.toolbox-panel {
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.toolbox-header {
  padding: 25px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
}

.toolbox-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
}

.toolbox-subtitle {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
}

.toolbox-categories {
  padding: 0;
}

.category-item {
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.category-item:last-child {
  border-bottom: none;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.category-header:hover {
  background: #f8f9fa;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
}

.category-icon {
  font-size: 32px;
  width: 50px;
  text-align: center;
}

.category-text {
  flex: 1;
}

.category-name {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 4px 0;
}

.category-desc {
  font-size: 14px;
  color: #7f8c8d;
  margin: 0;
  line-height: 1.4;
}

.category-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.tool-count {
  font-size: 12px;
  color: #95a5a6;
  font-weight: 500;
}

.expand-icon {
  font-size: 14px;
  color: #95a5a6;
  transition: transform 0.3s ease;
}

.expand-icon.rotated {
  transform: rotate(180deg);
}

.category-tools {
  background: #f8f9fa;
  padding: 0;
}

.tool-item {
  display: flex;
  align-items: center;
  padding: 15px 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid #e9ecef;
}

.tool-item:last-child {
  border-bottom: none;
}

.tool-item:hover {
  background: #e9ecef;
  transform: translateX(5px);
}

.tool-item.tool-unavailable {
  opacity: 0.6;
  cursor: not-allowed;
}

.tool-item.tool-unavailable:hover {
  background: #f8f9fa;
  transform: none;
}

.tool-icon {
  font-size: 24px;
  width: 40px;
  text-align: center;
  margin-right: 15px;
}

.tool-info {
  flex: 1;
}

.tool-name {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 4px 0;
}

.tool-desc {
  font-size: 13px;
  color: #7f8c8d;
  margin: 0;
  line-height: 1.3;
}

.tool-status {
  margin-left: 15px;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.available {
  background: #d4edda;
  color: #155724;
}

.status-badge.coming-soon {
  background: #fff3cd;
  color: #856404;
}

/* 动画效果 */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}

.slide-down-enter-to,
.slide-down-leave-from {
  max-height: 500px;
  opacity: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .toolbox-header {
    padding: 20px;
  }
  
  .toolbox-title {
    font-size: 20px;
  }
  
  .category-header {
    padding: 15px 20px;
  }
  
  .category-icon {
    font-size: 28px;
    width: 40px;
  }
  
  .category-name {
    font-size: 16px;
  }
  
  .tool-item {
    padding: 12px 20px;
  }
  
  .tool-icon {
    font-size: 20px;
    width: 35px;
  }
}
</style>