<template>
  <div class="tree-node" :style="{ marginLeft: level * 20 + 'px' }">
    <div class="node-header" @click="toggleExpanded" v-if="isExpandable">
      <span class="expand-icon" :class="{ expanded: isExpanded }">▶</span>
      <span class="key-name">{{ keyName }}</span>
      <span class="node-type">{{ nodeType }}</span>
      <span class="node-count" v-if="itemCount > 0">({{ itemCount }})</span>
    </div>
    <div class="node-header" v-else>
      <span class="expand-placeholder"></span>
      <span class="key-name">{{ keyName }}</span>
      <span class="node-value" :class="valueClass">{{ displayValue }}</span>
    </div>
    
    <div v-if="isExpanded && isExpandable" class="node-children">
      <JsonTreeNode 
        v-for="(value, key) in data" 
        :key="key"
        :data="value" 
        :key-name="key" 
        :level="level + 1"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  data: {
    required: true
  },
  keyName: {
    type: [String, Number],
    required: true
  },
  level: {
    type: Number,
    default: 0
  }
})

const isExpanded = ref(props.level < 2) // 默认展开前两层

const isExpandable = computed(() => {
  return Array.isArray(props.data) || (props.data && typeof props.data === 'object' && props.data !== null)
})

const nodeType = computed(() => {
  if (Array.isArray(props.data)) {
    return 'Array'
  } else if (props.data && typeof props.data === 'object') {
    return 'Object'
  }
  return ''
})

const itemCount = computed(() => {
  if (Array.isArray(props.data)) {
    return props.data.length
  } else if (props.data && typeof props.data === 'object') {
    return Object.keys(props.data).length
  }
  return 0
})

const displayValue = computed(() => {
  if (props.data === null) return 'null'
  if (props.data === undefined) return 'undefined'
  if (typeof props.data === 'string') return `"${props.data}"`
  if (typeof props.data === 'boolean') return props.data.toString()
  if (typeof props.data === 'number') return props.data.toString()
  return props.data
})

const valueClass = computed(() => {
  const type = typeof props.data
  if (props.data === null) return 'null-value'
  if (type === 'string') return 'string-value'
  if (type === 'number') return 'number-value'
  if (type === 'boolean') return 'boolean-value'
  return 'default-value'
})

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}
</script>

<style scoped>
.tree-node {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.4;
}

.node-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 2px 0;
  cursor: pointer;
  user-select: none;
}

.node-header:hover {
  background: rgba(52, 152, 219, 0.1);
  border-radius: 3px;
}

.expand-icon {
  width: 12px;
  height: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #7f8c8d;
  transition: transform 0.2s ease;
}

.expand-icon.expanded {
  transform: rotate(90deg);
}

.expand-placeholder {
  width: 12px;
  height: 12px;
}

.key-name {
  color: #8e44ad;
  font-weight: bold;
}

.key-name::after {
  content: ':';
  margin-left: 2px;
}

.node-type {
  color: #7f8c8d;
  font-style: italic;
  font-size: 11px;
}

.node-count {
  color: #95a5a6;
  font-size: 11px;
}

.node-value {
  flex: 1;
}

.string-value {
  color: #27ae60;
}

.number-value {
  color: #3498db;
}

.boolean-value {
  color: #e67e22;
  font-weight: bold;
}

.null-value {
  color: #95a5a6;
  font-style: italic;
}

.default-value {
  color: #2c3e50;
}

.node-children {
  border-left: 1px dotted #bdc3c7;
  margin-left: 6px;
}
</style>