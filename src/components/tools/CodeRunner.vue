<template>
  <div class="code-runner">
    <div class="header">
      <h1>⚡ JavaScript 代码运行器</h1>
      <p>类似 CodePen 的极简代码编辑和预览工具</p>
    </div>

    <!-- 控制按钮 -->
    <div class="controls">
      <button @click="goHome" class="btn-home">🏠 返回主页</button>
      <button @click="runCode" :disabled="isRunning" class="btn-primary">
        {{ isRunning ? '运行中...' : '▶ 运行代码' }}
      </button>
      <button @click="toggleDebugMode" :class="['btn-secondary', { 'btn-debug-active': debugMode }]">
        {{ debugMode ? '🐛 调试模式' : '🔧 普通模式' }}
      </button>
      <button @click="stepNext" v-if="debugMode && isPaused" class="btn-debug">
        ⏭下一步
      </button>
      <button @click="clearAll" class="btn-secondary">🗑 清空所有</button>
      <button @click="copyCode" class="btn-secondary">📋 复制代码</button>
      <button @click="loadExample" class="btn-secondary">📝 示例代码</button>
      <label class="auto-run">
        <input type="checkbox" v-model="autoRun" />
        自动运行
      </label>
    </div>

    <!-- 调试模式下的主要内容区域 -->
    <div v-if="debugMode" class="debug-layout">
      <!-- 左侧：JavaScript 编辑器 -->
      <div class="debug-left">
        <div class="editor-panel">
          <div class="editor-header">
            <span class="editor-title">JavaScript</span>
          </div>
          <textarea
            v-model="jsCode"
            @input="onCodeChange"
            placeholder="输入 JavaScript 代码..."
            class="code-editor"
            spellcheck="false"
          ></textarea>
        </div>
      </div>

      <!-- 右侧：调试信息和控制台 -->
      <div class="debug-right">
        <!-- 调试面板 -->
        <div class="debug-panel">
          <div class="debug-header">
            <span class="debug-title">调试信息</span>
          </div>
          <div class="debug-content">
            <!-- 执行状态 -->
            <div class="debug-section">
              <h4>执行状态</h4>
              <div class="execution-status">
                <span :class="['status-indicator', executionState]">
                  {{ executionState === 'running' ? '运行中' : executionState === 'paused' ? '已暂停' : '已停止' }}
                </span>
              </div>
            </div>

            <!-- 任务队列 -->
            <div class="debug-section">
              <h4>任务队列</h4>
              <div class="task-queues">
                <div class="queue-section">
                  <h5>宏任务队列</h5>
                  <div class="task-list">
                    <div v-for="(task, index) in macroTasks" :key="index" class="task-item macro-task">
                      {{ task.name }}
                    </div>
                    <div v-if="macroTasks.length === 0" class="empty-queue">空</div>
                  </div>
                </div>
                
                <div class="queue-section">
                  <h5>微任务队列</h5>
                  <div class="task-list">
                    <div v-for="(task, index) in microTasks" :key="index" class="task-item micro-task">
                      {{ task.name }}
                    </div>
                    <div v-if="microTasks.length === 0" class="empty-queue">空</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 调用栈 -->
            <div class="debug-section">
              <h4>调用栈</h4>
              <div class="call-stack">
                <div v-for="(call, index) in callStack" :key="index" class="stack-item">
                  {{ call.function }} (第{{ call.line }}行)
                </div>
                <div v-if="callStack.length === 0" class="empty-stack">空</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 控制台区域 -->
        <div class="console-panel">
          <div class="console-header">
            <span class="console-title">控制台</span>
            <button @click="clearConsole" class="clear-console">清空</button>
          </div>
          <div class="console-output">
            <div
              v-for="(log, index) in consoleOutput"
              :key="index"
              :class="['console-line', `console-${log.level}`]"
            >
              <span class="console-timestamp">{{ log.timestamp }}</span>
              <span class="console-message">{{ log.message }}</span>
            </div>
            <div v-if="consoleOutput.length === 0" class="console-empty">
              控制台输出将显示在这里...
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 普通模式下的布局 -->
    <div v-else>
      <!-- 代码编辑区域 -->
      <div class="editor-container">
        <!-- HTML 编辑器 -->
        <div class="editor-panel">
          <div class="editor-header">
            <span class="editor-title">HTML</span>
          </div>
          <textarea
            v-model="htmlCode"
            @input="onCodeChange"
            placeholder="输入 HTML 代码..."
            class="code-editor"
            spellcheck="false"
          ></textarea>
        </div>

        <!-- CSS 编辑器 -->
        <div class="editor-panel">
          <div class="editor-header">
            <span class="editor-title">CSS</span>
          </div>
          <textarea
            v-model="cssCode"
            @input="onCodeChange"
            placeholder="输入 CSS 样式..."
            class="code-editor"
            spellcheck="false"
          ></textarea>
        </div>

        <!-- JavaScript 编辑器 -->
        <div class="editor-panel">
          <div class="editor-header">
            <span class="editor-title">JavaScript</span>
          </div>
          <textarea
            v-model="jsCode"
            @input="onCodeChange"
            placeholder="输入 JavaScript 代码..."
            class="code-editor"
            spellcheck="false"
          ></textarea>
        </div>
      </div>

      <!-- 预览和控制台区域 -->
      <div class="preview-container">
        <!-- 预览区域 -->
        <div class="preview-panel">
          <div class="preview-header">
            <span class="preview-title">预览</span>
          </div>
          <iframe
            ref="previewFrame"
            class="preview-iframe"
            sandbox="allow-scripts allow-same-origin"
          ></iframe>
        </div>

        <!-- 控制台区域 -->
        <div class="console-panel">
          <div class="console-header">
            <span class="console-title">控制台</span>
            <button @click="clearConsole" class="clear-console">清空</button>
          </div>
          <div class="console-output">
            <div
              v-for="(log, index) in consoleOutput"
              :key="index"
              :class="['console-line', `console-${log.level}`]"
            >
              <span class="console-timestamp">{{ log.timestamp }}</span>
              <span class="console-message">{{ log.message }}</span>
            </div>
            <div v-if="consoleOutput.length === 0" class="console-empty">
              控制台输出将显示在这里...
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// 响应式数据
const htmlCode = ref('')
const cssCode = ref('')
const jsCode = ref('')
const consoleOutput = ref([])
const isRunning = ref(false)
const autoRun = ref(false)
const previewFrame = ref(null)

// 调试相关状态
const debugMode = ref(false)
const isPaused = ref(false)
const executionState = ref('stopped') // 'running', 'paused', 'stopped'
const macroTasks = ref([])
const microTasks = ref([])
const callStack = ref([])
const currentStep = ref(0)
const debugSteps = ref([])

let runTimeout = null

// 示例代码
const exampleCode = {
  html: `<div class="container">
  <h1 id="title">Hello World!</h1>
  <button onclick="changeColor()">改变颜色</button>
  <p id="counter">点击次数: 0</p>
</div>`,
  css: `.container {
  text-align: center;
  padding: 20px;
  font-family: Arial, sans-serif;
}

#title {
  color: #333;
  transition: color 0.3s ease;
}

button {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin: 10px;
}

button:hover {
  background: #0056b3;
}`,
  js: `let clickCount = 0;

function changeColor() {
  clickCount++;
  const title = document.getElementById('title');
  const counter = document.getElementById('counter');
  
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  
  title.style.color = randomColor;
  counter.textContent = \`点击次数: \${clickCount}\`;
  
  console.log(\`颜色已改变为: \${randomColor}\`);
}`
}

// 切换调试模式
const toggleDebugMode = () => {
  debugMode.value = !debugMode.value
  if (!debugMode.value) {
    // 退出调试模式时重置状态
    isPaused.value = false
    executionState.value = 'stopped'
    macroTasks.value = []
    microTasks.value = []
    callStack.value = []
    currentStep.value = 0
    debugSteps.value = []
  }
}

// 步进执行
const stepNext = () => {
  if (debugMode.value && isPaused.value && currentStep.value < debugSteps.value.length) {
    executeDebugStep(debugSteps.value[currentStep.value])
    currentStep.value++
    
    if (currentStep.value >= debugSteps.value.length) {
      executionState.value = 'stopped'
      isPaused.value = false
      
      // 所有步骤完成后，执行完整代码并显示最终结果
      executeCompleteCode()
    }
  }
}

// 执行完整代码并显示最终结果
const executeCompleteCode = async () => {
  try {
    consoleOutput.value.push({
      level: 'info',
      message: '开始执行完整代码...',
      timestamp: new Date().toLocaleTimeString()
    })
    
    const sandbox = createCodeSandbox()
    const result = sandbox.execute(jsCode.value)
    
    // 检查是否有异步操作
    const hasAsyncOperations = jsCode.value.includes('setTimeout') || 
                              jsCode.value.includes('setInterval') || 
                              jsCode.value.includes('Promise') ||
                              jsCode.value.includes('async') ||
                              jsCode.value.includes('await')
    
    if (hasAsyncOperations) {
      consoleOutput.value.push({
        level: 'info',
        message: '检测到异步操作，请查看上方按时间顺序的输出内容',
        timestamp: new Date().toLocaleTimeString()
      })
      
      // 等待一段时间让异步操作完成
      setTimeout(() => {
        consoleOutput.value.push({
          level: 'result',
          message: '异步操作执行完成，最终结果以上方输出为准',
          timestamp: new Date().toLocaleTimeString()
        })
      }, 1000)
    } else {
      // 对于同步代码，显示返回值（如果有的话）
      if (result !== undefined) {
        consoleOutput.value.push({
          level: 'result',
          message: `执行结果: ${typeof result === 'object' ? JSON.stringify(result) : result}`,
          timestamp: new Date().toLocaleTimeString()
        })
      } else {
        consoleOutput.value.push({
          level: 'result',
          message: '代码执行完成，请查看上方的输出内容',
          timestamp: new Date().toLocaleTimeString()
        })
      }
    }
    
  } catch (error) {
    consoleOutput.value.push({
      level: 'error',
      message: `执行错误: ${error.message}`,
      timestamp: new Date().toLocaleTimeString()
    })
  }
}

// 创建代码沙盒环境
const createCodeSandbox = () => {
  return {
    execute: (code) => {
      // 重写console方法以捕获输出
      const originalConsole = {
        log: console.log,
        error: console.error,
        warn: console.warn
      }
      
      // 临时重写console方法
      console.log = (...args) => {
        consoleOutput.value.push({
          level: 'log',
          message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '),
          timestamp: new Date().toLocaleTimeString()
        })
      }
      
      console.error = (...args) => {
        consoleOutput.value.push({
          level: 'error',
          message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '),
          timestamp: new Date().toLocaleTimeString()
        })
      }
      
      console.warn = (...args) => {
        consoleOutput.value.push({
          level: 'warn',
          message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '),
          timestamp: new Date().toLocaleTimeString()
        })
      }
      
      // 重写setTimeout以支持异步输出捕获
      const originalSetTimeout = window.setTimeout
      window.setTimeout = (callback, delay, ...args) => {
        return originalSetTimeout(() => {
          // 在异步回调中也要重写console方法
          const asyncOriginalConsole = {
            log: console.log,
            error: console.error,
            warn: console.warn
          }
          
          console.log = (...args) => {
            consoleOutput.value.push({
              level: 'async-log',
              message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '),
              timestamp: new Date().toLocaleTimeString()
            })
          }
          
          console.error = (...args) => {
            consoleOutput.value.push({
              level: 'async-error',
              message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '),
              timestamp: new Date().toLocaleTimeString()
            })
          }
          
          console.warn = (...args) => {
            consoleOutput.value.push({
              level: 'async-warn',
              message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '),
              timestamp: new Date().toLocaleTimeString()
            })
          }
          
          try {
            callback(...args)
          } finally {
            // 恢复console方法
            console.log = asyncOriginalConsole.log
            console.error = asyncOriginalConsole.error
            console.warn = asyncOriginalConsole.warn
          }
        }, delay)
      }
      
      let result
      try {
        // 检查代码是否包含函数定义或多行语句
        if (code.includes('function ') || code.includes('\n') || code.includes(';')) {
          // 对于包含函数定义或多行代码，使用eval执行
          result = eval(code)
        } else {
          // 对于简单表达式，使用Function构造器
          const func = new Function('return ' + code)
          result = func()
        }
      } catch (error) {
        // 如果Function构造器失败，尝试直接eval
        try {
          result = eval(code)
        } catch (evalError) {
          throw evalError
        }
      } finally {
        // 恢复原始console方法（但不恢复setTimeout，让异步操作继续工作）
        console.log = originalConsole.log
        console.error = originalConsole.error
        console.warn = originalConsole.warn
      }
      
      return result
    }
  }
}

// 执行调试步骤
const executeDebugStep = (step) => {
  // 显示步骤信息
  consoleOutput.value.push({
    level: 'debug',
    message: `[步骤 ${currentStep.value + 1}] ${step.description}`,
    timestamp: new Date().toLocaleTimeString()
  })
  
  // 如果是实际的代码行，尝试执行它
  if (step.type === 'statement' && step.code) {
    try {
      const sandbox = createCodeSandbox()
      const result = sandbox.execute(step.code)
      
      if (result !== undefined) {
        consoleOutput.value.push({
          level: 'step-result',
          message: `  → 结果: ${typeof result === 'object' ? JSON.stringify(result) : result}`,
          timestamp: new Date().toLocaleTimeString()
        })
      }
    } catch (error) {
      consoleOutput.value.push({
        level: 'step-error',
        message: `  → 错误: ${error.message}`,
        timestamp: new Date().toLocaleTimeString()
      })
    }
  }
  
  // 更新任务队列和调用栈
  updateDebugInfo(step)
}

// 更新调试信息
const updateDebugInfo = (step) => {
  if (step.type === 'macro-task') {
    macroTasks.value.push({ name: step.name })
  } else if (step.type === 'micro-task') {
    microTasks.value.push({ name: step.name })
  } else if (step.type === 'function-call') {
    callStack.value.push({ function: step.name, line: step.line })
  } else if (step.type === 'function-return') {
    callStack.value.pop()
  } else if (step.type === 'execute-macro') {
    macroTasks.value.shift()
  } else if (step.type === 'execute-micro') {
    microTasks.value.shift()
  }
}

// 解析JavaScript代码生成调试步骤
const parseCodeForDebug = (code) => {
  const steps = []
  const lines = code.split('\n')
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim()
    if (trimmedLine === '' || trimmedLine.startsWith('//')) return
    
    // 检测函数定义
    if (trimmedLine.includes('function ') || trimmedLine.match(/^\w+\s*=\s*function/)) {
      steps.push({
        type: 'function-definition',
        description: `定义函数: ${trimmedLine}`,
        code: trimmedLine,
        line: index + 1
      })
    }
    // 检测函数调用
    else if (trimmedLine.includes('(') && trimmedLine.includes(')') && !trimmedLine.includes('console.log')) {
      steps.push({
        type: 'function-call',
        description: `调用函数: ${trimmedLine}`,
        code: trimmedLine,
        line: index + 1,
        name: trimmedLine.split('(')[0].trim()
      })
    }
    // 检测setTimeout (宏任务)
    else if (trimmedLine.includes('setTimeout')) {
      steps.push({
        type: 'macro-task',
        description: `添加宏任务: ${trimmedLine}`,
        code: trimmedLine,
        line: index + 1,
        name: 'setTimeout'
      })
    }
    // 检测Promise (微任务)
    else if (trimmedLine.includes('Promise') || trimmedLine.includes('.then')) {
      steps.push({
        type: 'micro-task',
        description: `添加微任务: ${trimmedLine}`,
        code: trimmedLine,
        line: index + 1,
        name: 'Promise'
      })
    }
    // 检测console.log
    else if (trimmedLine.includes('console.log')) {
      steps.push({
        type: 'console',
        description: `控制台输出: ${trimmedLine}`,
        code: trimmedLine,
        line: index + 1
      })
    }
    // 其他语句
    else if (trimmedLine.length > 0) {
      steps.push({
        type: 'statement',
        description: `执行语句: ${trimmedLine}`,
        code: trimmedLine,
        line: index + 1
      })
    }
  })
  
  return steps
}

// 运行代码
const runCode = () => {
  if (isRunning.value) return
  
  isRunning.value = true
  consoleOutput.value = []
  
  // 如果是调试模式，解析代码并准备调试
  if (debugMode.value) {
    debugSteps.value = parseCodeForDebug(jsCode.value)
    currentStep.value = 0
    executionState.value = 'paused'
    isPaused.value = true
    macroTasks.value = []
    microTasks.value = []
    callStack.value = []
    
    consoleOutput.value.push({
      level: 'log',
      message: `调试模式启动，共 ${debugSteps.value.length} 个步骤`,
      timestamp: new Date().toLocaleTimeString()
    })
    
    isRunning.value = false
    return
  }
  
  // 正常运行模式
  try {
    const fullHtml = createHtmlDocument()
    
    if (previewFrame.value) {
      const blob = new Blob([fullHtml], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      previewFrame.value.src = url
      
      setTimeout(() => {
        URL.revokeObjectURL(url)
      }, 1000)
    }
  } catch (error) {
    consoleOutput.value.push({
      level: 'error',
      message: error.message,
      timestamp: new Date().toLocaleTimeString()
    })
  }
  
  isRunning.value = false
}

// 处理消息
const handleMessage = (event) => {
  if (event.data && event.data.type === 'console') {
    consoleOutput.value.push({
      level: event.data.level,
      message: event.data.message,
      timestamp: new Date().toLocaleTimeString()
    })
  }
}

// 创建HTML文档
const createHtmlDocument = () => {
  let fullHtml = ''
  fullHtml += '<' + '!DOCTYPE html>'
  fullHtml += '<' + 'html lang="zh-CN">'
  fullHtml += '<' + 'head>'
  fullHtml += '<' + 'meta charset="UTF-8">'
  fullHtml += '<' + 'meta name="viewport" content="width=device-width, initial-scale=1.0">'
  fullHtml += '<' + 'title>Code Preview<' + '/title>'
  fullHtml += '<' + 'style>'
  fullHtml += cssCode.value
  fullHtml += '<' + '/style>'
  fullHtml += '<' + '/head>'
  fullHtml += '<' + 'body>'
  fullHtml += htmlCode.value
  fullHtml += '<' + 'script>'
  fullHtml += `
    // 重写console方法以捕获输出
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.log = function(...args) {
      originalLog.apply(console, args);
      window.parent.postMessage({
        type: 'console',
        level: 'log',
        message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ')
      }, '*');
    };
    
    console.error = function(...args) {
      originalError.apply(console, args);
      window.parent.postMessage({
        type: 'console',
        level: 'error',
        message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ')
      }, '*');
    };
    
    console.warn = function(...args) {
      originalWarn.apply(console, args);
      window.parent.postMessage({
        type: 'console',
        level: 'warn',
        message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ')
      }, '*');
    };
    
    // 捕获错误
    window.onerror = function(message, source, lineno, colno, error) {
      window.parent.postMessage({
        type: 'console',
        level: 'error',
        message: 'Error: ' + message + ' at line ' + lineno
      }, '*');
    };
  `
  fullHtml += jsCode.value
  fullHtml += '<' + '/script>'
  fullHtml += '<' + '/body>'
  fullHtml += '<' + '/html>'
  
  return fullHtml
}

// 获取控制台脚本
const getConsoleScript = () => {
  return `
(function() {
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.log = function(...args) {
    window.parent.postMessage({
      type: 'console',
      level: 'log',
      message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ')
    }, '*');
    originalLog.apply(console, args);
  };
  
  console.error = function(...args) {
    window.parent.postMessage({
      type: 'console',
      level: 'error',
      message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ')
    }, '*');
    originalError.apply(console, args);
  };
  
  console.warn = function(...args) {
    window.parent.postMessage({
      type: 'console',
      level: 'warn',
      message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ')
    }, '*');
    originalWarn.apply(console, args);
  };
  
  window.addEventListener('error', function(e) {
    window.parent.postMessage({
      type: 'console',
      level: 'error',
      message: 'Error: ' + e.message + ' (Line: ' + e.lineno + ')'
    }, '*');
  });
})();
`
}

// 代码变化处理
const onCodeChange = () => {
  if (autoRun.value) {
    clearTimeout(runTimeout)
    runTimeout = setTimeout(runCode, 1000)
  }
}

// 清空所有代码
const clearAll = () => {
  htmlCode.value = ''
  cssCode.value = ''
  jsCode.value = ''
  consoleOutput.value = []
  if (previewFrame.value) {
    const doc = previewFrame.value.contentDocument || previewFrame.value.contentWindow.document
    doc.open()
    doc.write('')
    doc.close()
  }
}

// 复制代码
const copyCode = async () => {
  const code = `HTML:\n${htmlCode.value}\n\nCSS:\n${cssCode.value}\n\nJavaScript:\n${jsCode.value}`
  try {
    await navigator.clipboard.writeText(code)
    alert('代码已复制到剪贴板!')
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// 加载示例代码
const loadExample = () => {
  htmlCode.value = exampleCode.html
  cssCode.value = exampleCode.css
  jsCode.value = exampleCode.js
  if (autoRun.value) {
    setTimeout(runCode, 100)
  }
}

// 清空控制台
const clearConsole = () => {
  consoleOutput.value = []
}

// 返回主页
const goHome = () => {
  window.location.href = '/'
}

onMounted(() => {
  // 监听来自iframe的消息
  window.addEventListener('message', handleMessage)
  
  // 设置示例代码
  loadExample()
})

onUnmounted(() => {
  window.removeEventListener('message', handleMessage)
  if (runTimeout) {
    clearTimeout(runTimeout)
  }
})
</script>

<style scoped>
.code-runner {
  width: 100%;
  height: 100vh;
  margin: 0;
  padding: 20px;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  overflow-y: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.code-runner::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

/* 调试模式布局 */
.debug-layout {
  display: flex;
  gap: 20px;
  flex: 1;
  min-height: 0;
}

.debug-left {
  flex: 1;
  min-width: 0;
}

.debug-right {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.debug-right .debug-panel {
  flex: 1;
  min-height: 0;
}

.debug-right .console-panel {
  height: 250px;
  flex-shrink: 0;
}

.header {
  text-align: center;
  margin-bottom: 20px;
  flex-shrink: 0;
}

.header h1 {
  color: #2c3e50;
  margin: 0 0 5px 0;
  font-size: 2em;
}

.header p {
  color: #7f8c8d;
  margin: 0;
  font-size: 1em;
}

.controls {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  align-items: center;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.btn-home {
  background: #28a745;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-home:hover {
  background: #218838;
}

.btn-primary, .btn-secondary {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-primary:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.auto-run {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #495057;
  cursor: pointer;
}

.auto-run input[type="checkbox"] {
  cursor: pointer;
}

.editor-container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 15px;
  margin-bottom: 15px;
  flex-shrink: 0;
}

.editor-container.js-only {
  grid-template-columns: 1fr;
}

.editor-panel {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
}

.editor-header {
  background: #f8f9fa;
  padding: 12px 16px;
  border-bottom: 1px solid #dee2e6;
}

.editor-title {
  font-weight: 600;
  color: #495057;
  font-size: 14px;
}

.code-editor {
  width: 100%;
  height: 400px;
  border: none;
  padding: 16px;
  font-family: 'JetBrains Mono', 'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
  outline: none;
  background: #fafbfc;
  color: #2c3e50;
  border-radius: 0 0 8px 8px;
  tab-size: 2;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow-y: auto;
}

.debug-left .code-editor {
  height: 600px;
}

.debug-content {
  height: 100%;
  overflow-y: auto;
  padding: 15px;
}

.debug-section {
  margin-bottom: 20px;
}

.debug-section:last-child {
  margin-bottom: 0;
}

.debug-section h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}

.debug-section h5 {
  margin: 0 0 8px 0;
  font-size: 12px;
  font-weight: 500;
  color: #5a6c7d;
}

.code-editor:focus {
  border-color: #4a90e2;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1), inset 0 2px 4px rgba(0, 0, 0, 0.05);
}

.code-editor::selection {
  background-color: rgba(74, 144, 226, 0.2);
}

.preview-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 15px;
  flex: 1;
  min-height: 500px;
  max-height: 70vh;
}

.preview-container.with-debug {
  grid-template-columns: 1fr 1fr 1fr;
}

.preview-panel, .console-panel {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.preview-header, .console-header {
  background: #f8f9fa;
  padding: 12px 16px;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-title, .console-title {
  font-weight: 600;
  color: #495057;
  font-size: 14px;
}

.clear-console {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
}

.clear-console:hover {
  background: #e9ecef;
}

.preview-iframe {
  flex: 1;
  border: none;
  background: white;
  width: 100%;
  min-height: 400px;
  max-height: 600px;
  border-radius: 8px;
}

.console-output {
  flex: 1;
  min-height: 300px;
  max-height: 500px;
  overflow-y: auto;
  padding: 12px;
  font-family: 'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
  background-color: #fafbfc;
  color: #2c3e50;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
}

.console-line {
  margin-bottom: 8px;
  display: flex;
  gap: 8px;
}

.console-timestamp {
  color: #6c757d;
  font-size: 11px;
  min-width: 60px;
}

.console-message {
  flex: 1;
  word-break: break-word;
}

.console-log {
  color: #333;
}

.console-error {
  color: #dc3545;
}

.console-warn {
  color: #ffc107;
}

.console-info {
  color: #17a2b8;
  font-weight: 500;
}

.console-success {
  color: #28a745;
  font-weight: 500;
}

.console-debug {
  color: #6c757d;
  font-style: italic;
}

.console-step-result {
  color: #28a745;
  margin-left: 20px;
}

.console-step-error {
  color: #dc3545;
  margin-left: 20px;
}

.console-result {
  color: #6f42c1;
  font-weight: 600;
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
  border-left: 3px solid #6f42c1;
}

.console-async-log {
  color: #4CAF50;
  font-style: italic;
}

.console-async-error {
  color: #f44336;
  font-style: italic;
}

.console-result {
      color: #2196F3;
      font-weight: bold;
      background: rgba(33, 150, 243, 0.1);
      padding: 8px 12px;
      border-radius: 4px;
      border-left: 4px solid #2196F3;
    }

.console-empty {
  color: #6c757d;
  font-style: italic;
  text-align: center;
  padding: 20px;
}

/* 调试面板样式 */
.debug-panel {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  display: flex;
  flex-direction: column;
}

.debug-header {
  background: #f8f9fa;
  padding: 12px 16px;
  border-bottom: 1px solid #dee2e6;
}

.debug-title {
  font-weight: 600;
  color: #495057;
  font-size: 14px;
}

.debug-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.debug-section {
  margin-bottom: 20px;
}

.debug-section h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #495057;
  font-weight: 600;
}

.debug-section h5 {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
}

.execution-status {
  padding: 8px 12px;
  border-radius: 4px;
  background: #f8f9fa;
}

.status-indicator {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-indicator.running {
  background: #d4edda;
  color: #155724;
}

.status-indicator.paused {
  background: #fff3cd;
  color: #856404;
}

.status-indicator.stopped {
  background: #f8d7da;
  color: #721c24;
}

.task-queues {
  display: flex;
  gap: 15px;
}

.queue-section {
  flex: 1;
  min-width: 0;
}

.task-list {
  max-height: 120px;
  overflow-y: auto;
  border: 1px solid #e1e8ed;
  border-radius: 6px;
  padding: 8px;
  background: #fafbfc;
}

.task-item {
  padding: 4px 8px;
  margin-bottom: 4px;
  border-radius: 4px;
  font-size: 12px;
  font-family: monospace;
}

.task-item.macro-task {
  background: #e3f2fd;
  color: #1565c0;
}

.task-item.micro-task {
  background: #f3e5f5;
  color: #7b1fa2;
}

.empty-queue, .empty-stack {
  color: #6c757d;
  font-style: italic;
  text-align: center;
  padding: 8px;
  font-size: 12px;
}

.call-stack {
  max-height: 150px;
  overflow-y: auto;
  border: 1px solid #e1e8ed;
  border-radius: 6px;
  padding: 8px;
  background: #fafbfc;
}

.debug-right .console-output {
  height: 200px;
  margin-top: 0;
}

.stack-item {
  padding: 4px 8px;
  margin-bottom: 4px;
  border-radius: 4px;
  font-size: 12px;
  font-family: monospace;
  background: #fff3e0;
  color: #ef6c00;
}
/* 响应式设计 */
@media (max-width: 1200px) {
  .editor-container {
    grid-template-columns: 1fr;
  }
  
  .preview-container {
    grid-template-columns: 1fr;
  }
  
  .preview-container.with-debug {
    grid-template-columns: 1fr;
  }
  
  .task-queues {
    flex-direction: column;
    gap: 12px;
  }
}

@media (max-width: 768px) {
  .code-runner {
    padding: 15px;
  }
  
  .controls {
    justify-content: center;
  }
  
  .code-editor {
    height: 300px;
  }
  
  .js-only .code-editor {
    height: 400px;
  }
}
</style>