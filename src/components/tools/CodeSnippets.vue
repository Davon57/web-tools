<template>
  <div class="code-snippets-container">
    <div class="tool-header">
      <div class="header-content">
        <div class="header-left">
          <button @click="$router.push('/')" class="back-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            返回主页
          </button>
        </div>
        <div class="title-section">
          <h1 class="tool-title">常用代码</h1>
          <p class="tool-description">JavaScript常用方法速查，点击卡片查看详细说明和示例</p>
        </div>
        <div class="header-actions">
          <a 
            href="https://developer.mozilla.org/zh-CN/" 
            target="_blank" 
            class="mdn-link-button"
            title="访问MDN Web文档官网"
          >
            <svg class="mdn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            </svg>
            MDN 官网
          </a>
        </div>
      </div>
    </div>

    <!-- 分类标签 -->
    <div class="category-tabs">
      <button 
        v-for="category in categories" 
        :key="category.id"
        :class="['tab-button', { active: activeCategory === category.id }]"
        @click="activeCategory = category.id"
      >
        <span class="category-icon">{{ category.icon }}</span>
        {{ category.name }}
      </button>
    </div>

    <!-- 方法卡片网格 -->
    <div class="methods-grid">
      <div 
        v-for="method in currentMethods" 
        :key="method.id"
        class="method-card"
        @click="openModal(method)"
      >
        <div class="method-header">
          <h3 class="method-name">{{ method.name }}</h3>
          <span class="method-type">{{ method.type }}</span>
        </div>
        <p class="method-description">{{ method.description }}</p>
        <div class="method-syntax">
          <code>{{ method.syntax }}</code>
        </div>
      </div>
    </div>

    <!-- 详细信息弹窗 -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">{{ selectedMethod.name }}</h2>
          <button class="close-button" @click="closeModal">×</button>
        </div>
        
        <div class="modal-body">
          <div class="method-info">
            <!-- 场景应用特殊展示 -->
            <div v-if="selectedMethod.category === 'scenarios'" class="scenario-info">
              <div class="info-section">
                <h3>应用场景</h3>
                <p class="scenario-description">{{ selectedMethod.scenario }}</p>
              </div>

              <div class="info-section">
                <h3>最佳实践</h3>
                <p class="best-practice">{{ selectedMethod.bestPractice }}</p>
              </div>

              <div class="info-section">
                <h3>详细说明</h3>
                <p>{{ selectedMethod.detailedDescription }}</p>
              </div>

              <div class="info-section">
                <h3>适用场景</h3>
                <ul class="use-cases-list">
                  <li v-for="useCase in selectedMethod.useCases" :key="useCase">
                    {{ useCase }}
                  </li>
                </ul>
              </div>

              <div class="info-section">
                <h3>代码示例</h3>
                <div class="examples">
                  <div v-for="(example, index) in selectedMethod.examples" :key="index" class="example-block">
                    <h4>{{ example.title }}</h4>
                    <p class="example-description">{{ example.description }}</p>
                    <div class="code-block">
                      <pre><code>{{ example.code }}</code></pre>
                    </div>
                    <div class="output-block">
                      <strong>输出:</strong> <code>{{ example.output }}</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 普通方法展示 -->
            <div v-else class="method-details">
              <div class="info-section">
                <h3>描述</h3>
                <p>{{ selectedMethod.detailedDescription }}</p>
              </div>

              <div class="info-section">
                <h3>语法</h3>
                <div class="syntax-block">
                  <code>{{ selectedMethod.syntax }}</code>
                </div>
              </div>

              <div class="info-section">
                <h3>参数</h3>
                <ul class="parameters-list">
                  <li v-for="param in selectedMethod.parameters" :key="param.name">
                    <strong>{{ param.name }}</strong>: {{ param.description }}
                  </li>
                </ul>
              </div>

              <div class="info-section">
                <h3>返回值</h3>
                <p>{{ selectedMethod.returnValue }}</p>
              </div>

              <div class="info-section">
                <h3>示例</h3>
                <div class="examples">
                  <div v-for="(example, index) in selectedMethod.examples" :key="index" class="example-block">
                    <h4>{{ example.title }}</h4>
                    <div class="code-block">
                      <pre><code>{{ example.code }}</code></pre>
                    </div>
                    <div class="output-block">
                      <strong>输出:</strong> <code>{{ example.output }}</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useToolsStore } from '@/stores/counter'

const toolsStore = useToolsStore()

// 响应式数据
const activeCategory = ref('array')
const showModal = ref(false)
const selectedMethod = ref({})

// 分类数据
const categories = ref([
  { id: 'array', name: '数组方法', icon: '📋' },
  { id: 'string', name: '字符串方法', icon: '📝' },
  { id: 'object', name: '对象方法', icon: '🔧' },
  { id: 'collection', name: '集合类型', icon: '🗂️' },
  { id: 'spread', name: '扩展语法', icon: '📤' },
  { id: 'date', name: '日期时间', icon: '📅' },
  { id: 'scenarios', name: '场景应用', icon: '🎯' }
])

// 方法数据
const methods = ref([
  // 数组方法
  {
    id: 'array-map',
    category: 'array',
    name: 'map()',
    type: '转换',
    description: '创建一个新数组，包含调用函数处理后的每个元素',
    syntax: 'array.map(callback(element, index, array))',
    detailedDescription: 'map() 方法创建一个新数组，其结果是该数组中的每个元素都调用一个提供的函数后返回的结果。原数组不会被修改。',
    parameters: [
      { name: 'callback', description: '为数组中每个元素执行的函数' },
      { name: 'element', description: '当前正在处理的元素' },
      { name: 'index', description: '当前正在处理的元素的索引' },
      { name: 'array', description: '调用了 map 的数组本身' }
    ]
  },

  // 更多数组方法
  {
    id: 'array-some',
    category: 'array',
    name: 'some()',
    type: '测试',
    description: '测试数组中是否至少有一个元素通过了被提供的函数测试',
    syntax: 'array.some(callback(element, index, array))',
    detailedDescription: 'some() 方法测试数组中是不是至少有1个元素通过了被提供的函数测试。它返回的是一个Boolean类型的值。',
    parameters: [
      { name: 'callback', description: '用来测试每个元素的函数' },
      { name: 'element', description: '当前正在处理的元素' },
      { name: 'index', description: '当前正在处理的元素的索引值' },
      { name: 'array', description: '调用 some 的数组' }
    ],
    returnValue: '数组中有至少一个元素通过回调函数的测试就会返回true；所有元素都没有通过回调函数的测试返回值才会为false',
    examples: [
      {
        title: '检查是否有偶数',
        code: 'const numbers = [1, 3, 5, 8, 9];\nconst hasEven = numbers.some(x => x % 2 === 0);',
        output: 'true'
      },
      {
        title: '检查是否有成年人',
        code: 'const ages = [12, 15, 17, 16];\nconst hasAdult = ages.some(age => age >= 18);',
        output: 'false'
      }
    ]
  },
  {
    id: 'array-every',
    category: 'array',
    name: 'every()',
    type: '测试',
    description: '测试一个数组内的所有元素是否都能通过某个指定函数的测试',
    syntax: 'array.every(callback(element, index, array))',
    detailedDescription: 'every() 方法测试一个数组内的所有元素是否都能通过某个指定函数的测试。它返回一个布尔值。',
    parameters: [
      { name: 'callback', description: '用来测试每个元素的函数' },
      { name: 'element', description: '当前正在处理的元素' },
      { name: 'index', description: '当前正在处理的元素的索引值' },
      { name: 'array', description: '调用 every 的数组' }
    ],
    returnValue: '如果回调函数的每一次返回都为 truthy 值，返回 true ，否则返回 false',
    examples: [
      {
        title: '检查是否都是正数',
        code: 'const numbers = [2, 4, 6, 8];\nconst allPositive = numbers.every(x => x > 0);',
        output: 'true'
      },
      {
        title: '检查是否都是成年人',
        code: 'const ages = [18, 25, 30, 17];\nconst allAdults = ages.every(age => age >= 18);',
        output: 'false'
      }
    ]
  },
  {
    id: 'array-includes',
    category: 'array',
    name: 'includes()',
    type: '查找',
    description: '判断一个数组是否包含一个指定的值',
    syntax: 'array.includes(valueToFind, fromIndex)',
    detailedDescription: 'includes() 方法用来判断一个数组是否包含一个指定的值，根据情况，如果包含则返回 true，否则返回false。',
    parameters: [
      { name: 'valueToFind', description: '需要查找的元素值' },
      { name: 'fromIndex', description: '从fromIndex 索引处开始查找 valueToFind' }
    ],
    returnValue: '返回一个布尔值 Boolean ，如果在数组中找到了（如果传入了 fromIndex ，表示在 fromIndex 指定的索引范围中找到了）则返回 true',
    examples: [
      {
        title: '检查数组是否包含元素',
        code: 'const fruits = ["apple", "banana", "orange"];\nconst hasBanana = fruits.includes("banana");',
        output: 'true'
      },
      {
        title: '从指定位置开始查找',
        code: 'const numbers = [1, 2, 3, 2, 1];\nconst hasTwo = numbers.includes(2, 3);',
        output: 'true'
      }
    ]
  },
  {
    id: 'array-join',
    category: 'array',
    name: 'join()',
    type: '转换',
    description: '将一个数组的所有元素连接成一个字符串并返回这个字符串',
    syntax: 'array.join(separator)',
    detailedDescription: 'join() 方法将一个数组（或一个类数组对象）的所有元素连接成一个字符串并返回这个字符串。如果数组只有一个项目，那么将返回该项目而不使用分隔符。',
    parameters: [
      { name: 'separator', description: '指定一个字符串来分隔数组的每个元素。如果需要，将分隔符转换为字符串。如果缺省该值，数组元素用逗号（,）分隔' }
    ],
    returnValue: '一个所有数组元素连接的字符串。如果 arr.length 为0，则返回空字符串',
    examples: [
      {
        title: '用逗号连接',
        code: 'const fruits = ["apple", "banana", "orange"];\nconst result = fruits.join(", ");',
        output: '"apple, banana, orange"'
      },
      {
        title: '用连字符连接',
        code: 'const words = ["Hello", "World", "JavaScript"];\nconst result = words.join("-");',
        output: '"Hello-World-JavaScript"'
      }
    ]
  },
  {
    id: 'array-concat',
    category: 'array',
    name: 'concat()',
    type: '合并',
    description: '合并两个或多个数组，返回一个新数组',
    syntax: 'array.concat(value1, value2, ..., valueN)',
    detailedDescription: 'concat() 方法用于合并两个或多个数组。此方法不会更改现有数组，而是返回一个新数组。',
    parameters: [
      { name: 'valueN', description: '数组和/或值，将被合并到一个新的数组中。如果省略了所有 valueN 参数，则 concat 会返回调用此方法的现存数组的一个浅拷贝' }
    ],
    returnValue: '新的 Array 实例',
    examples: [
      {
        title: '合并两个数组',
        code: 'const arr1 = [1, 2, 3];\nconst arr2 = [4, 5, 6];\nconst merged = arr1.concat(arr2);',
        output: '[1, 2, 3, 4, 5, 6]'
      },
      {
        title: '合并多个数组',
        code: 'const arr1 = [1, 2];\nconst arr2 = [3, 4];\nconst arr3 = [5, 6];\nconst merged = arr1.concat(arr2, arr3);',
        output: '[1, 2, 3, 4, 5, 6]'
      },
      {
        title: '合并数组和值',
        code: 'const arr = [1, 2];\nconst merged = arr.concat(3, [4, 5]);',
        output: '[1, 2, 3, 4, 5]'
      }
    ]
  },
  {
    id: 'array-flat',
    category: 'array',
    name: 'flat()',
    type: '扁平化',
    description: '按照一个可指定的深度递归遍历数组，并将所有元素与遍历到的子数组中的元素合并为一个新数组返回',
    syntax: 'array.flat(depth)',
    detailedDescription: 'flat() 方法会按照一个可指定的深度递归遍历数组，并将所有元素与遍历到的子数组中的元素合并为一个新数组返回。',
    parameters: [
      { name: 'depth', description: '指定要提取嵌套数组的结构深度，默认值为 1' }
    ],
    returnValue: '一个包含将数组与子数组中所有元素的新数组',
    examples: [
      {
        title: '一层扁平化',
        code: 'const arr = [1, 2, [3, 4]];\nconst flattened = arr.flat();',
        output: '[1, 2, 3, 4]'
      },
      {
        title: '多层扁平化',
        code: 'const arr = [1, 2, [3, [4, 5]]];\nconst flattened = arr.flat(2);',
        output: '[1, 2, 3, 4, 5]'
      },
      {
        title: '完全扁平化',
        code: 'const arr = [1, [2, [3, [4]]]];\nconst flattened = arr.flat(Infinity);',
        output: '[1, 2, 3, 4]'
      }
    ]
  },
  {
    id: 'array-flatmap',
    category: 'array',
    name: 'flatMap()',
    type: '映射扁平化',
    description: '首先使用映射函数映射每个元素，然后将结果压缩成一个新数组',
    syntax: 'array.flatMap(callback(currentValue, index, array))',
    detailedDescription: 'flatMap() 方法首先使用映射函数映射每个元素，然后将结果压缩成一个新数组。它与 map 连着深度值为1的 flat 几乎相同，但 flatMap 通常在合并成一种方法的效率稍微高一些。',
    parameters: [
      { name: 'callback', description: '可以生成一个新数组中的元素的函数' },
      { name: 'currentValue', description: '当前正在数组中处理的元素' },
      { name: 'index', description: '可选的。数组中正在处理的当前元素的索引' },
      { name: 'array', description: '可选的。被调用的 map 数组' }
    ],
    returnValue: '一个新的数组，其中每个元素都是回调函数的结果，并且结构深度 depth 值为1',
    examples: [
      {
        title: '映射并扁平化',
        code: 'const arr = [1, 2, 3];\nconst result = arr.flatMap(x => [x, x * 2]);',
        output: '[1, 2, 2, 4, 3, 6]'
      },
      {
        title: '过滤和映射',
        code: 'const arr = ["Hello World", "How are you"];\nconst words = arr.flatMap(str => str.split(" "));',
        output: '["Hello", "World", "How", "are", "you"]'
      }
    ]
  },
  {
    id: 'array-from',
    category: 'array',
    name: 'Array.from()',
    type: '创建',
    description: '从一个类似数组或可迭代对象创建一个新的，浅拷贝的数组实例',
    syntax: 'Array.from(arrayLike, mapFn, thisArg)',
    detailedDescription: 'Array.from() 方法从一个类似数组或可迭代对象创建一个新的，浅拷贝的数组实例。',
    parameters: [
      { name: 'arrayLike', description: '想要转换成数组的伪数组对象或可迭代对象' },
      { name: 'mapFn', description: '如果指定了该参数，新数组中的每个元素会执行该回调函数' },
      { name: 'thisArg', description: '可选参数，执行回调函数 mapFn 时 this 对象' }
    ],
    returnValue: '一个新的数组实例',
    examples: [
      {
        title: '从字符串创建数组',
        code: 'const str = "hello";\nconst arr = Array.from(str);',
        output: '["h", "e", "l", "l", "o"]'
      },
      {
        title: '从Set创建数组',
        code: 'const set = new Set([1, 2, 3]);\nconst arr = Array.from(set);',
        output: '[1, 2, 3]'
      },
      {
        title: '创建数字序列',
        code: 'const range = Array.from({length: 5}, (v, i) => i + 1);',
        output: '[1, 2, 3, 4, 5]'
      },
      {
        title: '映射转换',
        code: 'const doubled = Array.from([1, 2, 3], x => x * 2);',
        output: '[2, 4, 6]'
      }
    ]
  },
  {
    id: 'object-assign',
    category: 'array',
    name: 'Object.assign()',
    type: '合并',
    description: '将所有可枚举属性的值从一个或多个源对象复制到目标对象',
    syntax: 'Object.assign(target, ...sources)',
    detailedDescription: 'Object.assign() 方法用于将所有可枚举属性的值从一个或多个源对象复制到目标对象。它将返回目标对象。',
    parameters: [
      { name: 'target', description: '目标对象——接收源对象属性的对象，也是修改后的返回值' },
      { name: 'sources', description: '源对象——包含将被合并的属性' }
    ],
    returnValue: '目标对象',
    examples: [
      {
        title: '对象合并',
        code: 'const target = { a: 1, b: 2 };\nconst source = { b: 3, c: 4 };\nconst result = Object.assign(target, source);',
        output: '{ a: 1, b: 3, c: 4 }'
      },
      {
        title: '多个源对象合并',
        code: 'const obj1 = { a: 1 };\nconst obj2 = { b: 2 };\nconst obj3 = { c: 3 };\nconst result = Object.assign({}, obj1, obj2, obj3);',
        output: '{ a: 1, b: 2, c: 3 }'
      },
      {
        title: '克隆对象',
        code: 'const original = { a: 1, b: 2 };\nconst clone = Object.assign({}, original);',
        output: '{ a: 1, b: 2 }'
      }
    ]
  },

  // 更多字符串方法
  {
    id: 'string-substring',
    category: 'string',
    name: 'substring()',
    type: '截取',
    description: '返回一个字符串在开始索引到结束索引之间的一个子集',
    syntax: 'string.substring(indexStart, indexEnd)',
    detailedDescription: 'substring() 方法返回一个字符串在开始索引到结束索引之间的一个子集，或从开始索引直到字符串的末尾的一个子集。<mcreference link="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/substring" index="2">2</mcreference> 如果 indexStart 大于 indexEnd，则 substring() 会交换这两个参数。任何小于 0 或 NaN 的参数值都会被当作 0 来处理。',
    parameters: [
      { name: 'indexStart', description: '需要截取的第一个字符的索引，该索引位置的字符作为返回的字符串的首字符' },
      { name: 'indexEnd', description: '可选。一个 0 到字符串长度之间的整数，以该数字为索引的字符不包含在截取的字符串内。如果省略该参数，substring 会提取字符一直到字符串末尾' }
    ],
    returnValue: '包含给定字符串的指定部分的新字符串',
    mdnLink: 'https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/substring',
    examples: [
      {
        title: '基本截取',
        code: 'const str = "Mozilla";\nconst result = str.substring(1, 3);',
        output: '"oz"'
      },
      {
        title: '从指定位置到末尾',
        code: 'const str = "Mozilla";\nconst result = str.substring(2);',
        output: '"zilla"'
      },
      {
        title: '参数交换示例',
        code: 'const str = "Mozilla";\nconst result = str.substring(5, 2);',
        output: '"zil" // 等同于 str.substring(2, 5)'
      },
      {
        title: '使用 length 属性',
        code: 'const str = "Mozilla";\nconst result = str.substring(str.length - 4);',
        output: '"illa"'
      }
    ]
  },
  {
    id: 'string-slice',
    category: 'string',
    name: 'slice()',
    type: '截取',
    description: '提取字符串的一部分，并返回一个新的字符串，且不会改动原字符串',
    syntax: 'string.slice(beginIndex, endIndex)',
    detailedDescription: 'slice() 方法提取字符串的一部分，并返回一个新的字符串，且不会改动原字符串。<mcreference link="https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Useful_string_methods" index="3">3</mcreference> 与 substring() 不同，slice() 支持负数索引，负数索引从字符串末尾开始计算。',
    parameters: [
      { name: 'beginIndex', description: '从该索引（以 0 为基数）处开始提取原字符串中的字符。如果值为负数，会被当做 strLength + beginIndex 看待' },
      { name: 'endIndex', description: '可选。在该索引（以 0 为基数）处结束提取字符串。如果省略该参数，slice() 会一直提取到字符串末尾' }
    ],
    returnValue: '返回一个从原字符串中提取出来的新字符串',
    mdnLink: 'https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/slice',
    examples: [
      {
        title: '基本截取',
        code: 'const str = "Mozilla";\nconst result = str.slice(1, 4);',
        output: '"ozi"'
      },
      {
        title: '负数索引',
        code: 'const str = "Mozilla";\nconst result = str.slice(-4, -1);',
        output: '"ill"'
      },
      {
        title: '从指定位置到末尾',
        code: 'const str = "Mozilla";\nconst result = str.slice(2);',
        output: '"zilla"'
      }
    ]
  },
  {
    id: 'string-indexof',
    category: 'string',
    name: 'indexOf()',
    type: '查找',
    description: '返回调用字符串中第一次出现的指定值的索引，如果未找到该值，则返回 -1',
    syntax: 'string.indexOf(searchValue, fromIndex)',
    detailedDescription: 'indexOf() 方法返回调用字符串中第一次出现的指定值的索引，开始在 fromIndex 进行搜索。<mcreference link="https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Useful_string_methods" index="3">3</mcreference> 如果未找到该值，则返回 -1。indexOf() 方法区分大小写。',
    parameters: [
      { name: 'searchValue', description: '要被查找的字符串值。如果没有提供确切地提供字符串，searchValue 会被强制设置为 "undefined"' },
      { name: 'fromIndex', description: '可选。数字表示开始查找的位置。可以是任意整数，默认值为 0' }
    ],
    returnValue: '查找的字符串 searchValue 的第一次出现的索引，如果没有找到，则返回 -1',
    mdnLink: 'https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/indexOf',
    examples: [
      {
        title: '基本查找',
        code: 'const str = "Hello World";\nconst index = str.indexOf("World");',
        output: '6'
      },
      {
        title: '未找到的情况',
        code: 'const str = "Hello World";\nconst index = str.indexOf("JavaScript");',
        output: '-1'
      },
      {
        title: '指定起始位置',
        code: 'const str = "Hello World Hello";\nconst index = str.indexOf("Hello", 1);',
        output: '12'
      },
      {
        title: '区分大小写',
        code: 'const str = "Hello World";\nconst index = str.indexOf("hello");',
        output: '-1'
      }
    ]
  },
  {
    id: 'string-charat',
    category: 'string',
    name: 'charAt()',
    type: '访问',
    description: '从一个字符串中返回指定的字符',
    syntax: 'string.charAt(index)',
    detailedDescription: 'charAt() 方法从一个字符串中返回指定的字符。<mcreference link="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String" index="1">1</mcreference> 字符串中的字符从左向右索引，第一个字符的索引值为 0，最后一个字符的索引值为 stringName.length - 1。',
    parameters: [
      { name: 'index', description: '一个介于 0 和字符串长度减 1 之间的整数。如果没有提供索引，charAt() 使用 0' }
    ],
    returnValue: '返回指定位置的字符。如果 index 不在 0 与 string.length - 1 之间，则返回一个空字符串',
    mdnLink: 'https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/charAt',
    examples: [
      {
        title: '获取第一个字符',
        code: 'const str = "Hello";\nconst char = str.charAt(0);',
        output: '"H"'
      },
      {
        title: '获取最后一个字符',
        code: 'const str = "Hello";\nconst char = str.charAt(str.length - 1);',
        output: '"o"'
      },
      {
        title: '索引超出范围',
        code: 'const str = "Hello";\nconst char = str.charAt(10);',
        output: '""'
      }
    ]
  },
  {
    id: 'string-split',
    category: 'string',
    name: 'split()',
    type: '分割',
    description: '使用指定的分隔符字符串将一个String对象分割成子字符串数组',
    syntax: 'string.split(separator, limit)',
    detailedDescription: 'split() 方法使用指定的分隔符字符串将一个 String 对象分割成子字符串数组，以一个指定的分割字串来决定每个拆分的位置。<mcreference link="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split" index="5">5</mcreference>',
    parameters: [
      { name: 'separator', description: '指定表示每个拆分应该发生的点的字符串。可以是一个字符串或正则表达式' },
      { name: 'limit', description: '可选。一个整数，限定返回的分割片段数量' }
    ],
    returnValue: '返回源字符串以分隔符出现位置分隔而成的一个 Array',
    mdnLink: 'https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/split',
    examples: [
      {
        title: '用空格分割',
        code: 'const str = "Hello World JavaScript";\nconst words = str.split(" ");',
        output: '["Hello", "World", "JavaScript"]'
      },
      {
        title: '用逗号分割',
        code: 'const str = "apple,banana,orange";\nconst fruits = str.split(",");',
        output: '["apple", "banana", "orange"]'
      },
      {
        title: '限制分割数量',
        code: 'const str = "a-b-c-d-e";\nconst parts = str.split("-", 3);',
        output: '["a", "b", "c"]'
      },
      {
        title: '分割成字符数组',
        code: 'const str = "Hello";\nconst chars = str.split("");',
        output: '["H", "e", "l", "l", "o"]'
      }
    ]
  },
  {
    id: 'string-padstart',
    category: 'string',
    name: 'padStart()',
    type: '填充',
    description: '用另一个字符串填充当前字符串，从开始位置填充',
    syntax: 'string.padStart(targetLength, padString)',
    detailedDescription: 'padStart() 方法用另一个字符串填充当前字符串(如果需要的话，会重复多次)，以便产生的字符串达到给定的长度。从当前字符串的左侧开始填充。',
    parameters: [
      { name: 'targetLength', description: '当前字符串需要填充到的目标长度' },
      { name: 'padString', description: '填充字符串。如果字符串太长，使填充后的字符串长度超过了目标长度，则只保留最左侧的部分，其他部分会被截断' }
    ],
    returnValue: '在原字符串开头填充指定的填充字符串直到目标长度所形成的新字符串',
    examples: [
      {
        title: '数字补零',
        code: 'const num = "5";\nconst padded = num.padStart(3, "0");',
        output: '"005"'
      },
      {
        title: '字符串填充',
        code: 'const str = "abc";\nconst padded = str.padStart(10, "foo");',
        output: '"foofoofabc"'
      }
    ]
  },
  {
    id: 'string-repeat',
    category: 'string',
    name: 'repeat()',
    type: '重复',
    description: '构造并返回一个新字符串，该字符串包含被连接在一起的指定数量的字符串的副本',
    syntax: 'string.repeat(count)',
    detailedDescription: 'repeat() 构造并返回一个新字符串，该字符串包含被连接在一起的指定数量的字符串的副本。',
    parameters: [
      { name: 'count', description: '介于 0 和 +Infinity 之间的整数。表示在新构造的字符串中重复了多少遍原字符串' }
    ],
    returnValue: '包含指定字符串的指定数量副本的新字符串',
    examples: [
      {
        title: '重复字符',
        code: 'const str = "abc";\nconst repeated = str.repeat(3);',
        output: '"abcabcabc"'
      },
      {
        title: '创建分隔线',
        code: 'const dash = "-";\nconst line = dash.repeat(20);',
        output: '"--------------------"'
      }
    ]
  },

  // 对象方法
  {
    id: 'object-keys',
    category: 'object',
    name: 'Object.keys()',
    type: '属性',
    description: '返回一个由一个给定对象的自身可枚举属性组成的数组',
    syntax: 'Object.keys(obj)',
    detailedDescription: 'Object.keys() 返回一个由一个给定对象的自身可枚举属性组成的数组，数组中属性名的排列顺序和正常循环遍历该对象时返回的顺序一致。<mcreference link="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys" index="2">2</mcreference> 如果需要属性值，请使用 Object.values()；如果需要属性名和属性值，请使用 Object.entries()。',
    parameters: [
      { name: 'obj', description: '要返回其枚举自身属性的对象' }
    ],
    returnValue: '一个表示给定对象的所有可枚举属性的字符串数组',
    mdnLink: 'https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/keys',
    examples: [
      {
        title: '获取对象属性名',
        code: 'const obj = { a: 1, b: 2, c: 3 };\nconst keys = Object.keys(obj);',
        output: '["a", "b", "c"]'
      },
      {
        title: '数组对象的键',
        code: 'const arr = ["a", "b", "c"];\nconst keys = Object.keys(arr);',
        output: '["0", "1", "2"]'
      },
      {
        title: '类数组对象',
        code: 'const obj = { 0: "a", 1: "b", 2: "c" };\nconst keys = Object.keys(obj);',
        output: '["0", "1", "2"]'
      }
    ]
  },
  {
    id: 'object-values',
    category: 'object',
    name: 'Object.values()',
    type: '属性',
    description: '返回一个给定对象自身的所有可枚举属性值的数组',
    syntax: 'Object.values(obj)',
    detailedDescription: 'Object.values() 方法返回一个给定对象自身的所有可枚举属性值的数组，值的顺序与使用 for...in 循环的顺序相同。<mcreference link="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys" index="2">2</mcreference>',
    parameters: [
      { name: 'obj', description: '被返回可枚举属性值的对象' }
    ],
    returnValue: '一个包含对象自身的所有可枚举属性值的数组',
    mdnLink: 'https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/values',
    examples: [
      {
        title: '获取对象属性值',
        code: 'const obj = { a: 1, b: 2, c: 3 };\nconst values = Object.values(obj);',
        output: '[1, 2, 3]'
      },
      {
        title: '数组对象的值',
        code: 'const arr = ["foo", "bar", "baz"];\nconst values = Object.values(arr);',
        output: '["foo", "bar", "baz"]'
      },
      {
        title: '字符串对象',
        code: 'const str = "foo";\nconst values = Object.values(str);',
        output: '["f", "o", "o"]'
      }
    ]
  },
  {
    id: 'object-entries',
    category: 'object',
    name: 'Object.entries()',
    type: '属性',
    description: '返回一个给定对象自身可枚举属性的键值对数组',
    syntax: 'Object.entries(obj)',
    detailedDescription: 'Object.entries() 方法返回一个给定对象自身可枚举属性的键值对数组，其排列与使用 for...in 循环遍历该对象时返回的顺序一致。<mcreference link="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object" index="3">3</mcreference>',
    parameters: [
      { name: 'obj', description: '可以返回其可枚举属性的键值对的对象' }
    ],
    returnValue: '给定对象自身可枚举属性的键值对数组',
    mdnLink: 'https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/entries',
    examples: [
      {
        title: '获取键值对',
        code: 'const obj = { a: 1, b: 2, c: 3 };\nconst entries = Object.entries(obj);',
        output: '[["a", 1], ["b", 2], ["c", 3]]'
      },
      {
        title: '遍历对象',
        code: 'const obj = { name: "John", age: 30 };\nfor (const [key, value] of Object.entries(obj)) {\n  console.log(`${key}: ${value}`);\n}',
        output: '"name: John"\n"age: 30"'
      },
      {
        title: '转换为Map',
        code: 'const obj = { foo: "bar", baz: 42 };\nconst map = new Map(Object.entries(obj));',
        output: 'Map(2) {"foo" => "bar", "baz" => 42}'
      }
    ]
  },
  {
    id: 'object-hasownproperty',
    category: 'object',
    name: 'hasOwnProperty()',
    type: '检测',
    description: '返回一个布尔值，指示对象自身属性中是否具有指定的属性',
    syntax: 'obj.hasOwnProperty(prop)',
    detailedDescription: 'hasOwnProperty() 方法会返回一个布尔值，指示对象自身属性中是否具有指定的属性（也就是，是否有指定的键）。<mcreference link="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty" index="4">4</mcreference> 该方法会忽略掉那些从原型链上继承到的属性。',
    parameters: [
      { name: 'prop', description: '要检测的属性的 String 字符串形式表示的名称，或者 Symbol' }
    ],
    returnValue: '用来判断某个对象是否含有指定的属性的布尔值',
    mdnLink: 'https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/prototype/hasOwnProperty',
    examples: [
      {
        title: '检测自有属性',
        code: 'const obj = { prop: "exists" };\nconst hasOwn = obj.hasOwnProperty("prop");',
        output: 'true'
      },
      {
        title: '检测不存在的属性',
        code: 'const obj = { prop: "exists" };\nconst hasOwn = obj.hasOwnProperty("nonExistent");',
        output: 'false'
      },
      {
        title: '区分自有属性和继承属性',
        code: 'const obj = Object.create({ inherited: true });\nobj.own = true;\nconsole.log(obj.hasOwnProperty("own"));\nconsole.log(obj.hasOwnProperty("inherited"));',
        output: 'true\nfalse'
      }
    ]
  },
  {
    id: 'object-assign',
    category: 'object',
    name: 'Object.assign()',
    type: '复制',
    description: '将所有可枚举的自有属性从一个或多个源对象复制到目标对象',
    syntax: 'Object.assign(target, ...sources)',
    detailedDescription: 'Object.assign() 方法将所有可枚举的自有属性从一个或多个源对象复制到目标对象，返回修改后的目标对象。<mcreference link="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object" index="3">3</mcreference>',
    parameters: [
      { name: 'target', description: '目标对象，接收源对象属性的对象，也是修改后的返回值' },
      { name: 'sources', description: '源对象，包含将被合并的属性' }
    ],
    returnValue: '目标对象',
    mdnLink: 'https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/assign',
    examples: [
      {
        title: '复制对象',
        code: 'const target = { a: 1, b: 2 };\nconst source = { b: 4, c: 5 };\nconst result = Object.assign(target, source);',
        output: '{ a: 1, b: 4, c: 5 }'
      },
      {
        title: '克隆对象',
        code: 'const obj = { a: 1 };\nconst copy = Object.assign({}, obj);',
        output: '{ a: 1 }'
      },
      {
        title: '合并多个对象',
        code: 'const o1 = { a: 1 };\nconst o2 = { b: 2 };\nconst o3 = { c: 3 };\nconst obj = Object.assign({}, o1, o2, o3);',
        output: '{ a: 1, b: 2, c: 3 }'
      }
    ]
  },
  {
    id: 'object-create',
    category: 'object',
    name: 'Object.create()',
    type: '创建',
    description: '使用指定的原型对象和属性创建一个新对象',
    syntax: 'Object.create(proto, propertiesObject)',
    detailedDescription: 'Object.create() 方法创建一个新对象，使用现有的对象来提供新创建的对象的 __proto__。<mcreference link="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object" index="3">3</mcreference>',
    parameters: [
      { name: 'proto', description: '新创建对象的原型对象' },
      { name: 'propertiesObject', description: '可选。需要传入一个对象，该对象的属性类型照对象的属性描述符' }
    ],
    returnValue: '一个新对象，带着指定的原型对象和属性',
    mdnLink: 'https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/create',
    examples: [
      {
        title: '创建对象',
        code: 'const person = {\n  isHuman: false,\n  printIntroduction: function() {\n    console.log(`My name is ${this.name}`);\n  }\n};\nconst me = Object.create(person);',
        output: '对象创建成功，继承了person的属性'
      },
      {
        title: '创建null原型对象',
        code: 'const obj = Object.create(null);\nobj.name = "test";',
        output: '创建了一个没有原型的纯净对象'
      }
    ]
  },

  // 集合类型方法
  {
    id: 'set-new',
    category: 'collection',
    name: 'new Set()',
    type: '创建',
    description: '创建一个新的Set对象，存储任何类型的唯一值',
    syntax: 'new Set([iterable])',
    detailedDescription: 'Set 对象允许你存储任何类型的唯一值，无论是原始值或者是对象引用。',
    parameters: [
      { name: 'iterable', description: '如果传递一个可迭代对象，它的所有元素将不重复地被添加到新的 Set中' }
    ],
    returnValue: '一个新的Set对象',
    examples: [
      {
        title: '创建空Set',
        code: 'const mySet = new Set();\nmySet.add(1);\nmySet.add(2);',
        output: 'Set(2) {1, 2}'
      },
      {
        title: '从数组创建Set去重',
        code: 'const arr = [1, 2, 2, 3, 3, 4];\nconst uniqueSet = new Set(arr);',
        output: 'Set(4) {1, 2, 3, 4}'
      }
    ]
  },
  {
    id: 'set-add',
    category: 'collection',
    name: 'Set.add()',
    type: '添加',
    description: '在Set对象尾部添加一个元素，返回该Set对象',
    syntax: 'mySet.add(value)',
    detailedDescription: 'add() 方法用来向一个 Set 对象的末尾添加一个指定的值。',
    parameters: [
      { name: 'value', description: '需要添加到 Set 对象的元素的值' }
    ],
    returnValue: 'Set 对象本身',
    examples: [
      {
        title: '添加基本类型',
        code: 'const mySet = new Set();\nmySet.add(1).add(2).add(3);',
        output: 'Set(3) {1, 2, 3}'
      },
      {
        title: '添加对象',
        code: 'const mySet = new Set();\nconst obj = {a: 1};\nmySet.add(obj);',
        output: 'Set(1) {{a: 1}}'
      }
    ]
  },
  {
    id: 'set-has',
    category: 'collection',
    name: 'Set.has()',
    type: '查找',
    description: '返回一个布尔值，表示该值在Set中存在与否',
    syntax: 'mySet.has(value)',
    detailedDescription: 'has() 方法返回一个布尔值来指示对应的值value是否存在Set对象中。',
    parameters: [
      { name: 'value', description: '在Set对象中查找的值' }
    ],
    returnValue: '如果指定的值存在于Set对象中，则返回true；否则返回false',
    examples: [
      {
        title: '检查元素是否存在',
        code: 'const mySet = new Set([1, 2, 3]);\nconsole.log(mySet.has(2));\nconsole.log(mySet.has(4));',
        output: 'true\nfalse'
      }
    ]
  },
  {
    id: 'map-new',
    category: 'collection',
    name: 'new Map()',
    type: '创建',
    description: '创建一个新的Map对象，保存键值对，并且能够记住键的原始插入顺序',
    syntax: 'new Map([iterable])',
    detailedDescription: 'Map 对象保存键值对，并且能够记住键的原始插入顺序。任何值(对象或者原始值) 都可以作为一个键或一个值。',
    parameters: [
      { name: 'iterable', description: 'Iterable 可以是一个数组或者其他 iterable 对象，其元素为键值对' }
    ],
    returnValue: '一个新的Map对象',
    examples: [
      {
        title: '创建空Map',
        code: 'const myMap = new Map();\nmyMap.set("key1", "value1");\nmyMap.set("key2", "value2");',
        output: 'Map(2) {"key1" => "value1", "key2" => "value2"}'
      },
      {
        title: '从数组创建Map',
        code: 'const myMap = new Map([\n  ["key1", "value1"],\n  ["key2", "value2"]\n]);',
        output: 'Map(2) {"key1" => "value1", "key2" => "value2"}'
      }
    ]
  },
  {
    id: 'map-set',
    category: 'collection',
    name: 'Map.set()',
    type: '设置',
    description: '为Map对象添加或更新一个指定了键和值的键值对',
    syntax: 'myMap.set(key, value)',
    detailedDescription: 'set() 方法为 Map 对象添加或更新一个指定了键（key）和值（value）的（新）键值对。',
    parameters: [
      { name: 'key', description: '要添加至相应 Map 对象的元素的键' },
      { name: 'value', description: '要添加至相应 Map 对象的元素的值' }
    ],
    returnValue: 'Map对象',
    examples: [
      {
        title: '设置键值对',
        code: 'const myMap = new Map();\nmyMap.set("name", "Alice");\nmyMap.set("age", 25);',
        output: 'Map(2) {"name" => "Alice", "age" => 25}'
      },
      {
        title: '链式调用',
        code: 'const myMap = new Map();\nmyMap.set("a", 1).set("b", 2).set("c", 3);',
        output: 'Map(3) {"a" => 1, "b" => 2, "c" => 3}'
      }
    ]
  },

  // 扩展语法方法
  {
    id: 'spread-array',
    category: 'spread',
    name: '数组扩展 [...arr]',
    type: '扩展',
    description: '将数组展开为独立的元素',
    syntax: '[...array]',
    detailedDescription: '扩展语法(Spread syntax), 可以在函数调用/数组构造时, 将数组表达式或者string在语法层面展开；还可以在构造字面量对象时, 将对象表达式按key-value的方式展开。',
    parameters: [
      { name: 'array', description: '要展开的数组' }
    ],
    returnValue: '展开后的元素序列',
    examples: [
      {
        title: '数组合并',
        code: 'const arr1 = [1, 2, 3];\nconst arr2 = [4, 5, 6];\nconst merged = [...arr1, ...arr2];',
        output: '[1, 2, 3, 4, 5, 6]'
      },
      {
        title: '数组复制',
        code: 'const original = [1, 2, 3];\nconst copy = [...original];',
        output: '[1, 2, 3]'
      },
      {
        title: '函数参数展开',
        code: 'const numbers = [1, 2, 3, 4, 5];\nconst max = Math.max(...numbers);',
        output: '5'
      }
    ]
  },
  {
    id: 'spread-object',
    category: 'spread',
    name: '对象扩展 {...obj}',
    type: '扩展',
    description: '将对象的属性展开到新对象中',
    syntax: '{...object}',
    detailedDescription: '对象扩展语法允许将一个对象的所有可枚举属性复制到另一个对象中。',
    parameters: [
      { name: 'object', description: '要展开的对象' }
    ],
    returnValue: '包含展开属性的新对象',
    examples: [
      {
        title: '对象合并',
        code: 'const obj1 = {a: 1, b: 2};\nconst obj2 = {c: 3, d: 4};\nconst merged = {...obj1, ...obj2};',
        output: '{a: 1, b: 2, c: 3, d: 4}'
      },
      {
        title: '对象复制和修改',
        code: 'const user = {name: "Alice", age: 25};\nconst updatedUser = {...user, age: 26};',
        output: '{name: "Alice", age: 26}'
      }
    ]
  },
  {
    id: 'destructure-array',
    category: 'spread',
    name: '数组解构 [a, b]',
    type: '解构',
    description: '从数组中提取值，赋值给变量',
    syntax: 'const [a, b, ...rest] = array',
    detailedDescription: '解构赋值语法是一种 Javascript 表达式。通过解构赋值, 可以将属性/值从对象/数组中取出,赋值给其他变量。',
    parameters: [
      { name: 'array', description: '要解构的数组' }
    ],
    returnValue: '解构出的变量',
    examples: [
      {
        title: '基本数组解构',
        code: 'const arr = [1, 2, 3, 4, 5];\nconst [first, second, ...rest] = arr;\nconsole.log(first, second, rest);',
        output: '1 2 [3, 4, 5]'
      },
      {
        title: '交换变量',
        code: 'let a = 1, b = 2;\n[a, b] = [b, a];\nconsole.log(a, b);',
        output: '2 1'
      },
      {
        title: '跳过元素',
        code: 'const arr = [1, 2, 3, 4];\nconst [first, , third] = arr;\nconsole.log(first, third);',
        output: '1 3'
      }
    ]
  },
  {
    id: 'destructure-object',
    category: 'spread',
    name: '对象解构 {a, b}',
    type: '解构',
    description: '从对象中提取属性值，赋值给变量',
    syntax: 'const {a, b, ...rest} = object',
    detailedDescription: '对象解构允许你从对象中提取属性，并将它们赋值给变量。可以使用不同的变量名，设置默认值等。',
    parameters: [
      { name: 'object', description: '要解构的对象' }
    ],
    returnValue: '解构出的变量',
    examples: [
      {
        title: '基本对象解构',
        code: 'const user = {name: "Alice", age: 25, city: "New York"};\nconst {name, age, ...rest} = user;\nconsole.log(name, age, rest);',
        output: '"Alice" 25 {city: "New York"}'
      },
      {
        title: '重命名变量',
        code: 'const user = {name: "Alice", age: 25};\nconst {name: userName, age: userAge} = user;\nconsole.log(userName, userAge);',
        output: '"Alice" 25'
      },
      {
        title: '默认值',
        code: 'const user = {name: "Alice"};\nconst {name, age = 18} = user;\nconsole.log(name, age);',
        output: '"Alice" 18'
      }
    ]
  },

  // 日期时间方法
  {
    id: 'date-new',
    category: 'date',
    name: 'new Date()',
    type: '创建',
    description: '创建一个新的Date对象',
    syntax: 'new Date(year, month, day, hours, minutes, seconds, milliseconds)',
    detailedDescription: 'Date 构造函数能够创建一个新的Date对象。如果没有提供参数，那么新创建的Date对象表示实例化时刻的日期和时间。',
    parameters: [
      { name: 'year', description: '表示年份的整数值' },
      { name: 'month', description: '表示月份的整数值，从 0（1月）到 11（12月）' },
      { name: 'day', description: '表示一个月中的第几天的整数值，从1开始' }
    ],
    returnValue: '一个新的Date对象',
    examples: [
      {
        title: '当前时间',
        code: 'const now = new Date();\nconsole.log(now);',
        output: '2024-01-15T10:30:00.000Z'
      },
      {
        title: '指定日期',
        code: 'const date = new Date(2024, 0, 15); // 2024年1月15日\nconsole.log(date);',
        output: '2024-01-15T00:00:00.000Z'
      },
      {
        title: '从字符串创建',
        code: 'const date = new Date("2024-01-15");\nconsole.log(date);',
        output: '2024-01-15T00:00:00.000Z'
      }
    ]
  },
  {
    id: 'date-gettime',
    category: 'date',
    name: 'getTime()',
    type: '获取',
    description: '返回一个时间的格林威治时间数值',
    syntax: 'dateObj.getTime()',
    detailedDescription: 'getTime() 方法返回一个时间的格林威治时间数值。你可以使用这个方法把一个日期时间赋值给另一个Date 对象。',
    parameters: [],
    returnValue: 'getTime 方法的返回值一个数值，表示从1970年1月1日0时0分0秒（UTC，即协调世界时）距离该日期对象所代表时间的毫秒数',
    examples: [
      {
        title: '获取时间戳',
        code: 'const date = new Date("2024-01-15");\nconst timestamp = date.getTime();',
        output: '1705276800000'
      },
      {
        title: '计算时间差',
        code: 'const date1 = new Date("2024-01-15");\nconst date2 = new Date("2024-01-16");\nconst diff = date2.getTime() - date1.getTime();',
        output: '86400000 // 一天的毫秒数'
      }
    ]
  },
  {
    id: 'date-format',
    category: 'date',
    name: 'toLocaleDateString()',
    type: '格式化',
    description: '根据本地时间返回该日期对象日期部分的字符串',
    syntax: 'dateObj.toLocaleDateString(locales, options)',
    detailedDescription: 'toLocaleDateString() 方法返回该日期对象日期部分的字符串，该字符串格式因不同语言而不同。',
    parameters: [
      { name: 'locales', description: '缩写语言代码（BCP 47 language tag，例如en-US）的字符串或者这些字符串组成的数组' },
      { name: 'options', description: '配置属性的对象' }
    ],
    returnValue: '表示给定日期对象日期部分的语言敏感的字符串',
    examples: [
      {
        title: '中文格式',
        code: 'const date = new Date("2024-01-15");\nconst formatted = date.toLocaleDateString("zh-CN");',
        output: '"2024/1/15"'
      },
      {
        title: '自定义格式',
        code: 'const date = new Date("2024-01-15");\nconst formatted = date.toLocaleDateString("zh-CN", {\n  year: "numeric",\n  month: "long",\n  day: "numeric"\n});',
        output: '"2024年1月15日"'
      }
    ],
    returnValue: '一个新数组，每个元素都是回调函数的结果',
    examples: [
      {
        title: '数字数组平方',
        code: 'const numbers = [1, 2, 3, 4];\nconst squares = numbers.map(x => x * x);',
        output: '[1, 4, 9, 16]'
      },
      {
        title: '提取对象属性',
        code: 'const users = [{name: "Alice", age: 25}, {name: "Bob", age: 30}];\nconst names = users.map(user => user.name);',
        output: '["Alice", "Bob"]'
      }
    ]
  },
  {
    id: 'array-filter',
    category: 'array',
    name: 'filter()',
    type: '筛选',
    description: '创建一个新数组，包含通过测试函数的所有元素',
    syntax: 'array.filter(callback(element, index, array))',
    detailedDescription: 'filter() 方法创建一个新数组，其包含通过所提供函数实现的测试的所有元素。',
    parameters: [
      { name: 'callback', description: '用来测试数组的每个元素的函数' },
      { name: 'element', description: '当前正在处理的元素' },
      { name: 'index', description: '当前正在处理的元素的索引' },
      { name: 'array', description: '调用了 filter 的数组本身' }
    ],
    returnValue: '一个新数组，包含通过测试的元素',
    examples: [
      {
        title: '筛选偶数',
        code: 'const numbers = [1, 2, 3, 4, 5, 6];\nconst evens = numbers.filter(x => x % 2 === 0);',
        output: '[2, 4, 6]'
      },
      {
        title: '筛选成年人',
        code: 'const people = [{name: "Alice", age: 17}, {name: "Bob", age: 25}];\nconst adults = people.filter(person => person.age >= 18);',
        output: '[{name: "Bob", age: 25}]'
      }
    ]
  },
  {
    id: 'array-reduce',
    category: 'array',
    name: 'reduce()',
    type: '归约',
    description: '对数组中的每个元素执行reducer函数，将其结果汇总为单个返回值',
    syntax: 'array.reduce(callback(accumulator, element, index, array), initialValue)',
    detailedDescription: 'reduce() 方法对数组中的每个元素执行一个由您提供的reducer函数(升序执行)，将其结果汇总为单个返回值。',
    parameters: [
      { name: 'callback', description: '执行数组中每个值的函数' },
      { name: 'accumulator', description: '累计器累计回调的返回值' },
      { name: 'element', description: '当前正在处理的元素' },
      { name: 'index', description: '当前正在处理的元素的索引' },
      { name: 'array', description: '调用 reduce 的数组' },
      { name: 'initialValue', description: '作为第一次调用 callback 函数时的第一个参数的值' }
    ],
    returnValue: '函数累计处理的结果',
    examples: [
      {
        title: '数组求和',
        code: 'const numbers = [1, 2, 3, 4];\nconst sum = numbers.reduce((acc, curr) => acc + curr, 0);',
        output: '10'
      },
      {
        title: '统计元素出现次数',
        code: 'const fruits = ["apple", "banana", "apple", "orange"];\nconst count = fruits.reduce((acc, fruit) => {\n  acc[fruit] = (acc[fruit] || 0) + 1;\n  return acc;\n}, {});',
        output: '{apple: 2, banana: 1, orange: 1}'
      }
    ]
  },
  {
    id: 'array-find',
    category: 'array',
    name: 'find()',
    type: '查找',
    description: '返回数组中满足测试函数的第一个元素的值',
    syntax: 'array.find(callback(element, index, array))',
    detailedDescription: 'find() 方法返回数组中满足提供的测试函数的第一个元素的值。否则返回 undefined。',
    parameters: [
      { name: 'callback', description: '在数组每一项上执行的函数' },
      { name: 'element', description: '当前正在处理的元素' },
      { name: 'index', description: '当前正在处理的元素的索引' },
      { name: 'array', description: '调用了 find 的数组' }
    ],
    returnValue: '数组中第一个满足所提供测试函数的元素的值，否则返回 undefined',
    examples: [
      {
        title: '查找第一个偶数',
        code: 'const numbers = [1, 3, 4, 5, 6];\nconst firstEven = numbers.find(x => x % 2 === 0);',
        output: '4'
      },
      {
        title: '查找指定用户',
        code: 'const users = [{id: 1, name: "Alice"}, {id: 2, name: "Bob"}];\nconst user = users.find(u => u.id === 2);',
        output: '{id: 2, name: "Bob"}'
      }
    ]
  },
  {
    id: 'array-foreach',
    category: 'array',
    name: 'forEach()',
    type: '遍历',
    description: '对数组的每个元素执行一次给定的函数',
    syntax: 'array.forEach(callback(element, index, array))',
    detailedDescription: 'forEach() 方法对数组的每个元素执行一次给定的函数。',
    parameters: [
      { name: 'callback', description: '为数组中每个元素执行的函数' },
      { name: 'element', description: '当前正在处理的元素' },
      { name: 'index', description: '当前正在处理的元素的索引' },
      { name: 'array', description: 'forEach() 方法正在操作的数组' }
    ],
    returnValue: 'undefined',
    examples: [
      {
        title: '打印数组元素',
        code: 'const fruits = ["apple", "banana", "orange"];\nfruits.forEach(fruit => console.log(fruit));',
        output: 'apple\nbanana\norange'
      },
      {
        title: '修改数组元素',
        code: 'const numbers = [1, 2, 3];\nnumbers.forEach((num, index, arr) => {\n  arr[index] = num * 2;\n});',
        output: '[2, 4, 6]'
      }
    ]
  },

  // 字符串方法
  {
    id: 'string-slice',
    category: 'string',
    name: 'slice()',
    type: '截取',
    description: '提取字符串的一部分，并返回一个新的字符串',
    syntax: 'string.slice(beginIndex, endIndex)',
    detailedDescription: 'slice() 方法提取某个字符串的一部分，并返回一个新的字符串，且不会改动原字符串。',
    parameters: [
      { name: 'beginIndex', description: '从该索引（以 0 为基数）处开始提取原字符串中的字符' },
      { name: 'endIndex', description: '在该索引（以 0 为基数）处结束提取字符串（不包括该索引）' }
    ],
    returnValue: '返回一个从原字符串中提取出来的新字符串',
    examples: [
      {
        title: '基本截取',
        code: 'const str = "Hello World";\nconst result = str.slice(0, 5);',
        output: '"Hello"'
      },
      {
        title: '负数索引',
        code: 'const str = "Hello World";\nconst result = str.slice(-5);',
        output: '"World"'
      }
    ]
  },
  {
    id: 'string-split',
    category: 'string',
    name: 'split()',
    type: '分割',
    description: '使用指定的分隔符字符串将一个String对象分割成子字符串数组',
    syntax: 'string.split(separator, limit)',
    detailedDescription: 'split() 方法使用指定的分隔符字符串将一个String对象分割成子字符串数组，以一个指定的分割字串来决定每个拆分的位置。',
    parameters: [
      { name: 'separator', description: '指定表示每个拆分应发生的点的字符串' },
      { name: 'limit', description: '一个整数，限定返回的分割片段数量' }
    ],
    returnValue: '返回源字符串以分隔符出现位置分隔而成的一个Array',
    examples: [
      {
        title: '按空格分割',
        code: 'const str = "Hello World JavaScript";\nconst words = str.split(" ");',
        output: '["Hello", "World", "JavaScript"]'
      },
      {
        title: '按逗号分割并限制数量',
        code: 'const str = "apple,banana,orange,grape";\nconst fruits = str.split(",", 2);',
        output: '["apple", "banana"]'
      }
    ]
  },
  {
    id: 'string-replace',
    category: 'string',
    name: 'replace()',
    type: '替换',
    description: '返回一个由替换值替换部分或所有的模式匹配项后的新字符串',
    syntax: 'string.replace(searchValue, replaceValue)',
    detailedDescription: 'replace() 方法返回一个由替换值（replacement）替换部分或所有的模式（pattern）匹配项后的新字符串。模式可以是一个字符串或者一个正则表达式。',
    parameters: [
      { name: 'searchValue', description: '被替换的字符串或正则表达式' },
      { name: 'replaceValue', description: '用于替换的字符串或函数' }
    ],
    returnValue: '一个部分或全部匹配由替代模式所取代的新的字符串',
    examples: [
      {
        title: '简单替换',
        code: 'const str = "Hello World";\nconst newStr = str.replace("World", "JavaScript");',
        output: '"Hello JavaScript"'
      },
      {
        title: '正则表达式替换',
        code: 'const str = "Hello World World";\nconst newStr = str.replace(/World/g, "JS");',
        output: '"Hello JS JS"'
      }
    ]
  },
  {
    id: 'string-trim',
    category: 'string',
    name: 'trim()',
    type: '清理',
    description: '从字符串的两端清除空格，返回一个新的字符串',
    syntax: 'string.trim()',
    detailedDescription: 'trim() 方法会从一个字符串的两端删除空白字符。在这个上下文中的空白字符是所有的空白字符 (space, tab, no-break space 等) 以及所有行终止符字符（如 LF，CR等）。',
    parameters: [],
    returnValue: '一个代表调用字符串两端去掉空白的新字符串',
    examples: [
      {
        title: '去除首尾空格',
        code: 'const str = "  Hello World  ";\nconst trimmed = str.trim();',
        output: '"Hello World"'
      },
      {
        title: '去除换行符',
        code: 'const str = "\\n\\tHello World\\n\\t";\nconst trimmed = str.trim();',
        output: '"Hello World"'
      }
    ]
  },
  {
    id: 'string-includes',
    category: 'string',
    name: 'includes()',
    type: '查找',
    description: '判断一个字符串是否包含在另一个字符串中，返回true或false',
    syntax: 'string.includes(searchString, position)',
    detailedDescription: 'includes() 方法用于判断一个字符串是否包含在另一个字符串中，根据情况返回 true 或 false。',
    parameters: [
      { name: 'searchString', description: '要在此字符串中搜索的字符串' },
      { name: 'position', description: '从当前字符串的哪个索引位置开始搜寻子字符串，默认值为 0' }
    ],
    returnValue: '如果当前字符串包含被搜寻的字符串，就返回 true；否则返回 false',
    examples: [
      {
        title: '基本包含检查',
        code: 'const str = "Hello World";\nconst hasWorld = str.includes("World");',
        output: 'true'
      },
      {
        title: '指定起始位置',
        code: 'const str = "Hello World";\nconst hasHello = str.includes("Hello", 1);',
        output: 'false'
      }
    ]
  },

  // 场景应用 - 新增更多实用案例
  {
    id: 'scenario-array-operations',
    category: 'scenarios',
    name: '数组操作的多种实现方法',
    type: '数据结构',
    description: '掌握数组操作的各种实现方式，选择最适合的解决方案',
    scenario: '在实际开发中，同一个数组操作需求往往有多种实现方式，了解它们的优缺点有助于写出更高效的代码。',
    bestPractice: '根据数据量大小、性能要求、可读性需求选择合适的实现方式，优先考虑原生方法的性能和可维护性。',
    detailedDescription: '数组是JavaScript中最常用的数据结构之一。不同的操作方法在性能、内存使用、代码可读性方面各有特点。',
    useCases: [
      '数组合并的多种方式',
      '数组去重的不同实现',
      '数组扁平化处理',
      '数组分组和聚合操作',
      '数组排序的优化方案'
    ],
    examples: [
      {
        title: '数组合并的五种方法',
        description: '比较不同数组合并方式的性能和适用场景',
        code: `const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const arr3 = [7, 8, 9];

// 方法1: 扩展运算符（推荐，简洁易读）
const merged1 = [...arr1, ...arr2, ...arr3];

// 方法2: concat方法（传统方式，性能稳定）
const merged2 = arr1.concat(arr2, arr3);

// 方法3: push.apply（适合大数组，修改原数组）
const merged3 = [...arr1];
merged3.push(...arr2, ...arr3);

// 方法4: Array.from + 生成器（内存友好）
function* mergeArrays(...arrays) {
  for (const array of arrays) {
    yield* array;
  }
}
const merged4 = Array.from(mergeArrays(arr1, arr2, arr3));

// 方法5: reduce方法（函数式编程风格）
const merged5 = [arr1, arr2, arr3].reduce((acc, curr) => acc.concat(curr), []);

console.log('所有方法结果相同:', 
  JSON.stringify(merged1) === JSON.stringify(merged2) &&
  JSON.stringify(merged2) === JSON.stringify(merged3) &&
  JSON.stringify(merged3) === JSON.stringify(merged4) &&
  JSON.stringify(merged4) === JSON.stringify(merged5)
);`,
        output: `所有方法结果相同: true
// merged1-5 都等于 [1, 2, 3, 4, 5, 6, 7, 8, 9]`
      },
      {
        title: '数组去重的六种实现',
        description: '不同去重方法的性能对比和适用场景',
        code: `const duplicateArray = [1, 2, 2, 3, 4, 4, 5, 1, 3];

// 方法1: Set + 扩展运算符（最简洁，适合基本类型）
const unique1 = [...new Set(duplicateArray)];

// 方法2: filter + indexOf（传统方式，兼容性好）
const unique2 = duplicateArray.filter((item, index) => 
  duplicateArray.indexOf(item) === index
);

// 方法3: reduce方法（函数式编程）
const unique3 = duplicateArray.reduce((acc, current) => {
  return acc.includes(current) ? acc : [...acc, current];
}, []);

// 方法4: Map记录（高性能，适合大数组）
const unique4 = (() => {
  const seen = new Map();
  return duplicateArray.filter(item => {
    if (seen.has(item)) return false;
    seen.set(item, true);
    return true;
  });
})();

// 方法5: 对象属性去重（适合字符串/数字）
const unique5 = (() => {
  const obj = {};
  return duplicateArray.filter(item => {
    if (obj[item]) return false;
    obj[item] = true;
    return true;
  });
})();

// 方法6: 双重循环（最基础的实现）
const unique6 = [];
for (let i = 0; i < duplicateArray.length; i++) {
  let isDuplicate = false;
  for (let j = 0; j < unique6.length; j++) {
    if (duplicateArray[i] === unique6[j]) {
      isDuplicate = true;
      break;
    }
  }
  if (!isDuplicate) {
    unique6.push(duplicateArray[i]);
  }
}

console.log('Set方法:', unique1);
console.log('filter方法:', unique2);
console.log('reduce方法:', unique3);`,
        output: `Set方法: [1, 2, 3, 4, 5]
filter方法: [1, 2, 3, 4, 5]
reduce方法: [1, 2, 3, 4, 5]`
      },
      {
        title: '数组扁平化的多种实现',
        description: '处理嵌套数组的不同策略和深度控制',
        code: `const nestedArray = [1, [2, 3], [4, [5, 6]], [[7, 8], 9]];

// 方法1: flat方法（ES2019，简单直接）
const flattened1 = nestedArray.flat(Infinity);

// 方法2: 递归实现（自定义深度控制）
function flattenRecursive(arr, depth = Infinity) {
  return depth > 0 ? arr.reduce((acc, val) => 
    acc.concat(Array.isArray(val) ? flattenRecursive(val, depth - 1) : val), []
  ) : arr.slice();
}
const flattened2 = flattenRecursive(nestedArray);

// 方法3: 栈实现（迭代方式，避免递归栈溢出）
function flattenStack(arr) {
  const stack = [...arr];
  const result = [];
  
  while (stack.length > 0) {
    const next = stack.pop();
    if (Array.isArray(next)) {
      stack.push(...next);
    } else {
      result.push(next);
    }
  }
  
  return result.reverse();
}
const flattened3 = flattenStack(nestedArray);

// 方法4: toString + split（仅适用于数字数组）
const flattened4 = nestedArray.toString().split(',').map(Number);

// 方法5: JSON方法（通用但性能较低）
function flattenJSON(arr) {
  return JSON.parse('[' + JSON.stringify(arr).replace(/\[|\]/g, '') + ']');
}
const flattened5 = flattenJSON(nestedArray);

console.log('原数组:', nestedArray);
console.log('flat方法:', flattened1);
console.log('递归方法:', flattened2);
console.log('栈方法:', flattened3);`,
        output: `原数组: [1, [2, 3], [4, [5, 6]], [[7, 8], 9]]
flat方法: [1, 2, 3, 4, 5, 6, 7, 8, 9]
递归方法: [1, 2, 3, 4, 5, 6, 7, 8, 9]
栈方法: [1, 2, 3, 4, 5, 6, 7, 8, 9]`
      }
    ]
  },
  {
    id: 'scenario-performance-optimization',
    category: 'scenarios',
    name: '前端性能优化实战',
    type: '性能优化',
    description: '前端性能优化的实用技巧和最佳实践',
    scenario: '随着应用复杂度增加，性能优化变得越来越重要。从代码层面到架构层面，都有很多优化空间。',
    bestPractice: '采用渐进式优化策略，先解决最影响用户体验的性能瓶颈，然后逐步优化其他方面。',
    detailedDescription: '性能优化是一个系统工程，涉及代码优化、资源优化、网络优化、渲染优化等多个方面。',
    useCases: [
      '大列表虚拟滚动',
      '图片懒加载优化',
      '防抖节流应用',
      '内存泄漏预防',
      '代码分割策略'
    ],
    examples: [
      {
        title: '虚拟滚动实现',
        description: '处理大量数据列表的高性能渲染方案',
        code: `class VirtualScroller {
  constructor(container, itemHeight, totalItems, renderItem) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.totalItems = totalItems;
    this.renderItem = renderItem;
    this.visibleItems = Math.ceil(container.clientHeight / itemHeight) + 2;
    this.startIndex = 0;
    
    this.init();
  }
  
  init() {
    // 创建滚动容器
    this.scrollContainer = document.createElement('div');
    this.scrollContainer.style.height = this.totalItems * this.itemHeight + 'px';
    this.scrollContainer.style.position = 'relative';
    
    // 创建可见项容器
    this.visibleContainer = document.createElement('div');
    this.visibleContainer.style.position = 'absolute';
    this.visibleContainer.style.top = '0px';
    this.visibleContainer.style.width = '100%';
    
    this.scrollContainer.appendChild(this.visibleContainer);
    this.container.appendChild(this.scrollContainer);
    
    // 绑定滚动事件
    this.container.addEventListener('scroll', this.handleScroll.bind(this));
    
    // 初始渲染
    this.render();
  }
  
  handleScroll() {
    const scrollTop = this.container.scrollTop;
    const newStartIndex = Math.floor(scrollTop / this.itemHeight);
    
    if (newStartIndex !== this.startIndex) {
      this.startIndex = newStartIndex;
      this.render();
    }
  }
  
  render() {
    const endIndex = Math.min(this.startIndex + this.visibleItems, this.totalItems);
    
    // 清空容器
    this.visibleContainer.innerHTML = '';
    
    // 设置容器位置
    this.visibleContainer.style.top = this.startIndex * this.itemHeight + 'px';
    
    // 渲染可见项
    for (let i = this.startIndex; i < endIndex; i++) {
      const item = this.renderItem(i);
      item.style.height = this.itemHeight + 'px';
      this.visibleContainer.appendChild(item);
    }
  }
}

// 使用示例
const container = document.getElementById('scroll-container');
const itemHeight = 50;
const totalItems = 10000;

const virtualScroller = new VirtualScroller(
  container,
  itemHeight,
  totalItems,
  (index) => {
    const div = document.createElement('div');
    div.textContent = \`Item \${index + 1}\`;
    div.style.border = '1px solid #ccc';
    div.style.padding = '10px';
    return div;
  }
);`,
        output: `// 创建了一个可以高效渲染10000个项目的虚拟滚动列表
// 只渲染可见区域的项目，大大提升性能`
      },
      {
        title: '防抖节流优化',
        description: '优化高频事件处理，提升用户体验',
        code: `// 防抖函数 - 延迟执行，适用于搜索输入
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// 节流函数 - 限制执行频率，适用于滚动事件
function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// 高级防抖 - 支持立即执行和取消
function advancedDebounce(func, delay, immediate = false) {
  let timeoutId;
  
  const debounced = function (...args) {
    const callNow = immediate && !timeoutId;
    
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      timeoutId = null;
      if (!immediate) func.apply(this, args);
    }, delay);
    
    if (callNow) func.apply(this, args);
  };
  
  debounced.cancel = function () {
    clearTimeout(timeoutId);
    timeoutId = null;
  };
  
  return debounced;
}

// 实际应用示例
class SearchComponent {
  constructor() {
    this.searchInput = document.getElementById('search-input');
    this.resultsContainer = document.getElementById('results');
    
    // 防抖搜索
    this.debouncedSearch = debounce(this.performSearch.bind(this), 300);
    
    // 节流滚动
    this.throttledScroll = throttle(this.handleScroll.bind(this), 100);
    
    this.bindEvents();
  }
  
  bindEvents() {
    this.searchInput.addEventListener('input', this.debouncedSearch);
    window.addEventListener('scroll', this.throttledScroll);
  }
  
  async performSearch(event) {
    const query = event.target.value.trim();
    if (query.length < 2) {
      this.resultsContainer.innerHTML = '';
      return;
    }
    
    try {
      const results = await this.fetchSearchResults(query);
      this.displayResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    }
  }
  
  handleScroll() {
    const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    console.log(\`Scrolled: \${scrollPercent.toFixed(1)}%\`);
  }
  
  async fetchSearchResults(query) {
    // 模拟API调用
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([\`Result for "\${query}" 1\`, \`Result for "\${query}" 2\`]);
      }, 200);
    });
  }
  
  displayResults(results) {
    this.resultsContainer.innerHTML = results
      .map(result => \`<div class="result-item">\${result}</div>\`)
      .join('');
  }
}

// 初始化搜索组件
const searchComponent = new SearchComponent();`,
        output: `// 创建了优化的搜索组件
// 输入防抖避免频繁API调用
// 滚动节流减少性能消耗`
      }
    ]
  },
  {
    id: 'scenario-data-processing',
    category: 'scenarios',
    name: '数据处理与转换',
    type: '数据操作',
    description: '掌握复杂数据结构的处理技巧，提升数据操作效率和代码质量',
    scenario: '在现代Web开发中，我们经常需要处理来自不同数据源的复杂数据：API返回的嵌套对象、CSV文件数据、用户输入的表单数据等。这些数据往往需要清洗、转换、过滤、排序和格式化，才能在前端界面中正确展示或传递给后端服务。',
    bestPractice: '采用函数式编程思想，使用数组方法链式调用保持代码简洁；合理使用解构赋值和扩展运算符；对于大数据量处理考虑性能优化；建立数据验证机制确保数据质量。',
    detailedDescription: '数据处理是前端开发的核心技能。良好的数据处理能力不仅能提升开发效率，还能保证应用的稳定性和用户体验。通过掌握JavaScript的各种数据操作方法，我们可以优雅地处理任何复杂的数据转换需求。',
    useCases: [
      '处理API返回的用户列表数据，包括分页、排序、筛选',
      '转换CSV/Excel数据为前端可用的JSON格式',
      '过滤和排序电商商品信息，支持多条件筛选',
      '统计和分析业务数据，生成图表所需的数据结构',
      '处理表单数据验证和格式化',
      '合并多个数据源的信息'
    ],
    examples: [
      {
        title: '用户数据处理',
        description: '从API获取用户数据，过滤活跃用户并按年龄排序',
        code: `// 原始数据
const users = [
  { id: 1, name: 'Alice', age: 25, active: true, department: 'Engineering' },
  { id: 2, name: 'Bob', age: 30, active: false, department: 'Marketing' },
  { id: 3, name: 'Charlie', age: 22, active: true, department: 'Engineering' },
  { id: 4, name: 'Diana', age: 28, active: true, department: 'Design' }
];

// 处理数据：过滤活跃用户，按年龄排序，提取需要的字段
const processedUsers = users
  .filter(user => user.active)
  .sort((a, b) => a.age - b.age)
  .map(user => ({
    id: user.id,
    name: user.name,
    age: user.age,
    department: user.department
  }));

console.log(processedUsers);`,
        output: `[
  { id: 3, name: 'Charlie', age: 22, department: 'Engineering' },
  { id: 1, name: 'Alice', age: 25, department: 'Engineering' },
  { id: 4, name: 'Diana', age: 28, department: 'Design' }
]`
      },
      {
        title: '销售数据统计',
        description: '统计各部门的销售总额和平均值',
        code: `const salesData = [
  { department: 'Sales', amount: 15000, month: 'Jan' },
  { department: 'Marketing', amount: 8000, month: 'Jan' },
  { department: 'Sales', amount: 18000, month: 'Feb' },
  { department: 'Marketing', amount: 9500, month: 'Feb' }
];

// 按部门分组并统计
const departmentStats = salesData.reduce((acc, sale) => {
  if (!acc[sale.department]) {
    acc[sale.department] = { total: 0, count: 0, amounts: [] };
  }
  acc[sale.department].total += sale.amount;
  acc[sale.department].count += 1;
  acc[sale.department].amounts.push(sale.amount);
  return acc;
}, {});

// 计算平均值
Object.keys(departmentStats).forEach(dept => {
  const stats = departmentStats[dept];
  stats.average = Math.round(stats.total / stats.count);
});

console.log(departmentStats);`,
        output: `{
  Sales: { total: 33000, count: 2, amounts: [15000, 18000], average: 16500 },
  Marketing: { total: 17500, count: 2, amounts: [8000, 9500], average: 8750 }
}`
      }
    ]
  },
  {
    id: 'scenario-form-validation',
    category: 'scenarios',
    name: '表单验证与处理',
    type: '用户交互',
    description: '构建完善的表单验证体系，提升用户体验和数据质量',
    scenario: '表单是用户与应用交互的重要界面，涉及用户注册、登录、订单提交、个人信息修改等核心功能。一个完善的表单验证系统需要处理各种输入场景：必填字段检查、格式验证、长度限制、特殊字符处理、异步验证（如用户名重复检查）、跨字段验证（如密码确认）等。',
    bestPractice: '采用声明式验证规则配置，支持同步和异步验证；提供实时反馈和友好的错误提示；实现防抖优化减少验证频率；支持国际化错误消息；建立验证规则的复用机制。',
    detailedDescription: '现代表单验证不仅要保证数据的正确性，更要注重用户体验。通过合理的验证时机、清晰的错误提示、流畅的交互反馈，可以大大提升用户的使用满意度，同时减少无效数据的提交。',
    useCases: [
      '用户注册表单：邮箱格式、密码强度、用户名唯一性验证',
      '订单信息验证：收货地址、联系方式、商品数量合法性检查',
      '个人资料更新：头像上传、个人信息格式验证',
      '搜索条件验证：关键词长度、特殊字符过滤',
      '支付表单验证：银行卡号、有效期、安全码格式检查',
      '文件上传验证：文件类型、大小、数量限制'
    ],
    examples: [
      {
        title: '用户注册验证',
        description: '完整的用户注册表单验证，包括邮箱、密码、确认密码等',
        code: `// 验证规则定义
const validationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: '请输入有效的邮箱地址'
  },
  password: {
    required: true,
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    message: '密码至少8位，包含大小写字母和数字'
  },
  confirmPassword: {
    required: true,
    match: 'password',
    message: '两次输入的密码不一致'
  },
  username: {
    required: true,
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_]+$/,
    message: '用户名3-20位，只能包含字母、数字和下划线'
  }
};

// 验证函数
function validateForm(formData, rules) {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const value = formData[field];
    const rule = rules[field];
    
    // 必填验证
    if (rule.required && (!value || value.trim() === '')) {
      errors[field] = \`\${field}是必填项\`;
      return;
    }
    
    if (value) {
      // 长度验证
      if (rule.minLength && value.length < rule.minLength) {
        errors[field] = rule.message;
        return;
      }
      
      if (rule.maxLength && value.length > rule.maxLength) {
        errors[field] = rule.message;
        return;
      }
      
      // 格式验证
      if (rule.pattern && !rule.pattern.test(value)) {
        errors[field] = rule.message;
        return;
      }
      
      // 匹配验证
      if (rule.match && value !== formData[rule.match]) {
        errors[field] = rule.message;
        return;
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// 使用示例
const formData = {
  email: 'user@example.com',
  password: 'Password123',
  confirmPassword: 'Password123',
  username: 'john_doe'
};

const result = validateForm(formData, validationRules);
console.log(result);`,
        output: `{
  isValid: true,
  errors: {}
}`
      },
      {
        title: '实时验证实现',
        description: '实现表单字段的实时验证功能',
        code: `class FormValidator {
  constructor(rules) {
    this.rules = rules;
    this.errors = {};
    this.touched = {};
  }
  
  // 验证单个字段
  validateField(fieldName, value, formData = {}) {
    const rule = this.rules[fieldName];
    if (!rule) return null;
    
    // 标记字段已被触摸
    this.touched[fieldName] = true;
    
    // 执行验证
    if (rule.required && (!value || value.trim() === '')) {
      this.errors[fieldName] = \`\${fieldName}是必填项\`;
    } else if (value) {
      if (rule.minLength && value.length < rule.minLength) {
        this.errors[fieldName] = rule.message;
      } else if (rule.pattern && !rule.pattern.test(value)) {
        this.errors[fieldName] = rule.message;
      } else if (rule.match && value !== formData[rule.match]) {
        this.errors[fieldName] = rule.message;
      } else {
        delete this.errors[fieldName];
      }
    } else {
      delete this.errors[fieldName];
    }
    
    return this.errors[fieldName] || null;
  }
  
  // 获取字段错误
  getFieldError(fieldName) {
    return this.touched[fieldName] ? this.errors[fieldName] : null;
  }
  
  // 检查表单是否有效
  isFormValid() {
    return Object.keys(this.errors).length === 0;
  }
}

// 使用示例
const validator = new FormValidator(validationRules);

// 模拟用户输入
validator.validateField('email', 'invalid-email');
console.log('Email error:', validator.getFieldError('email'));

validator.validateField('email', 'user@example.com');
console.log('Email error after correction:', validator.getFieldError('email'));`,
        output: `Email error: 请输入有效的邮箱地址
Email error after correction: null`
      }
    ]
  },
  {
    id: 'scenario-async-operations',
    category: 'scenarios',
    name: '异步操作与错误处理',
    type: '异步编程',
    description: '掌握现代异步编程技巧，构建高性能的异步应用',
    scenario: '现代Web应用高度依赖异步操作：从服务器获取数据、上传文件、处理用户交互、执行后台任务等。这些操作涉及网络请求、文件I/O、定时器、事件处理等多种异步场景。合理的异步编程不仅能提升应用性能，还能改善用户体验，避免界面卡顿。',
    bestPractice: '优先使用async/await语法提高代码可读性；实现完善的错误处理和重试机制；合理使用Promise.all、Promise.allSettled等并发控制；提供加载状态和进度反馈；避免回调地狱和内存泄漏。',
    detailedDescription: '异步编程是现代JavaScript开发的核心技能。从早期的回调函数到Promise，再到async/await，JavaScript的异步编程模式不断演进。掌握这些技术不仅能写出更优雅的代码，还能有效处理复杂的异步流程控制。',
    useCases: [
      'RESTful API数据获取：支持重试、超时、缓存机制',
      '文件上传下载：进度显示、断点续传、批量处理',
      '批量数据处理：并发控制、错误恢复、进度追踪',
      '定时任务执行：轮询、延迟执行、任务调度',
      '实时数据同步：WebSocket连接、心跳检测',
      '图片懒加载：交叉观察器、预加载策略'
    ],
    examples: [
      {
        title: 'API数据获取与错误处理',
        description: '实现带有重试机制和错误处理的API调用',
        code: `// 带重试机制的API调用
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  const { timeout = 5000, ...fetchOptions } = options;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // 创建超时控制
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
      }
      
      return await response.json();
      
    } catch (error) {
      console.log(\`Attempt \${attempt} failed:\`, error.message);
      
      // 如果是最后一次尝试，抛出错误
      if (attempt === maxRetries) {
        throw new Error(\`Failed after \${maxRetries} attempts: \${error.message}\`);
      }
      
      // 等待一段时间后重试（指数退避）
      const delay = Math.pow(2, attempt - 1) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// 使用示例
async function getUserData(userId) {
  try {
    const userData = await fetchWithRetry(\`/api/users/\${userId}\`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer token',
        'Content-Type': 'application/json'
      },
      timeout: 3000
    });
    
    console.log('User data:', userData);
    return userData;
    
  } catch (error) {
    console.error('Failed to fetch user data:', error.message);
    // 返回默认数据或显示错误提示
    return null;
  }
}

// 调用示例
getUserData(123);`,
        output: `// 成功时输出用户数据
// 失败时输出错误信息并返回null`
      },
      {
        title: '并发请求处理',
        description: '同时处理多个异步请求，合理控制并发数量',
        code: `// 并发控制函数
async function concurrentRequests(urls, concurrency = 3) {
  const results = [];
  const executing = [];
  
  for (const [index, url] of urls.entries()) {
    // 创建请求Promise
    const request = fetch(url)
      .then(response => response.json())
      .then(data => ({ index, data, status: 'fulfilled' }))
      .catch(error => ({ index, error: error.message, status: 'rejected' }));
    
    results.push(request);
    
    // 如果达到并发限制，等待一个请求完成
    if (urls.length >= concurrency) {
      executing.push(request);
      
      if (executing.length >= concurrency) {
        await Promise.race(executing);
        executing.splice(executing.findIndex(p => p === request), 1);
      }
    }
  }
  
  // 等待所有请求完成
  return Promise.allSettled(results);
}

// 批量数据处理
async function processBatchData(dataList) {
  const batchSize = 5;
  const results = [];
  
  for (let i = 0; i < dataList.length; i += batchSize) {
    const batch = dataList.slice(i, i + batchSize);
    
    console.log(\`Processing batch \${Math.floor(i / batchSize) + 1}...\`);
    
    const batchPromises = batch.map(async (item, index) => {
      try {
        // 模拟异步处理
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
        return { 
          id: item.id, 
          processed: true, 
          result: \`Processed \${item.name}\` 
        };
      } catch (error) {
        return { 
          id: item.id, 
          processed: false, 
          error: error.message 
        };
      }
    });
    
    const batchResults = await Promise.allSettled(batchPromises);
    results.push(...batchResults.map(r => r.value));
    
    // 批次间添加延迟，避免过载
    if (i + batchSize < dataList.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
}

// 使用示例
const sampleData = [
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
  { id: 3, name: 'Item 3' }
];

processBatchData(sampleData).then(results => {
  console.log('Batch processing completed:', results);
});`,
        output: `Processing batch 1...
Batch processing completed: [
  { id: 1, processed: true, result: 'Processed Item 1' },
  { id: 2, processed: true, result: 'Processed Item 2' },
  { id: 3, processed: true, result: 'Processed Item 3' }
]`
      }
    ]
  },
  {
    id: 'scenario-performance-optimization',
    category: 'scenarios',
    name: '性能优化技巧',
    type: '性能优化',
    description: '掌握JavaScript性能优化核心技术，打造高性能Web应用',
    scenario: '现代Web应用面临着复杂的性能挑战：大量数据渲染、频繁的用户交互、复杂的业务逻辑、移动设备性能限制等。性能问题会直接影响用户体验，导致页面卡顿、响应缓慢、内存泄漏等问题。系统性的性能优化需要从代码执行、内存管理、网络传输、渲染优化等多个维度进行。',
    bestPractice: '实施防抖节流优化高频事件；使用虚拟滚动处理大数据集；实现智能缓存策略减少重复计算；采用懒加载技术优化资源加载；合理使用Web Workers处理计算密集任务；优化DOM操作减少重排重绘。',
    detailedDescription: '性能优化是前端开发的高级技能，需要深入理解JavaScript引擎工作原理、浏览器渲染机制、内存管理策略等。通过科学的性能分析和针对性的优化措施，可以显著提升应用的响应速度和用户体验。',
    useCases: [
      '搜索框防抖处理：避免频繁API调用，提升搜索体验',
      '滚动事件优化：节流处理滚动监听，防止页面卡顿',
      '大数据列表渲染：虚拟滚动技术，支持万级数据展示',
      '图片懒加载：交叉观察器实现，优化页面加载速度',
      '计算密集任务：Web Workers并行处理，避免主线程阻塞',
      '内存泄漏防护：事件监听器清理，避免内存持续增长'
    ],
    examples: [
      {
        title: '防抖与节流实现',
        description: '实现防抖和节流函数，优化高频事件处理',
        code: `// 防抖函数 - 延迟执行，只执行最后一次
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// 节流函数 - 限制执行频率
function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// 搜索框防抖示例
const searchInput = document.getElementById('search');
const debouncedSearch = debounce(async (query) => {
  if (query.length < 2) return;
  
  console.log('Searching for:', query);
  try {
    const results = await fetch(\`/api/search?q=\${encodeURIComponent(query)}\`);
    const data = await results.json();
    displaySearchResults(data);
  } catch (error) {
    console.error('Search failed:', error);
  }
}, 300);

// 滚动节流示例
const throttledScroll = throttle(() => {
  const scrollTop = window.pageYOffset;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;
  
  // 检查是否接近底部
  if (scrollTop + windowHeight >= documentHeight - 100) {
    loadMoreContent();
  }
  
  // 更新滚动进度
  const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;
  updateScrollProgress(scrollPercent);
}, 100);

// 绑定事件
searchInput.addEventListener('input', (e) => debouncedSearch(e.target.value));
window.addEventListener('scroll', throttledScroll);

function displaySearchResults(data) {
  console.log('Search results:', data);
}

function loadMoreContent() {
  console.log('Loading more content...');
}

function updateScrollProgress(percent) {
  console.log('Scroll progress:', percent + '%');
}`,
        output: `// 用户输入时会延迟300ms执行搜索
// 滚动时会限制为每100ms最多执行一次`
      },
      {
        title: '内存优化与缓存策略',
        description: '实现LRU缓存和内存优化技巧',
        code: `// LRU (Least Recently Used) 缓存实现
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }
  
  get(key) {
    if (this.cache.has(key)) {
      // 移动到最新位置
      const value = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return null;
  }
  
  set(key, value) {
    if (this.cache.has(key)) {
      // 更新现有键
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // 删除最久未使用的项
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, value);
  }
  
  clear() {
    this.cache.clear();
  }
  
  size() {
    return this.cache.size;
  }
}

// 带过期时间的缓存
class TimedCache {
  constructor(defaultTTL = 300000) { // 默认5分钟
    this.cache = new Map();
    this.timers = new Map();
    this.defaultTTL = defaultTTL;
  }
  
  set(key, value, ttl = this.defaultTTL) {
    // 清除旧的定时器
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }
    
    // 设置值
    this.cache.set(key, value);
    
    // 设置过期定时器
    const timer = setTimeout(() => {
      this.cache.delete(key);
      this.timers.delete(key);
    }, ttl);
    
    this.timers.set(key, timer);
  }
  
  get(key) {
    return this.cache.get(key);
  }
  
  has(key) {
    return this.cache.has(key);
  }
  
  delete(key) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    return this.cache.delete(key);
  }
  
  clear() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.cache.clear();
    this.timers.clear();
  }
}

// 使用示例
const apiCache = new LRUCache(50);
const timedCache = new TimedCache(60000); // 1分钟过期

// API请求缓存装饰器
function withCache(cache, keyGenerator) {
  return function (target, propertyName, descriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args) {
      const cacheKey = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
      
      // 检查缓存
      const cached = cache.get(cacheKey);
      if (cached) {
        console.log('Cache hit for:', cacheKey);
        return cached;
      }
      
      // 执行原方法
      console.log('Cache miss for:', cacheKey);
      const result = await method.apply(this, args);
      
      // 缓存结果
      cache.set(cacheKey, result);
      return result;
    };
  };
}

// 使用缓存的API类
class ApiService {
  @withCache(apiCache, (userId) => \`user-\${userId}\`)
  async getUser(userId) {
    const response = await fetch(\`/api/users/\${userId}\`);
    return response.json();
  }
}

const api = new ApiService();
// 第一次调用会发起请求，第二次调用会使用缓存
api.getUser(123).then(user => console.log('First call:', user));
api.getUser(123).then(user => console.log('Second call (cached):', user));`,
        output: `Cache miss for: user-123
First call: { id: 123, name: 'John' }
Cache hit for: user-123
Second call (cached): { id: 123, name: 'John' }`
      }
    ]
  }
])

// 计算属性：当前分类的方法
const currentMethods = computed(() => {
  return methods.value.filter(method => method.category === activeCategory.value)
})

// 打开弹窗
const openModal = (method) => {
  selectedMethod.value = method
  showModal.value = true
  toolsStore.addToolHistory('常用代码')
}

// 关闭弹窗
const closeModal = () => {
  showModal.value = false
  selectedMethod.value = {}
}
</script>

<style scoped>
.code-snippets-container {
  width: 100%;
  margin: 0 auto;
  padding: 20px 40px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  min-height: 100vh;
  overflow-y: auto;
  background-color: #f8f9fa;
}

/* 返回按钮样式 */
.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.tool-header {
  margin-bottom: 30px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.header-left {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
}

.title-section {
  flex: 1;
  text-align: center;
}

.header-actions {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
}

.mdn-link-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.mdn-link-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  text-decoration: none;
  color: white;
}

.mdn-icon {
  width: 20px;
  height: 20px;
  stroke-width: 2;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .title-section {
    text-align: center;
  }
}

.tool-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 10px;
}

.tool-description {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin: 0;
}

/* 分类标签 */
.category-tabs {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 30px;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: 2px solid #e1e8ed;
  border-radius: 25px;
  background: white;
  color: #657786;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-button:hover {
  border-color: #3498db;
  color: #3498db;
  transform: translateY(-2px);
}

.tab-button.active {
  border-color: #3498db;
  background: #3498db;
  color: white;
}

.category-icon {
  font-size: 1.2rem;
  margin-bottom: 0;
}

/* 方法卡片网格 */
.methods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
  max-width: none;
}

.method-card {
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.method-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: #3498db;
}

.method-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.method-name {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.method-type {
  background: #3498db;
  color: white;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
}

.method-description {
  color: #7f8c8d;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 15px;
}

.method-syntax {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 10px;
}

.method-syntax code {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
  color: #e74c3c;
  background: none;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  overflow-y: auto;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 900px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  margin: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid #e1e8ed;
  background: #f8f9fa;
  border-radius: 12px 12px 0 0;
}

.modal-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  font-size: 2rem;
  color: #7f8c8d;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: #e74c3c;
  color: white;
}

.modal-body {
  padding: 30px;
}

.info-section {
  margin-bottom: 25px;
}

.info-section h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 10px;
  border-bottom: 2px solid #3498db;
  padding-bottom: 5px;
}

.info-section p {
  color: #555;
  line-height: 1.6;
  margin-bottom: 10px;
}

.syntax-block {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 15px;
  margin: 10px 0;
}

.syntax-block code {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 1rem;
  color: #e74c3c;
  background: none;
}

.parameters-list {
  list-style: none;
  padding: 0;
}

.parameters-list li {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 10px 15px;
  margin-bottom: 8px;
  color: #555;
}

.parameters-list strong {
  color: #2c3e50;
}

.examples {
  margin-top: 15px;
}

.example-block {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 15px;
}

.example-block h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 10px;
}

.code-block {
  background: #2c3e50;
  border-radius: 6px;
  padding: 15px;
  margin: 10px 0;
  overflow-x: auto;
}

.code-block pre {
  margin: 0;
  color: #ecf0f1;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
  line-height: 1.4;
}

.output-block {
  background: #e8f5e8;
  border: 1px solid #c3e6c3;
  border-radius: 6px;
  padding: 10px 15px;
  margin-top: 10px;
}

.output-block code {
  background: none;
  color: #27ae60;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
}

/* 场景应用特殊样式 */
.scenario-info {
  padding: 0;
}

.scenario-description {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 15px;
  font-weight: 500;
  line-height: 1.6;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.best-practice {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: #ffffff;
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 15px;
  font-weight: 500;
  line-height: 1.6;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.use-cases-list {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
}

.use-cases-list li {
  background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);
  border: 1px solid #feb2b2;
  border-radius: 8px;
  padding: 14px 18px;
  color: #2d3748;
  font-weight: 500;
  position: relative;
  padding-left: 40px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.use-cases-list li:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.use-cases-list li::before {
  content: '🎯';
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
}

.scenario-info .example-block {
  border-left: 4px solid #3498db;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 6px;
  overflow: hidden;
}

.scenario-info .example-block h4 {
  color: #2c3e50;
  font-size: 1.2rem;
  margin-bottom: 8px;
  font-weight: 600;
}

.example-description {
  color: #4a5568;
  font-style: italic;
  margin-bottom: 15px;
  padding: 12px 15px;
  background: rgba(52, 152, 219, 0.08);
  border-radius: 6px;
  border-left: 3px solid #3498db;
  font-weight: 500;
  line-height: 1.5;
}
</style>