<template>
  <div class="tetris-game">
    <div class="game-header">
      <h2>🧩 俄罗斯方块</h2>
      <div class="game-stats">
        <div class="stat-item">
          <span class="stat-label">得分</span>
          <span class="stat-value">{{ score }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">等级</span>
          <span class="stat-value">{{ level }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">行数</span>
          <span class="stat-value">{{ lines }}</span>
        </div>
      </div>
    </div>

    <div class="game-container">
      <div class="game-area">
        <!-- 下一个方块预览 -->
        <div class="next-piece">
          <h4>下一个</h4>
          <canvas ref="nextCanvas" width="80" height="80"></canvas>
        </div>

        <!-- 游戏主区域 -->
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
                <p>消除行数: {{ lines }}</p>
                <button @click="startGame" class="play-btn">重新开始</button>
              </div>
              <div v-else class="game-start">
                <h3>俄罗斯方块</h3>
                <p>使用方向键控制方块</p>
                <p>↑旋转 ↓加速下降 ←→移动</p>
                <button @click="startGame" class="play-btn">开始游戏</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 控制说明 -->
        <div class="controls-info">
          <h4>控制</h4>
          <div class="control-item">↑ 旋转</div>
          <div class="control-item">↓ 加速</div>
          <div class="control-item">← → 移动</div>
          <div class="control-item">空格 暂停</div>
        </div>
      </div>

      <!-- 移动端控制按钮 -->
      <div class="mobile-controls">
        <div class="control-row">
          <button @click="rotatePiece" class="control-btn rotate-btn">🔄</button>
          <button @click="pauseGame" class="control-btn pause-btn">
            {{ gameRunning && !gamePaused ? '⏸️' : '▶️' }}
          </button>
        </div>
        <div class="control-row">
          <button @click="movePiece('left')" class="control-btn">←</button>
          <button @click="dropPiece" class="control-btn drop-btn">↓</button>
          <button @click="movePiece('right')" class="control-btn">→</button>
        </div>
      </div>
    </div>

    <!-- 游戏说明 -->
    <div class="game-instructions">
      <h4>游戏说明:</h4>
      <ul>
        <li>控制下落的方块，填满整行即可消除</li>
        <li>同时消除多行可获得更高分数</li>
        <li>游戏速度会随等级提升而加快</li>
        <li>方块堆积到顶部游戏结束</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

// 游戏状态
const gameRunning = ref(false)
const gameOver = ref(false)
const gamePaused = ref(false)
const score = ref(0)
const level = ref(1)
const lines = ref(0)

// 画布相关
const gameCanvas = ref(null)
const nextCanvas = ref(null)
const gameBoard = ref(null)
const canvasWidth = 300
const canvasHeight = 600
const blockSize = 30
const boardWidth = 10
const boardHeight = 20

// 游戏板
const board = ref(Array(boardHeight).fill().map(() => Array(boardWidth).fill(0)))

// 方块定义
const pieces = {
  I: {
    shape: [
      [1, 1, 1, 1]
    ],
    color: '#00f5ff'
  },
  O: {
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: '#ffff00'
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1]
    ],
    color: '#800080'
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0]
    ],
    color: '#00ff00'
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1]
    ],
    color: '#ff0000'
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1]
    ],
    color: '#0000ff'
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1]
    ],
    color: '#ffa500'
  }
}

// 当前方块和下一个方块
const currentPiece = ref(null)
const nextPiece = ref(null)
const piecePosition = ref({ x: 0, y: 0 })

// 游戏循环
let gameLoop = null
let dropTimer = 0
const dropInterval = ref(500) // 毫秒

// 开始游戏
const startGame = () => {
  resetGame()
  gameRunning.value = true
  gameOver.value = false
  gamePaused.value = false
  
  nextTick(() => {
    if (gameCanvas.value) {
      gameCanvas.value.focus()
    }
  })
  
  gameLoop = setInterval(updateGame, 16) // 60 FPS
}

// 重置游戏
const resetGame = () => {
  board.value = Array(boardHeight).fill().map(() => Array(boardWidth).fill(0))
  score.value = 0
  level.value = 1
  lines.value = 0
  dropInterval.value = 500
  dropTimer = 0
  
  spawnNewPiece()
  drawGame()
}

// 暂停游戏
const pauseGame = () => {
  if (!gameRunning.value) return
  
  gamePaused.value = !gamePaused.value
}

// 生成新方块
const spawnNewPiece = () => {
  const pieceTypes = Object.keys(pieces)
  
  if (!nextPiece.value) {
    nextPiece.value = pieceTypes[Math.floor(Math.random() * pieceTypes.length)]
  }
  
  currentPiece.value = {
    type: nextPiece.value,
    shape: JSON.parse(JSON.stringify(pieces[nextPiece.value].shape)),
    color: pieces[nextPiece.value].color
  }
  
  nextPiece.value = pieceTypes[Math.floor(Math.random() * pieceTypes.length)]
  
  piecePosition.value = {
    x: Math.floor(boardWidth / 2) - Math.floor(currentPiece.value.shape[0].length / 2),
    y: 0
  }
  
  // 检查游戏是否结束
  if (checkCollision(currentPiece.value.shape, piecePosition.value)) {
    endGame()
  }
  
  drawNextPiece()
}

// 游戏更新循环
const updateGame = () => {
  if (!gameRunning.value || gamePaused.value) return
  
  dropTimer += 16
  
  if (dropTimer >= dropInterval.value) {
    dropTimer = 0
    
    const newPos = { x: piecePosition.value.x, y: piecePosition.value.y + 1 }
    
    if (checkCollision(currentPiece.value.shape, newPos)) {
      // 方块着陆
      placePiece()
      clearLines()
      spawnNewPiece()
    } else {
      piecePosition.value = newPos
    }
  }
  
  drawGame()
}

// 检查碰撞
const checkCollision = (shape, pos) => {
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        const newX = pos.x + x
        const newY = pos.y + y
        
        if (newX < 0 || newX >= boardWidth || newY >= boardHeight) {
          return true
        }
        
        if (newY >= 0 && board.value[newY][newX]) {
          return true
        }
      }
    }
  }
  return false
}

// 放置方块
const placePiece = () => {
  const shape = currentPiece.value.shape
  const pos = piecePosition.value
  
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        const boardY = pos.y + y
        const boardX = pos.x + x
        
        if (boardY >= 0) {
          board.value[boardY][boardX] = currentPiece.value.color
        }
      }
    }
  }
}

// 清除满行
const clearLines = () => {
  let linesCleared = 0
  
  for (let y = boardHeight - 1; y >= 0; y--) {
    if (board.value[y].every(cell => cell !== 0)) {
      board.value.splice(y, 1)
      board.value.unshift(Array(boardWidth).fill(0))
      linesCleared++
      y++ // 重新检查当前行
    }
  }
  
  if (linesCleared > 0) {
    lines.value += linesCleared
    
    // 计分系统
    const lineScores = [0, 100, 300, 500, 800]
    score.value += lineScores[linesCleared] * level.value
    
    // 升级系统
    const newLevel = Math.floor(lines.value / 10) + 1
    if (newLevel > level.value) {
      level.value = newLevel
      dropInterval.value = Math.max(50, 500 - (level.value - 1) * 50)
    }
  }
}

// 移动方块
const movePiece = (direction) => {
  if (!gameRunning.value || gamePaused.value || !currentPiece.value) return
  
  const newPos = { ...piecePosition.value }
  
  if (direction === 'left') {
    newPos.x--
  } else if (direction === 'right') {
    newPos.x++
  }
  
  if (!checkCollision(currentPiece.value.shape, newPos)) {
    piecePosition.value = newPos
  }
}

// 旋转方块
const rotatePiece = () => {
  if (!gameRunning.value || gamePaused.value || !currentPiece.value) return
  
  const rotated = rotateMatrix(currentPiece.value.shape)
  const currentPos = piecePosition.value
  
  // 尝试在当前位置旋转
  if (!checkCollision(rotated, currentPos)) {
    currentPiece.value.shape = rotated
    return
  }
  
  // 如果当前位置不能旋转，尝试向左或向右移动一格后旋转（踢墙系统）
  const kickOffsets = [{ x: -1, y: 0 }, { x: 1, y: 0 }, { x: 0, y: -1 }]
  
  for (const offset of kickOffsets) {
    const newPos = { x: currentPos.x + offset.x, y: currentPos.y + offset.y }
    if (!checkCollision(rotated, newPos)) {
      currentPiece.value.shape = rotated
      piecePosition.value = newPos
      return
    }
  }
}

// 矩阵旋转（顺时针90度）
const rotateMatrix = (matrix) => {
  const rows = matrix.length
  const cols = matrix[0].length
  
  // 创建新的旋转后矩阵
  const rotated = Array(cols).fill().map(() => Array(rows).fill(0))
  
  // 顺时针旋转90度的正确算法
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (matrix[y][x]) {
        rotated[x][rows - 1 - y] = matrix[y][x]
      }
    }
  }
  
  return rotated
}

// 快速下降
const dropPiece = () => {
  if (!gameRunning.value || gamePaused.value || !currentPiece.value) return
  
  while (!checkCollision(currentPiece.value.shape, {
    x: piecePosition.value.x,
    y: piecePosition.value.y + 1
  })) {
    piecePosition.value.y++
  }
}

// 键盘事件处理
const handleKeyPress = (event) => {
  event.preventDefault()
  
  switch (event.code) {
    case 'ArrowLeft':
      movePiece('left')
      break
    case 'ArrowRight':
      movePiece('right')
      break
    case 'ArrowDown':
      dropPiece()
      break
    case 'ArrowUp':
      rotatePiece()
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
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)
  
  // 绘制网格
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 1
  for (let x = 0; x <= boardWidth; x++) {
    ctx.beginPath()
    ctx.moveTo(x * blockSize, 0)
    ctx.lineTo(x * blockSize, canvasHeight)
    ctx.stroke()
  }
  for (let y = 0; y <= boardHeight; y++) {
    ctx.beginPath()
    ctx.moveTo(0, y * blockSize)
    ctx.lineTo(canvasWidth, y * blockSize)
    ctx.stroke()
  }
  
  // 绘制已放置的方块
  for (let y = 0; y < boardHeight; y++) {
    for (let x = 0; x < boardWidth; x++) {
      if (board.value[y][x]) {
        ctx.fillStyle = board.value[y][x]
        ctx.fillRect(x * blockSize + 1, y * blockSize + 1, blockSize - 2, blockSize - 2)
      }
    }
  }
  
  // 绘制当前方块
  if (currentPiece.value) {
    ctx.fillStyle = currentPiece.value.color
    const shape = currentPiece.value.shape
    const pos = piecePosition.value
    
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          ctx.fillRect(
            (pos.x + x) * blockSize + 1,
            (pos.y + y) * blockSize + 1,
            blockSize - 2,
            blockSize - 2
          )
        }
      }
    }
  }
}

// 绘制下一个方块
const drawNextPiece = () => {
  const canvas = nextCanvas.value
  if (!canvas || !nextPiece.value) return
  
  const ctx = canvas.getContext('2d')
  const piece = pieces[nextPiece.value]
  
  // 清空画布
  ctx.fillStyle = '#f8f9fa'
  ctx.fillRect(0, 0, 80, 80)
  
  // 绘制方块
  ctx.fillStyle = piece.color
  const shape = piece.shape
  const offsetX = (80 - shape[0].length * 15) / 2
  const offsetY = (80 - shape.length * 15) / 2
  
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        ctx.fillRect(
          offsetX + x * 15,
          offsetY + y * 15,
          14,
          14
        )
      }
    }
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
})

// 组件卸载
onUnmounted(() => {
  clearInterval(gameLoop)
  document.removeEventListener('keydown', handleKeyPress)
})
</script>

<style scoped>
.tetris-game {
  max-width: 800px;
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

.game-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 15px;
  background: #f8f9fa;
  border-radius: 8px;
  min-width: 60px;
}

.stat-label {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
}

.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.game-area {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.next-piece {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px solid #dee2e6;
}

.next-piece h4 {
  margin: 0 0 10px 0;
  color: #495057;
  font-size: 14px;
}

.next-piece canvas {
  border: 1px solid #dee2e6;
  border-radius: 4px;
}

.game-board {
  position: relative;
  border: 3px solid #2c3e50;
  border-radius: 8px;
  overflow: hidden;
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
  background: #007bff;
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
  background: #0056b3;
  transform: translateY(-2px);
}

.controls-info {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px solid #dee2e6;
}

.controls-info h4 {
  margin: 0 0 10px 0;
  color: #495057;
  font-size: 14px;
  text-align: center;
}

.control-item {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 5px;
  text-align: center;
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
  font-size: 18px;
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

.rotate-btn {
  background: #17a2b8;
  color: white;
  border-color: #17a2b8;
}

.rotate-btn:hover {
  background: #138496;
}

.pause-btn {
  background: #ffc107;
  color: white;
  border-color: #ffc107;
}

.pause-btn:hover {
  background: #e0a800;
}

.drop-btn {
  background: #dc3545;
  color: white;
  border-color: #dc3545;
}

.drop-btn:hover {
  background: #c82333;
}

.game-instructions {
  margin-top: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #007bff;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .tetris-game {
    padding: 15px;
  }
  
  .game-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .game-stats {
    justify-content: center;
  }
  
  .game-area {
    flex-direction: column;
    align-items: center;
  }
  
  .next-piece {
    order: -1;
  }
  
  .controls-info {
    display: none;
  }
  
  .control-btn {
    width: 45px;
    height: 45px;
    font-size: 16px;
  }
}
</style>