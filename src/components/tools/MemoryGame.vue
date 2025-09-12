<template>
  <div class="memory-game">
    <div class="tool-header">
      <button @click="$router.push('/')" class="back-btn">← 返回主页</button>
    </div>
    <div class="game-header">
      <h2>🧠 记忆游戏</h2>
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
          <span class="info-label">配对</span>
          <span class="info-value">{{ matchedPairs }}/{{ totalPairs }}</span>
        </div>
      </div>
    </div>

    <!-- 难度选择 -->
    <div v-if="!gameStarted" class="difficulty-selection">
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
          <div class="diff-desc">{{ diff.grid }}张卡片</div>
        </button>
      </div>
      <button 
        @click="startGame" 
        :disabled="!selectedDifficulty"
        class="start-btn"
      >
        开始游戏
      </button>
    </div>

    <!-- 游戏区域 -->
    <div v-else class="game-container">
      <div class="game-left">
        <!-- 游戏控制 -->
        <div class="game-controls">
          <button @click="pauseGame" class="control-btn pause-btn">
            {{ gamePaused ? '继续' : '暂停' }}
          </button>
          <button @click="resetGame" class="control-btn reset-btn">
            重新开始
          </button>
          <button @click="newGame" class="control-btn new-btn">
            新游戏
          </button>
        </div>
      </div>

      <div class="game-right">
        <div 
          class="game-board" 
          :style="{ 
            gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
            gridTemplateRows: `repeat(${gridRows}, 1fr)`
          }"
        >
          <div 
            v-for="(card, index) in cards" 
            :key="index"
            @click="flipCard(index)"
            class="card"
            :class="{
              flipped: card.isFlipped,
              matched: card.isMatched,
              disabled: isCardDisabled
            }"
          >
            <div class="card-inner">
              <div class="card-front">?</div>
              <div class="card-back">{{ card.symbol }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 游戏完成弹窗 -->
    <div v-if="gameCompleted" class="game-completed-overlay">
      <div class="completed-content">
        <h3>🎉 恭喜完成!</h3>
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
          <button @click="newGame" class="new-game-btn">选择难度</button>
        </div>
      </div>
    </div>

    <!-- 游戏说明 -->
    <div class="game-instructions">
      <h4>游戏说明:</h4>
      <ul>
        <li>点击卡片翻开，找到相同的符号进行配对</li>
        <li>每次只能翻开两张卡片</li>
        <li>配对成功的卡片会保持翻开状态</li>
        <li>用最少的步数和时间完成所有配对</li>
        <li>不同难度有不同数量的卡片</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

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
  { name: '简单', icon: '😊', grid: '4×3', rows: 3, cols: 4, pairs: 6 },
  { name: '中等', icon: '😐', grid: '4×4', rows: 4, cols: 4, pairs: 8 },
  { name: '困难', icon: '😤', grid: '6×4', rows: 4, cols: 6, pairs: 12 },
  { name: '专家', icon: '🤯', grid: '6×6', rows: 6, cols: 6, pairs: 18 }
]

const selectedDifficulty = ref(null)
const gridRows = computed(() => selectedDifficulty.value?.rows || 3)
const gridCols = computed(() => selectedDifficulty.value?.cols || 4)
const totalPairs = computed(() => selectedDifficulty.value?.pairs || 6)

// 卡片数据
const cards = ref([])
const flippedCards = ref([])
const matchedPairs = ref(0)

// 游戏符号
const symbols = ['🎈', '🎁', '🎂', '🎊', '🎉', '🎀', '🎯', '🎪', '🎨', '🎭', '🎪', '🎸', '🎺', '🎷', '🎹', '🎤', '🎧', '🎮', '🕹️', '🎲', '🃏', '🎳', '🎱', '🏀', '⚽', '🏈', '🎾', '🏐', '🏓', '🏸', '🥅', '🏹', '🎣', '🥊', '🥋', '🎽']

// 计时器
let gameTimer = null
const isCardDisabled = computed(() => flippedCards.value.length >= 2 || gamePaused.value)

// 选择难度
const selectDifficulty = (difficulty) => {
  selectedDifficulty.value = difficulty
}

// 开始游戏
const startGame = () => {
  if (!selectedDifficulty.value) return
  
  gameStarted.value = true
  gameCompleted.value = false
  gamePaused.value = false
  gameTime.value = 0
  moves.value = 0
  matchedPairs.value = 0
  flippedCards.value = []
  
  initializeCards()
  startTimer()
}

// 初始化卡片
const initializeCards = () => {
  const pairCount = totalPairs.value
  const gameSymbols = symbols.slice(0, pairCount)
  const cardSymbols = [...gameSymbols, ...gameSymbols]
  
  // 洗牌
  for (let i = cardSymbols.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[cardSymbols[i], cardSymbols[j]] = [cardSymbols[j], cardSymbols[i]]
  }
  
  cards.value = cardSymbols.map((symbol, index) => ({
    id: index,
    symbol,
    isFlipped: false,
    isMatched: false
  }))
}

// 翻牌
const flipCard = (index) => {
  if (isCardDisabled.value || cards.value[index].isFlipped || cards.value[index].isMatched) {
    return
  }
  
  cards.value[index].isFlipped = true
  flippedCards.value.push(index)
  
  if (flippedCards.value.length === 2) {
    moves.value++
    checkMatch()
  }
}

// 检查匹配
const checkMatch = () => {
  const [firstIndex, secondIndex] = flippedCards.value
  const firstCard = cards.value[firstIndex]
  const secondCard = cards.value[secondIndex]
  
  if (firstCard.symbol === secondCard.symbol) {
    // 匹配成功
    setTimeout(() => {
      firstCard.isMatched = true
      secondCard.isMatched = true
      matchedPairs.value++
      flippedCards.value = []
      
      // 检查游戏是否完成
      if (matchedPairs.value === totalPairs.value) {
        completeGame()
      }
    }, 500)
  } else {
    // 匹配失败
    setTimeout(() => {
      firstCard.isFlipped = false
      secondCard.isFlipped = false
      flippedCards.value = []
    }, 1000)
  }
}

// 完成游戏
const completeGame = () => {
  gameCompleted.value = true
  finalTime.value = gameTime.value
  finalMoves.value = moves.value
  stopTimer()
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
  matchedPairs.value = 0
  flippedCards.value = []
  gamePaused.value = false
  
  // 重置所有卡片
  cards.value.forEach(card => {
    card.isFlipped = false
    card.isMatched = false
  })
  
  // 重新洗牌
  const cardSymbols = cards.value.map(card => card.symbol)
  for (let i = cardSymbols.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[cardSymbols[i], cardSymbols[j]] = [cardSymbols[j], cardSymbols[i]]
  }
  
  cards.value.forEach((card, index) => {
    card.symbol = cardSymbols[index]
  })
  
  startTimer()
}

// 新游戏
const newGame = () => {
  stopTimer()
  gameStarted.value = false
  gameCompleted.value = false
  selectedDifficulty.value = null
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
.memory-game {
  width: 100vw;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.tool-header {
  text-align: left;
  margin-bottom: 20px;
}

.back-btn {
  background: linear-gradient(145deg, #6c757d, #5a6268);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 5px 15px rgba(108, 117, 125, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.back-btn:hover {
  background: linear-gradient(145deg, #5a6268, #495057);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 20px rgba(108, 117, 125, 0.4);
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.game-header h2 {
  color: #2c3e50;
  margin: 0;
  font-size: 2.5em;
  font-weight: 700;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.game-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 20px;
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
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

.difficulty-selection {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 30px;
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  flex: 1;
}

.difficulty-selection h3 {
  color: #2c3e50;
  margin-bottom: 40px;
  font-size: 2.2em;
  font-weight: 600;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.difficulty-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
}

.difficulty-btn {
  padding: 25px;
  border: 2px solid #dee2e6;
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.difficulty-btn:hover {
  border-color: #007bff;
  transform: translateY(-4px) scale(1.03);
  box-shadow: 0 15px 35px rgba(0, 123, 255, 0.2);
  background: linear-gradient(145deg, #f8f9fa, #e9ecef);
}

.difficulty-btn.active {
  border-color: #007bff;
  background: linear-gradient(145deg, #e7f3ff, #cce7ff);
  box-shadow: 0 12px 30px rgba(0, 123, 255, 0.25);
  transform: translateY(-2px);
}

.diff-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.diff-name {
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 5px;
}

.diff-desc {
  font-size: 12px;
  color: #6c757d;
}

.start-btn {
  background: linear-gradient(145deg, #28a745, #20c997);
  color: white;
  border: none;
  padding: 18px 36px;
  border-radius: 30px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 10px 25px rgba(40, 167, 69, 0.3);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.start-btn:hover:not(:disabled) {
  background: linear-gradient(145deg, #20c997, #17a2b8);
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 15px 35px rgba(40, 167, 69, 0.4);
}

.start-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.game-container {
  display: flex;
  gap: 30px;
  align-items: flex-start;
  flex: 1;
  min-height: 0;
}

.game-left {
  flex: 0 0 300px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.game-right {
  flex: 1;
  display: flex;
  justify-content: center;
}

.game-board {
  display: grid;
  gap: 15px;
  padding: 30px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.card {
  width: 80px;
  height: 80px;
  perspective: 1000px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.card.disabled {
  cursor: not-allowed;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
}

.card.flipped .card-inner {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.card-front {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.card-back {
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  color: #2c3e50;
  transform: rotateY(180deg);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.card.matched .card-back {
  background: linear-gradient(145deg, #d4edda, #c3e6cb);
  border-color: #28a745;
  animation: matchPulse 0.8s ease-in-out;
  box-shadow: 0 8px 25px rgba(40, 167, 69, 0.3);
}

@keyframes matchPulse {
  0%, 100% { transform: rotateY(180deg) scale(1); }
  50% { transform: rotateY(180deg) scale(1.1); }
}

.game-controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.control-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pause-btn {
  background: linear-gradient(145deg, #ffc107, #e0a800);
  color: #212529;
}

.pause-btn:hover {
  background: linear-gradient(145deg, #e0a800, #d39e00);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 20px rgba(255, 193, 7, 0.3);
}

.reset-btn {
  background: linear-gradient(145deg, #6c757d, #5a6268);
  color: white;
}

.reset-btn:hover {
  background: linear-gradient(145deg, #5a6268, #495057);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 20px rgba(108, 117, 125, 0.3);
}

.new-btn {
  background: linear-gradient(145deg, #17a2b8, #138496);
  color: white;
}

.new-btn:hover {
  background: linear-gradient(145deg, #138496, #117a8b);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 20px rgba(23, 162, 184, 0.3);
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
  border-left: 4px solid #17a2b8;
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
  .memory-game {
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
  
  .game-container {
    flex-direction: column;
    gap: 20px;
  }
  
  .game-left {
    flex: none;
    width: 100%;
  }
  
  .game-right {
    flex: none;
  }
  
  .difficulty-buttons {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .card {
    width: 50px;
    height: 50px;
  }
  
  .card-front,
  .card-back {
    font-size: 16px;
  }
  
  .game-controls {
    flex-direction: row;
    justify-content: center;
  }
  
  .control-btn {
    padding: 8px 16px;
    font-size: 14px;
  }
  
  .game-board {
    max-width: 100%;
    margin: 0 auto;
  }
}

@media (max-width: 480px) {
  .card {
    width: 45px;
    height: 45px;
  }
  
  .card-front,
  .card-back {
    font-size: 14px;
  }
  
  .game-board {
    gap: 8px;
    padding: 15px;
  }
}
</style>