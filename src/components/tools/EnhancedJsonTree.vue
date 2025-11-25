<template>
  <div class="enhanced-tree-container">
    <div class="tree-header">
      <div class="tree-controls">
        <el-button-group>
          <el-button size="small" @click="expandAll">展开全部</el-button>
          <el-button size="small" @click="collapseAll">折叠全部</el-button>
          <el-button size="small" @click="toggleHighlight" :type="showHighlight ? 'primary' : ''">
            语法高亮
          </el-button>
        </el-button-group>
      </div>
    </div>
    
    <div class="tree-content" @contextmenu.prevent="handleContextMenu($event, null)">
      <transition name="fade" mode="out-in">
        <json-tree-node
          v-if="treeData"
          :data="treeData"
          :key-name="'root'"
          :level="0"
          :expanded-keys="expandedKeys"
          :show-highlight="showHighlight"
          @node-click="handleNodeClick"
          @node-right-click="handleNodeRightClick"
        />
      </transition>
    </div>

    <!-- 右键菜单 -->
    <transition name="context-menu">
      <div
        v-if="contextMenuVisible"
        class="context-menu"
        :style="{ left: contextMenuPosition.x + 'px', top: contextMenuPosition.y + 'px' }"
        @click.stop
      >
        <div class="context-menu-item" @click="copyPath">
          <el-icon><DocumentCopy /></el-icon>
          复制路径
        </div>
        <div class="context-menu-item" @click="copyKey">
          <el-icon><Key /></el-icon>
          复制键名
        </div>
        <div class="context-menu-item" @click="copyValue">
          <el-icon><CopyDocument /></el-icon>
          复制值
        </div>
        <el-divider style="margin: 4px 0;" />
        <div class="context-menu-item" @click="copyFormattedValue">
          <el-icon><Document /></el-icon>
          复制格式化值
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { DocumentCopy, Key, CopyDocument, Document } from '@element-plus/icons-vue'
import JsonTreeNode from './JsonTreeNode.vue'

const props = defineProps({
  jsonData: {
    type: [Object, Array],
    required: true
  }
})

const emit = defineEmits(['node-select'])

const treeData = ref(null)
const expandedKeys = ref(new Set())
const showHighlight = ref(true)
const contextMenuVisible = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })
const selectedNode = ref(null)

// 计算属性
const allKeys = computed(() => {
  const keys = new Set()
  collectAllKeys(treeData.value, '', keys)
  return keys
})

// 生命周期
onMounted(() => {
  initializeTree()
  document.addEventListener('click', hideContextMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', hideContextMenu)
})

// 初始化树数据
const initializeTree = () => {
  treeData.value = props.jsonData
  // 默认展开前两层
  expandToLevel(treeData.value, '', 2)
}

// 收集所有键
const collectAllKeys = (data, path, keys) => {
  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      const itemPath = path ? `${path}[${index}]` : `[${index}]`
      keys.add(itemPath)
      if (typeof item === 'object' && item !== null) {
        collectAllKeys(item, itemPath, keys)
      }
    })
  } else if (data && typeof data === 'object') {
    Object.keys(data).forEach(key => {
      const itemPath = path ? `${path}.${key}` : key
      keys.add(itemPath)
      if (typeof data[key] === 'object' && data[key] !== null) {
        collectAllKeys(data[key], itemPath, keys)
      }
    })
  }
}

// 展开到指定层级
const expandToLevel = (data, path, maxLevel, currentLevel = 0) => {
  if (currentLevel >= maxLevel) return
  
  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      const itemPath = path ? `${path}[${index}]` : `[${index}]`
      if (typeof item === 'object' && item !== null) {
        expandedKeys.value.add(itemPath)
        expandToLevel(item, itemPath, maxLevel, currentLevel + 1)
      }
    })
  } else if (data && typeof data === 'object') {
    Object.keys(data).forEach(key => {
      const itemPath = path ? `${path}.${key}` : key
      if (typeof data[key] === 'object' && data[key] !== null) {
        expandedKeys.value.add(itemPath)
        expandToLevel(data[key], itemPath, maxLevel, currentLevel + 1)
      }
    })
  }
}

// 控制方法
const expandAll = () => {
  expandedKeys.value = new Set(allKeys.value)
  ElMessage.success('已展开全部节点')
}

const collapseAll = () => {
  expandedKeys.value.clear()
  ElMessage.success('已折叠全部节点')
}

const toggleHighlight = () => {
  showHighlight.value = !showHighlight.value
  ElMessage.success(showHighlight.value ? '已开启语法高亮' : '已关闭语法高亮')
}

// 节点事件处理
const handleNodeClick = (nodeInfo) => {
  emit('node-select', nodeInfo)
}

const handleNodeRightClick = (event, nodeInfo) => {
  event.preventDefault()
  selectedNode.value = nodeInfo
  contextMenuPosition.value = {
    x: event.clientX,
    y: event.clientY
  }
  contextMenuVisible.value = true
}

const handleContextMenu = (event) => {
  // 阻止默认右键菜单，但允许在树节点上显示自定义菜单
  if (!event.target.closest('.tree-node')) {
    hideContextMenu()
  }
}

const hideContextMenu = () => {
  contextMenuVisible.value = false
}

// 复制功能
const copyPath = async () => {
  if (!selectedNode.value) return
  
  try {
    await navigator.clipboard.writeText(selectedNode.value.path)
    ElMessage.success('路径已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败，请手动复制')
    console.error('复制失败:', err)
  }
  hideContextMenu()
}

const copyKey = async () => {
  if (!selectedNode.value) return
  
  try {
    await navigator.clipboard.writeText(selectedNode.value.key)
    ElMessage.success('键名已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败，请手动复制')
    console.error('复制失败:', err)
  }
  hideContextMenu()
}

const copyValue = async () => {
  if (!selectedNode.value) return
  
  try {
    const value = JSON.stringify(selectedNode.value.value)
    await navigator.clipboard.writeText(value)
    ElMessage.success('值已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败，请手动复制')
    console.error('复制失败:', err)
  }
  hideContextMenu()
}

const copyFormattedValue = async () => {
  if (!selectedNode.value) return
  
  try {
    const formattedValue = JSON.stringify(selectedNode.value.value, null, 2)
    await navigator.clipboard.writeText(formattedValue)
    ElMessage.success('格式化值已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败，请手动复制')
    console.error('复制失败:', err)
  }
  hideContextMenu()
}

// 监听props变化
watch(() => props.jsonData, () => {
  initializeTree()
}, { deep: true })
</script>

<style scoped>
.enhanced-tree-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.tree-header {
  padding: 16px;
  border-bottom: 1px solid #ebeef5;
  background: #f5f7fa;
  border-radius: 8px 8px 0 0;
}

.tree-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tree-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

/* 动画效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 右键菜单样式 */
.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  z-index: 1000;
  min-width: 160px;
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 14px;
  color: #606266;
}

.context-menu-item:hover {
  background-color: #f5f7fa;
  color: #409eff;
}

.context-menu-item .el-icon {
  font-size: 16px;
}

.context-menu-enter-active,
.context-menu-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.context-menu-enter-from,
.context-menu-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(-10px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tree-controls {
    flex-direction: column;
    gap: 8px;
  }
  
  .tree-content {
    padding: 12px;
  }
  
  .context-menu {
    min-width: 140px;
  }
}
</style>