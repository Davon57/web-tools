<template>
  <div class="snake-game">
    <div class="game-header">
      <h2>🐍 贪吃蛇游戏</h2>
      <div class="game-info">
        <div class="score">得分: {{ score }}</div>
        <div class="high-score">最高分: {{ highScore }}</div>
        <div class="speed-info">速度: {{ speedSettings[gameSpeed].name }}</div>
      </div>
    </div>

    <!-- 游戏设置 -->
    <div class="game-settings">
      <div class="setting-group">
        <label>游戏速度:</label>
        <select v-model="gameSpeed" @change="updateGameSpeed" :disabled="gameRunning">
          <option value="slow">慢速 (适合新手)</option>
          <option value="medium">中速 (推荐)</option>
          <option value="fast">快速 (挑战)</option>
        </select>
      </div>
      <button @click="toggleFullscreen" class="fullscreen-btn">
        {{ isFullscreen ? '退出全屏' : '全屏游戏' }}
      </button>
    </div>

    <div class="game-container">
      <div class="game-board" ref="gameBoard">
        <canvas 
          ref="gameCanvas" 
          :width="canvasWidth" 
          :height="canvasHeight"
          @keydown="handleKeyPress"
          tabindex="0"
        ></canvas>
        
        <!-- 游戏状态覆盖层 -->
        <div v-if="!gameRunning" class="game-overlay">
          <div class="overlay-content">
            <div v-if="gameOver" class="game-over">
              <h3>游戏结束!</h3>
              <p>最终得分: {{ score }}</p>
              <button @click="startGame" class="play-btn">重新开始</button>
            </div>
            <div v-else class="game-start">
              <h3>贪吃蛇游戏</h3>
              <p>使用方向键控制蛇的移动</p>
              <p>吃到食物可以增长身体和得分</p>
              <button @click="startGame" class="play-btn">开始游戏</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 控制按钮 (移动端) -->
      <div class="mobile-controls">
        <div class="control-row">
          <button @click="changeDirection('up')" class="control-btn">↑</button>
        </div>
        <div class="control-row">
          <button @click="changeDirection('left')" class="control-btn">←</button>
          <button @click="pauseGame" class="control-btn pause-btn">
            {{ gameRunning && !gamePaused ? '⏸️' : '▶️' }}
          </button>
          <button @click="changeDirection('right')" class="control-btn">→</button>
        </div>
        <div class="control-row">
          <button @click="changeDirection('down')" class="control-btn">↓</button>
        </div>
      </div>
    </div>

    <!-- 游戏说明 -->
    <div class="game-instructions">
      <h4>游戏说明:</h4>
      <ul>
        <li>使用方向键或点击按钮控制蛇的移动方向</li>
        <li>吃到红色食物可以增长身体并获得10分</li>
        <li>撞到墙壁或自己的身体游戏结束</li>
        <li>按空格键可以暂停/继续游戏</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

// 游戏状态
const gameRunning = ref(false)
const gameOver = ref(false)
const gamePaused = ref(false)
const score = ref(0)
const highScore = ref(parseInt(localStorage.getItem('snakeHighScore') || '0'))

// 速度控制
const gameSpeed = ref('medium') // slow, medium, fast
const currentSpeed = ref(200)
const isFullscreen = ref(false)

// 速度配置
const speedSettings = {
  slow: { base: 300, name: '慢速' },
  medium: { base: 200, name: '中速' },
  fast: { base: 120, name: '快速' }
}

// 画布相关
const gameCanvas = ref(null)
const gameBoard = ref(null)
const canvasWidth = ref(400)
const canvasHeight = ref(400)
const gridSize = 20
const tileCount = computed(() => canvasWidth.value / gridSize)

// 游戏对象
const snake = ref([
  { x: Math.floor(tileCount.value / 2), y: Math.floor(tileCount.value / 2) }
])
const food = ref({ x: Math.floor(tileCount.value * 0.75), y: Math.floor(tileCount.value * 0.75) })
const direction = ref({ x: 0, y: 0 })
const nextDirection = ref({ x: 0, y: 0 })

// 游戏循环
let gameLoop = null

// 开始游戏
const startGame = () => {
  resetGame()
  gameRunning.value = true
  gameOver.value = false
  gamePaused.value = false
  updateGameSpeed()
  
  nextTick(() => {
    if (gameCanvas.value) {
      gameCanvas.value.focus()
    }
  })
  
  gameLoop = setInterval(updateGame, currentSpeed.value)
}

// 重置游戏
const resetGame = () => {
  snake.value = [{ x: Math.floor(tileCount.value / 2), y: Math.floor(tileCount.value / 2) }]
  food.value = generateFood()
  direction.value = { x: 0, y: 0 }
  nextDirection.value = { x: 0, y: 0 }
  score.value = 0
}

// 暂停游戏
const pauseGame = () => {
  if (!gameRunning.value) return
  
  gamePaused.value = !gamePaused.value
  
  if (gamePaused.value) {
    clearInterval(gameLoop)
  } else {
    gameLoop = setInterval(updateGame, currentSpeed.value)
  }
}

// 游戏更新循环
const updateGame = () => {
  if (!gameRunning.value || gamePaused.value) return
  
  // 更新方向
  direction.value = { ...nextDirection.value }
  
  // 如果蛇还没有开始移动，只绘制不更新位置
  if (direction.value.x === 0 && direction.value.y === 0) {
    drawGame()
    return
  }
  
  // 移动蛇头
  const head = { ...snake.value[0] }
  head.x += direction.value.x
  head.y += direction.value.y
  
  // 检查碰撞
  if (checkCollision(head)) {
    endGame()
    return
  }
  
  snake.value.unshift(head)
  
  // 检查是否吃到食物
  if (head.x === food.value.x && head.y === food.value.y) {
    score.value += 10
    food.value = generateFood()
    
    // 更新最高分
    if (score.value > highScore.value) {
      highScore.value = score.value
      localStorage.setItem('snakeHighScore', highScore.value.toString())
    }
    
    // 循序渐进提升速度
    updateProgressiveSpeed()
  } else {
    snake.value.pop()
  }
  
  drawGame()
}

// 检查碰撞
const checkCollision = (head) => {
  // 撞墙
  if (head.x < 0 || head.x >= tileCount.value || head.y < 0 || head.y >= tileCount.value) {
    return true
  }
  
  // 撞自己
  for (let segment of snake.value) {
    if (head.x === segment.x && head.y === segment.y) {
      return true
    }
  }
  
  return false
}

// 生成食物
const generateFood = () => {
  let newFood
  do {
    newFood = {
      x: Math.floor(Math.random() * tileCount.value),
      y: Math.floor(Math.random() * tileCount.value)
    }
  } while (snake.value.some(segment => segment.x === newFood.x && segment.y === newFood.y))
  
  return newFood
}

// 改变方向
const changeDirection = (newDirection) => {
  if (!gameRunning.value || gamePaused.value) return
  
  const directions = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
  }
  
  const newDir = directions[newDirection]
  
  // 防止反向移动
  if (direction.value.x !== -newDir.x || direction.value.y !== -newDir.y) {
    nextDirection.value = newDir
  }
}

// 键盘事件处理
const handleKeyPress = (event) => {
  event.preventDefault()
  
  switch (event.code) {
    case 'ArrowUp':
      changeDirection('up')
      break
    case 'ArrowDown':
      changeDirection('down')
      break
    case 'ArrowLeft':
      changeDirection('left')
      break
    case 'ArrowRight':
      changeDirection('right')
      break
    case 'Space':
      pauseGame()
      break
  }
}

// 绘制游戏
const drawGame = () => {
  const canvas = gameCanvas.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  
  // 清空画布
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(0, 0, canvasWidth.value, canvasHeight.value)
  
  // 绘制网格
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 1
  for (let i = 0; i <= tileCount.value; i++) {
    ctx.beginPath()
    ctx.moveTo(i * gridSize, 0)
    ctx.lineTo(i * gridSize, canvasHeight.value)
    ctx.stroke()
    
    ctx.beginPath()
    ctx.moveTo(0, i * gridSize)
    ctx.lineTo(canvasWidth.value, i * gridSize)
    ctx.stroke()
  }
  
  // 绘制蛇
  snake.value.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? '#4CAF50' : '#8BC34A'
    ctx.fillRect(
      segment.x * gridSize + 1,
      segment.y * gridSize + 1,
      gridSize - 2,
      gridSize - 2
    )
  })
  
  // 绘制食物
  ctx.fillStyle = '#F44336'
  ctx.fillRect(
    food.value.x * gridSize + 1,
    food.value.y * gridSize + 1,
    gridSize - 2,
    gridSize - 2
  )
}

// 更新游戏速度
const updateGameSpeed = () => {
  currentSpeed.value = speedSettings[gameSpeed.value].base
  
  // 如果游戏正在运行，重新设置定时器
  if (gameRunning.value && !gamePaused.value) {
    clearInterval(gameLoop)
    gameLoop = setInterval(updateGame, currentSpeed.value)
  }
}

// 循序渐进提升速度
const updateProgressiveSpeed = () => {
  // 每获得50分，速度提升5%（最多提升50%）
  const speedBonus = Math.min(Math.floor(score.value / 50) * 0.05, 0.5)
  const newSpeed = Math.max(speedSettings[gameSpeed.value].base * (1 - speedBonus), 80)
  
  if (newSpeed !== currentSpeed.value) {
    currentSpeed.value = newSpeed
    
    // 重新设置游戏循环
    if (gameRunning.value && !gamePaused.value) {
      clearInterval(gameLoop)
      gameLoop = setInterval(updateGame, currentSpeed.value)
    }
  }
}

// 全屏功能
const toggleFullscreen = async () => {
  try {
    if (!isFullscreen.value) {
      // 进入全屏
      const element = gameBoard.value
      if (element.requestFullscreen) {
        await element.requestFullscreen()
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen()
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen()
      }
    } else {
      // 退出全屏
      if (document.exitFullscreen) {
        await document.exitFullscreen()
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen()
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen()
      }
    }
  } catch (error) {
    console.log('全屏操作失败:', error)
  }
}

// 调整画布尺寸
const resizeCanvas = () => {
  if (isFullscreen.value) {
    // 全屏模式：计算最大可用尺寸，保持正方形
    const maxWidth = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.9)
    const newSize = Math.floor(maxWidth / gridSize) * gridSize // 确保是网格大小的倍数
    canvasWidth.value = Math.max(newSize, 400) // 最小400px
    canvasHeight.value = canvasWidth.value
  } else {
    // 普通模式：恢复默认尺寸
    canvasWidth.value = 400
    canvasHeight.value = 400
  }
  
  // 检查蛇和食物的位置是否仍在有效范围内
  const maxTile = tileCount.value - 1
  
  // 调整蛇的位置
  snake.value = snake.value.map(segment => ({
    x: Math.min(segment.x, maxTile),
    y: Math.min(segment.y, maxTile)
  }))
  
  // 调整食物位置
  if (food.value.x >= tileCount.value || food.value.y >= tileCount.value) {
    food.value = generateFood()
  }
  
  // 重新绘制游戏
  nextTick(() => {
    drawGame()
  })
}

// 监听全屏状态变化
const handleFullscreenChange = () => {
  const wasFullscreen = isFullscreen.value
  isFullscreen.value = !!(document.fullscreenElement || 
                          document.webkitFullscreenElement || 
                          document.msFullscreenElement)
  
  // 如果全屏状态发生变化，调整画布尺寸
  if (wasFullscreen !== isFullscreen.value) {
    resizeCanvas()
  }
}

// 结束游戏
const endGame = () => {
  gameRunning.value = false
  gameOver.value = true
  clearInterval(gameLoop)
}

// 组件挂载
onMounted(() => {
  drawGame()
  
  // 添加全局键盘监听
  document.addEventListener('keydown', handleKeyPress)
  
  // 添加全屏状态监听
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.addEventListener('msfullscreenchange', handleFullscreenChange)
})

// 组件卸载
onUnmounted(() => {
  clearInterval(gameLoop)
  document.removeEventListener('keydown', handleKeyPress)
  
  // 移除全屏状态监听
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.removeEventListener('msfullscreenchange', handleFullscreenChange)
})
</script>

<style scoped>
.snake-game {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
}

.game-header h2 {
  color: #2c3e50;
  margin: 0;
}

.game-info {
  display: flex;
  gap: 20px;
}

.score, .high-score, .speed-info {
  font-weight: bold;
  padding: 8px 16px;
  background: #f8f9fa;
  border-radius: 20px;
  color: #495057;
}

.high-score {
  background: #fff3cd;
  color: #856404;
}

.speed-info {
  background: #e3f2fd;
  color: #1565c0;
}

.game-settings {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.setting-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.setting-group label {
  font-weight: bold;
  color: #495057;
}

.setting-group select {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background: white;
  color: #495057;
  font-size: 14px;
}

.setting-group select:disabled {
  background: #e9ecef;
  cursor: not-allowed;
}

.fullscreen-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.fullscreen-btn:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.game-board {
  position: relative;
  border: 3px solid #2c3e50;
  border-radius: 8px;
  overflow: hidden;
}

#gameCanvas {
  display: block;
  background: #1a1a1a;
}

.game-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.overlay-content {
  text-align: center;
  padding: 30px;
}

.overlay-content h3 {
  margin-bottom: 15px;
  font-size: 24px;
}

.overlay-content p {
  margin-bottom: 10px;
  opacity: 0.9;
}

.play-btn {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 15px;
}

.play-btn:hover {
  background: #45a049;
  transform: translateY(-2px);
}

.mobile-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.control-row {
  display: flex;
  gap: 10px;
}

.control-btn {
  width: 50px;
  height: 50px;
  border: 2px solid #2c3e50;
  background: white;
  border-radius: 8px;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover {
  background: #f8f9fa;
  transform: scale(1.05);
}

.control-btn:active {
  transform: scale(0.95);
}

.pause-btn {
  background: #ffc107;
  color: white;
  border-color: #ffc107;
}

.pause-btn:hover {
  background: #e0a800;
}

.game-instructions {
  margin-top: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #4CAF50;
}

.game-instructions h4 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.game-instructions ul {
  margin: 0;
  padding-left: 20px;
}

.game-instructions li {
  margin-bottom: 5px;
  color: #495057;
}

/* 全屏模式样式 */
.game-board:fullscreen {
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.game-board:fullscreen canvas {
  max-width: 90vw;
  max-height: 90vh;
  width: auto;
  height: auto;
}

.game-board:-webkit-full-screen {
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.game-board:-webkit-full-screen canvas {
  max-width: 90vw;
  max-height: 90vh;
  width: auto;
  height: auto;
}

.game-board:-moz-full-screen {
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.game-board:-moz-full-screen canvas {
  max-width: 90vw;
  max-height: 90vh;
  width: auto;
  height: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .snake-game {
    padding: 15px;
  }
  
  .game-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .game-info {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .game-settings {
    flex-direction: column;
    gap: 15px;
  }
  
  #gameCanvas {
    width: 100%;
    max-width: 350px;
    height: auto;
  }
  
  .control-btn {
    width: 45px;
    height: 45px;
    font-size: 18px;
  }
}
</style>