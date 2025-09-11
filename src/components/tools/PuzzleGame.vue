<template>
  <div class="puzzle-game">
    <div class="game-header">
      <h2>🖼️ 拼图游戏</h2>
      <div class="game-info">
        <div class="info-item">
          <span class="info-label">时间</span>
          <span class="info-value">{{ formatTime(gameTime) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">步数</span>
          <span class="info-value">{{ moves }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">难度</span>
          <span class="info-value">{{ selectedDifficulty?.name || '未选择' }}</span>
        </div>
      </div>
    </div>

    <!-- 游戏设置 -->
    <div v-if="!gameStarted" class="game-setup">
      <!-- 难度选择 -->
      <div class="difficulty-section">
        <h3>选择难度</h3>
        <div class="difficulty-buttons">
          <button 
            v-for="diff in difficulties" 
            :key="diff.name"
            @click="selectDifficulty(diff)"
            class="difficulty-btn"
            :class="{ active: selectedDifficulty?.name === diff.name }"
          >
            <div class="diff-icon">{{ diff.icon }}</div>
            <div class="diff-name">{{ diff.name }}</div>
            <div class="diff-desc">{{ diff.size }}×{{ diff.size }}</div>
          </button>
        </div>
      </div>

      <!-- 图片选择 -->
      <div class="image-section">
        <h3>选择图片</h3>
        <div class="image-options">
          <div class="preset-images">
            <div 
              v-for="(image, index) in presetImages" 
              :key="index"
              @click="selectImage(image)"
              class="image-option"
              :class="{ active: selectedImage === image }"
            >
              <div class="image-preview" :style="{ background: image.gradient }">
                <span class="image-emoji">{{ image.emoji }}</span>
              </div>
              <span class="image-name">{{ image.name }}</span>
            </div>
          </div>
          
          <!-- 自定义图片上传 -->
          <div class="custom-upload">
            <input 
              ref="fileInput" 
              type="file" 
              accept="image/*" 
              @change="handleImageUpload"
              style="display: none"
            >
            <button @click="$refs.fileInput.click()" class="upload-btn">
              📁 上传图片
            </button>
          </div>
        </div>
      </div>

      <button 
        @click="startGame" 
        :disabled="!selectedDifficulty || !selectedImage"
        class="start-btn"
      >
        开始游戏
      </button>
    </div>

    <!-- 游戏区域 -->
    <div v-else class="game-container">
      <!-- 参考图片 -->
      <div class="reference-image">
        <h4>参考图片</h4>
        <div class="reference-preview">
          <canvas ref="referenceCanvas" :width="referenceSize" :height="referenceSize"></canvas>
        </div>
      </div>

      <!-- 拼图区域 -->
      <div class="puzzle-area">
        <div 
          class="puzzle-board" 
          :style="{ 
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gridTemplateRows: `repeat(${gridSize}, 1fr)`,
            width: puzzleSize + 'px',
            height: puzzleSize + 'px'
          }"
        >
          <div 
            v-for="(piece, index) in puzzlePieces" 
            :key="index"
            @click="movePiece(index)"
            class="puzzle-piece"
            :class="{ 
              empty: piece === null,
              movable: isMovable(index)
            }"
          >
            <canvas 
              v-if="piece !== null"
              ref="pieceCanvas"
              :width="pieceSize" 
              :height="pieceSize"
              :data-piece="piece"
            ></canvas>
          </div>
        </div>
      </div>

      <!-- 游戏控制 -->
      <div class="game-controls">
        <button @click="pauseGame" class="control-btn pause-btn">
          {{ gamePaused ? '继续' : '暂停' }}
        </button>
        <button @click="shufflePuzzle" class="control-btn shuffle-btn">
          重新打乱
        </button>
        <button @click="showHint" class="control-btn hint-btn">
          提示
        </button>
        <button @click="resetGame" class="control-btn reset-btn">
          重新开始
        </button>
        <button @click="newGame" class="control-btn new-btn">
          新游戏
        </button>
      </div>
    </div>

    <!-- 游戏完成弹窗 -->
    <div v-if="gameCompleted" class="game-completed-overlay">
      <div class="completed-content">
        <h3>🎉 拼图完成!</h3>
        <div class="completion-stats">
          <div class="stat">
            <span class="stat-label">用时:</span>
            <span class="stat-value">{{ formatTime(finalTime) }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">步数:</span>
            <span class="stat-value">{{ finalMoves }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">难度:</span>
            <span class="stat-value">{{ selectedDifficulty?.name }}</span>
          </div>
        </div>
        <div class="completion-buttons">
          <button @click="playAgain" class="play-again-btn">再玩一次</button>
          <button @click="newGame" class="new-game-btn">选择新游戏</button>
        </div>
      </div>
    </div>

    <!-- 游戏说明 -->
    <div class="game-instructions">
      <h4>游戏说明:</h4>
      <ul>
        <li>点击空白位置旁边的拼图块来移动它</li>
        <li>将所有拼图块按正确顺序排列完成拼图</li>
        <li>可以选择不同难度和图片</li>
        <li>支持上传自定义图片进行拼图</li>
        <li>用最少的步数和时间完成挑战</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

// 游戏状态
const gameStarted = ref(false)
const gameCompleted = ref(false)
const gamePaused = ref(false)
const gameTime = ref(0)
const moves = ref(0)
const finalTime = ref(0)
const finalMoves = ref(0)

// 难度设置
const difficulties = [
  { name: '简单', icon: '😊', size: 3 },
  { name: '中等', icon: '😐', size: 4 },
  { name: '困难', icon: '😤', size: 5 },
  { name: '专家', icon: '🤯', size: 6 }
]

// 预设图片
const presetImages = [
  { name: '彩虹', emoji: '🌈', gradient: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57)' },
  { name: '日落', emoji: '🌅', gradient: 'linear-gradient(45deg, #ff9a9e, #fecfef, #fecfef)' },
  { name: '海洋', emoji: '🌊', gradient: 'linear-gradient(45deg, #667eea, #764ba2)' },
  { name: '森林', emoji: '🌲', gradient: 'linear-gradient(45deg, #11998e, #38ef7d)' },
  { name: '火焰', emoji: '🔥', gradient: 'linear-gradient(45deg, #ff6b6b, #ee5a24)' },
  { name: '星空', emoji: '⭐', gradient: 'linear-gradient(45deg, #2c3e50, #3498db)' }
]

const selectedDifficulty = ref(null)
const selectedImage = ref(null)
const customImageData = ref(null)

// 游戏参数
const gridSize = computed(() => selectedDifficulty.value?.size || 3)
const puzzleSize = 400
const referenceSize = 150
const pieceSize = computed(() => puzzleSize / gridSize.value)

// 拼图数据
const puzzlePieces = ref([])
const correctOrder = ref([])
const emptyIndex = ref(0)

// Canvas 引用
const referenceCanvas = ref(null)
const pieceCanvas = ref([])
const fileInput = ref(null)

// 计时器
let gameTimer = null

// 选择难度
const selectDifficulty = (difficulty) => {
  selectedDifficulty.value = difficulty
}

// 选择图片
const selectImage = (image) => {
  selectedImage.value = image
  customImageData.value = null
}

// 处理图片上传
const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    customImageData.value = e.target.result
    selectedImage.value = {
      name: '自定义图片',
      emoji: '📷',
      isCustom: true
    }
  }
  reader.readAsDataURL(file)
}

// 开始游戏
const startGame = () => {
  if (!selectedDifficulty.value || !selectedImage.value) return
  
  gameStarted.value = true
  gameCompleted.value = false
  gamePaused.value = false
  gameTime.value = 0
  moves.value = 0
  
  initializePuzzle()
  startTimer()
}

// 初始化拼图
const initializePuzzle = async () => {
  const totalPieces = gridSize.value * gridSize.value
  
  // 创建正确顺序 (0 到 n-2, 最后一个是空白)
  correctOrder.value = Array.from({ length: totalPieces - 1 }, (_, i) => i)
  correctOrder.value.push(null)
  
  // 初始化拼图数组
  puzzlePieces.value = [...correctOrder.value]
  emptyIndex.value = totalPieces - 1
  
  await nextTick()
  
  // 绘制参考图片和拼图块
  drawReferenceImage()
  drawPuzzlePieces()
  
  // 打乱拼图
  shufflePuzzle()
}

// 绘制参考图片
const drawReferenceImage = () => {
  const canvas = referenceCanvas.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  
  if (selectedImage.value.isCustom && customImageData.value) {
    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0, referenceSize, referenceSize)
    }
    img.src = customImageData.value
  } else {
    // 绘制渐变背景
    const gradient = ctx.createLinearGradient(0, 0, referenceSize, referenceSize)
    const colors = extractColorsFromGradient(selectedImage.value.gradient)
    colors.forEach((color, index) => {
      gradient.addColorStop(index / (colors.length - 1), color)
    })
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, referenceSize, referenceSize)
    
    // 绘制emoji
    ctx.font = '60px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.fillText(selectedImage.value.emoji, referenceSize / 2, referenceSize / 2)
  }
}

// 绘制拼图块
const drawPuzzlePieces = () => {
  nextTick(() => {
    const canvases = document.querySelectorAll('[data-piece]')
    canvases.forEach(canvas => {
      const pieceIndex = parseInt(canvas.dataset.piece)
      drawPiece(canvas, pieceIndex)
    })
  })
}

// 绘制单个拼图块
const drawPiece = (canvas, pieceIndex) => {
  const ctx = canvas.getContext('2d')
  const row = Math.floor(pieceIndex / gridSize.value)
  const col = pieceIndex % gridSize.value
  
  if (selectedImage.value.isCustom && customImageData.value) {
    const img = new Image()
    img.onload = () => {
      const sourceX = col * (img.width / gridSize.value)
      const sourceY = row * (img.height / gridSize.value)
      const sourceWidth = img.width / gridSize.value
      const sourceHeight = img.height / gridSize.value
      
      ctx.drawImage(
        img,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, pieceSize.value, pieceSize.value
      )
      
      // 添加边框
      ctx.strokeStyle = '#333'
      ctx.lineWidth = 2
      ctx.strokeRect(0, 0, pieceSize.value, pieceSize.value)
    }
    img.src = customImageData.value
  } else {
    // 绘制渐变背景
    const gradient = ctx.createLinearGradient(0, 0, pieceSize.value, pieceSize.value)
    const colors = extractColorsFromGradient(selectedImage.value.gradient)
    colors.forEach((color, index) => {
      gradient.addColorStop(index / (colors.length - 1), color)
    })
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, pieceSize.value, pieceSize.value)
    
    // 绘制部分emoji
    const emojiSize = 60 * (puzzleSize / 300) // 根据拼图大小调整
    ctx.font = `${emojiSize}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    
    const emojiX = pieceSize.value / 2 - (col - (gridSize.value - 1) / 2) * pieceSize.value
    const emojiY = pieceSize.value / 2 - (row - (gridSize.value - 1) / 2) * pieceSize.value
    
    ctx.fillText(selectedImage.value.emoji, emojiX, emojiY)
    
    // 添加边框
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 2
    ctx.strokeRect(0, 0, pieceSize.value, pieceSize.value)
    
    // 添加编号 (调试用)
    ctx.font = '12px Arial'
    ctx.fillStyle = '#000'
    ctx.fillText(pieceIndex.toString(), 15, 15)
  }
}

// 从渐变字符串提取颜色
const extractColorsFromGradient = (gradientStr) => {
  const matches = gradientStr.match(/#[a-fA-F0-9]{6}/g)
  return matches || ['#667eea', '#764ba2']
}

// 检查是否可移动
const isMovable = (index) => {
  const emptyRow = Math.floor(emptyIndex.value / gridSize.value)
  const emptyCol = emptyIndex.value % gridSize.value
  const pieceRow = Math.floor(index / gridSize.value)
  const pieceCol = index % gridSize.value
  
  const rowDiff = Math.abs(emptyRow - pieceRow)
  const colDiff = Math.abs(emptyCol - pieceCol)
  
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)
}

// 移动拼图块
const movePiece = (index) => {
  if (gamePaused.value || !isMovable(index)) return
  
  // 交换位置
  const temp = puzzlePieces.value[index]
  puzzlePieces.value[index] = puzzlePieces.value[emptyIndex.value]
  puzzlePieces.value[emptyIndex.value] = temp
  
  emptyIndex.value = index
  moves.value++
  
  nextTick(() => {
    drawPuzzlePieces()
    checkCompletion()
  })
}

// 打乱拼图
const shufflePuzzle = () => {
  // 进行多次随机移动来打乱
  const shuffleMoves = 1000
  
  for (let i = 0; i < shuffleMoves; i++) {
    const movableIndices = []
    
    for (let j = 0; j < puzzlePieces.value.length; j++) {
      if (isMovable(j)) {
        movableIndices.push(j)
      }
    }
    
    if (movableIndices.length > 0) {
      const randomIndex = movableIndices[Math.floor(Math.random() * movableIndices.length)]
      
      // 静默移动 (不增加步数)
      const temp = puzzlePieces.value[randomIndex]
      puzzlePieces.value[randomIndex] = puzzlePieces.value[emptyIndex.value]
      puzzlePieces.value[emptyIndex.value] = temp
      emptyIndex.value = randomIndex
    }
  }
  
  nextTick(() => {
    drawPuzzlePieces()
  })
}

// 检查完成
const checkCompletion = () => {
  const isCompleted = puzzlePieces.value.every((piece, index) => {
    return piece === correctOrder.value[index]
  })
  
  if (isCompleted) {
    completeGame()
  }
}

// 完成游戏
const completeGame = () => {
  gameCompleted.value = true
  finalTime.value = gameTime.value
  finalMoves.value = moves.value
  stopTimer()
}

// 显示提示
const showHint = () => {
  // 找到一个可以移动且能让拼图更接近完成的块
  for (let i = 0; i < puzzlePieces.value.length; i++) {
    if (isMovable(i) && puzzlePieces.value[i] !== correctOrder.value[i]) {
      // 高亮提示
      const pieceElement = document.querySelector(`[data-piece="${puzzlePieces.value[i]}"]`)?.parentElement
      if (pieceElement) {
        pieceElement.style.boxShadow = '0 0 20px #ffc107'
        setTimeout(() => {
          pieceElement.style.boxShadow = ''
        }, 2000)
      }
      break
    }
  }
}

// 暂停游戏
const pauseGame = () => {
  gamePaused.value = !gamePaused.value
  
  if (gamePaused.value) {
    stopTimer()
  } else {
    startTimer()
  }
}

// 重置游戏
const resetGame = () => {
  stopTimer()
  gameTime.value = 0
  moves.value = 0
  gamePaused.value = false
  
  // 重置拼图
  puzzlePieces.value = [...correctOrder.value]
  emptyIndex.value = correctOrder.value.length - 1
  
  nextTick(() => {
    drawPuzzlePieces()
    shufflePuzzle()
    startTimer()
  })
}

// 新游戏
const newGame = () => {
  stopTimer()
  gameStarted.value = false
  gameCompleted.value = false
  selectedDifficulty.value = null
  selectedImage.value = null
  customImageData.value = null
}

// 再玩一次
const playAgain = () => {
  gameCompleted.value = false
  resetGame()
}

// 开始计时
const startTimer = () => {
  gameTimer = setInterval(() => {
    if (!gamePaused.value) {
      gameTime.value++
    }
  }, 1000)
}

// 停止计时
const stopTimer = () => {
  if (gameTimer) {
    clearInterval(gameTimer)
    gameTimer = null
  }
}

// 格式化时间
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 组件卸载
onUnmounted(() => {
  stopTimer()
})
</script>

<style scoped>
.puzzle-game {
  max-width: 900px;
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

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 15px;
  background: #f8f9fa;
  border-radius: 8px;
  min-width: 60px;
}

.info-label {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 5px;
}

.info-value {
  font-size: 16px;
  font-weight: bold;
  color: #2c3e50;
}

.game-setup {
  text-align: center;
  padding: 20px 0;
}

.difficulty-section,
.image-section {
  margin-bottom: 30px;
}

.difficulty-section h3,
.image-section h3 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.difficulty-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.difficulty-btn {
  padding: 15px;
  border: 2px solid #dee2e6;
  background: white;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.difficulty-btn:hover {
  border-color: #007bff;
  transform: translateY(-2px);
}

.difficulty-btn.active {
  border-color: #007bff;
  background: #e7f3ff;
}

.diff-icon {
  font-size: 20px;
  margin-bottom: 5px;
}

.diff-name {
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 3px;
}

.diff-desc {
  font-size: 12px;
  color: #6c757d;
}

.image-options {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.preset-images {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 15px;
}

.image-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  border: 2px solid #dee2e6;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.image-option:hover {
  border-color: #28a745;
  transform: translateY(-2px);
}

.image-option.active {
  border-color: #28a745;
  background: #e8f5e8;
}

.image-preview {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.image-emoji {
  font-size: 24px;
}

.image-name {
  font-size: 12px;
  color: #495057;
  font-weight: bold;
}

.custom-upload {
  display: flex;
  justify-content: center;
}

.upload-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-btn:hover {
  background: #545b62;
}

.start-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-btn:hover:not(:disabled) {
  background: #218838;
  transform: translateY(-2px);
}

.start-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.reference-image {
  text-align: center;
}

.reference-image h4 {
  color: #495057;
  margin-bottom: 10px;
}

.reference-preview {
  border: 2px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
  display: inline-block;
}

.puzzle-area {
  display: flex;
  justify-content: center;
}

.puzzle-board {
  display: grid;
  gap: 2px;
  background: #333;
  border: 3px solid #2c3e50;
  border-radius: 8px;
  overflow: hidden;
}

.puzzle-piece {
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.puzzle-piece.empty {
  background: #333;
  cursor: default;
}

.puzzle-piece.movable:hover {
  transform: scale(1.02);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.puzzle-piece canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.game-controls {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;
}

.control-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pause-btn {
  background: #ffc107;
  color: #212529;
}

.pause-btn:hover {
  background: #e0a800;
}

.shuffle-btn {
  background: #17a2b8;
  color: white;
}

.shuffle-btn:hover {
  background: #138496;
}

.hint-btn {
  background: #fd7e14;
  color: white;
}

.hint-btn:hover {
  background: #e8590c;
}

.reset-btn {
  background: #6c757d;
  color: white;
}

.reset-btn:hover {
  background: #545b62;
}

.new-btn {
  background: #007bff;
  color: white;
}

.new-btn:hover {
  background: #0056b3;
}

.game-completed-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.completed-content {
  background: white;
  padding: 40px;
  border-radius: 16px;
  text-align: center;
  max-width: 400px;
  width: 90%;
}

.completed-content h3 {
  color: #28a745;
  margin-bottom: 25px;
  font-size: 24px;
}

.completion-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 16px;
  font-weight: bold;
  color: #2c3e50;
}

.completion-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.play-again-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.play-again-btn:hover {
  background: #218838;
}

.new-game-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.new-game-btn:hover {
  background: #0056b3;
}

.game-instructions {
  margin-top: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #fd7e14;
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
  .puzzle-game {
    padding: 15px;
  }
  
  .game-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .game-info {
    justify-content: center;
  }
  
  .difficulty-buttons {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .preset-images {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .game-controls {
    gap: 10px;
  }
  
  .control-btn {
    padding: 8px 16px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .preset-images {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .image-preview {
    width: 50px;
    height: 50px;
  }
  
  .image-emoji {
    font-size: 20px;
  }
}
</style>