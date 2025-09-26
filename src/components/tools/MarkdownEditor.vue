<template>
  <div class="markdown-editor-container">
    <!-- 工具栏 -->
    <div class="toolbar" role="toolbar" aria-label="Markdown编辑器工具栏">
      <div class="toolbar-left">
        <el-button 
          @click="$router.push('/')" 
          :icon="House" 
          class="back-btn"
          aria-label="返回首页"
        >
          返回首页
        </el-button>
        
        <el-button 
          @click="newFile" 
          :icon="Document"
          aria-label="新建文件"
        >
          新建
        </el-button>
        
        <el-button 
          @click="openFile" 
          :icon="Folder"
          aria-label="打开文件"
        >
          打开
        </el-button>
        
        <!-- 保存按钮 -->
        <el-button 
          @click="saveFile" 
          :icon="Download"
          type="primary"
          aria-label="保存文件"
        >
          保存
        </el-button>
        
        <!-- 另存为按钮 -->
        <el-button 
          @click="showSaveAsDialog" 
          :icon="CopyDocument"
          aria-label="另存为"
        >
          另存为
        </el-button>
        
        <!-- 导出HTML按钮 -->
        <el-button 
          @click="exportAsHtml" 
          :icon="Document"
          aria-label="导出为HTML"
        >
          导出HTML
        </el-button>
        
        <!-- 表情符号按钮 -->
        <el-button
          @click="openEmojiDialog"
          title="插入表情符号"
          aria-label="插入表情符号"
        >
          <span class="emoji-toolbar-icon" role="img" aria-label="表情符号">😀</span>
        </el-button>
        
        <!-- 水平分割线按钮 -->
        <el-button
          @click="insertHorizontalRule"
          title="插入水平分割线"
          aria-label="插入水平分割线"
        >
          <span role="img" aria-label="水平分割线">➖</span>
        </el-button>
      </div>
      <div class="toolbar-right">
        <span class="file-info" v-if="currentFileName">
          {{ currentFileName }}{{ hasChanges ? ' *' : '' }}
        </span>
        <span class="word-count">{{ wordCount }} 字</span>
      </div>
    </div>

    <!-- 编辑器区域 -->
    <div class="editor-wrapper" role="main" aria-label="Markdown编辑器主体">
      <MdEditor
        ref="mdEditor"
        v-model="content"
        :theme="editorTheme"
        :preview-theme="previewTheme"
        :code-theme="codeTheme"
        :toolbars="toolbars"
        :footers="footers"
        :toolbars-exclude="toolbarsExclude"
        :height="editorHeight"
        :preview-options="previewOptions"
        @onChange="handleContentChange"
        @onUploadImg="handleUploadImage"
        :aria-label="'Markdown编辑器，当前内容长度：' + content.length + '个字符'"
        :aria-describedby="'editor-description'"
        :key="editorKey"
      />
      
      <!-- 屏幕阅读器描述 -->
      <div id="editor-description" class="sr-only">
        这是一个Markdown编辑器，支持实时预览。您可以使用工具栏按钮或快捷键来格式化文本。
        当前文档{{ hasChanges ? '已修改' : '未修改' }}，字数统计：{{ wordCount }}字。
      </div>
    </div>

    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInput"
      type="file"
      accept=".md,.markdown,.txt"
      @change="handleFileSelect"
      style="display: none"
    />

    <!-- 链接插入对话框 -->
    <el-dialog
      v-model="linkDialogVisible"
      title="插入链接"
      width="400px"
      :modal="true"
      :close-on-click-modal="false"
      :close-on-press-escape="true"
      role="dialog"
      aria-labelledby="link-dialog-title"
      aria-describedby="link-dialog-description"
    >
      <div id="link-dialog-description" class="sr-only">
        填写链接信息以插入到编辑器中
      </div>
      
      <el-form :model="linkForm" label-width="80px">
        <el-form-item label="链接文本" required>
          <el-input 
            v-model="linkForm.text" 
            placeholder="请输入链接显示文本"
            aria-label="链接显示文本"
            aria-required="true"
          />
        </el-form-item>
        <el-form-item label="链接地址" required>
          <el-input 
            v-model="linkForm.url" 
            placeholder="请输入链接地址"
            aria-label="链接地址"
            aria-required="true"
          />
        </el-form-item>
        <el-form-item label="链接标题">
          <el-input 
            v-model="linkForm.title" 
            placeholder="请输入链接标题（可选）"
            aria-label="链接标题，可选"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleLinkDialogClose" aria-label="取消插入链接">取消</el-button>
          <el-button type="primary" @click="insertLink" aria-label="确认插入链接">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 表情符号选择对话框 -->
    <el-dialog
      v-model="showEmojiDialog"
      title="选择表情符号"
      width="500px"
      :modal="true"
      :close-on-click-modal="true"
      :close-on-press-escape="true"
      role="dialog"
      aria-labelledby="emoji-dialog-title"
      aria-describedby="emoji-dialog-description"
    >
      <div id="emoji-dialog-description" class="sr-only">
        选择表情符号插入到编辑器中
      </div>
      
      <div class="emoji-dialog-container" role="region" aria-label="表情符号选择区域">
        <div class="emoji-container">
          <div class="emoji-categories">
            <el-button
              v-for="category in emojiCategories"
              :key="category.key"
              :type="currentEmojiCategory === category.key ? 'primary' : 'default'"
              size="small"
              @click="currentEmojiCategory = category.key"
              class="emoji-category-btn"
              :aria-label="`选择${category.name}分类`"
            >
              {{ category.name }}
            </el-button>
          </div>
          <div class="emoji-grid">
            <div
              v-for="emoji in currentCategoryEmojis"
              :key="emoji.code"
              class="emoji-item"
              @click="insertEmoji(emoji.emoji)"
              :title="emoji.name"
              role="button"
              tabindex="0"
              :aria-label="`插入表情符号 ${emoji.name}`"
            >
              <span class="emoji-symbol">{{ emoji.emoji }}</span>
              <span class="emoji-name">{{ emoji.name }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleEmojiDialogClose">取消</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { MdEditor, NormalToolbar } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { ElMessageBox, ElButton } from 'element-plus'
import { House, Document, Folder, Download, CopyDocument } from '@element-plus/icons-vue'

export default {
  name: 'MarkdownEditor',
  components: {
    MdEditor,
    NormalToolbar,
    ElButton
  },
  data() {
    return {
      content: '',
      originalContent: '',
      currentFileName: '',
      hasChanges: false,
      editorTheme: 'light',
      previewTheme: 'default',
      codeTheme: 'atom',
      editorHeight: '600px',
      editorKey: 0,
      autoSaveTimer: null,
      base64Observer: null,
      
      // 工具栏配置
      toolbars: [
        'bold', 'underline', 'italic', 'strikeThrough', '-',
        'title', 'sub', 'sup', 'quote', 'unorderedList', 'orderedList', 'task', '-',
        'codeRow', 'code', 'link', 'image', 'table', 'mermaid', 'katex', '-',
        'revoke', 'next', 'save', '=', 'pageFullscreen', 'fullscreen', 'preview', 'htmlPreview', 'catalog'
      ],
      footers: ['markdownTotal', '=', 'scrollSwitch'],
      toolbarsExclude: [],
      
      // 预览配置
      previewOptions: {
        linkTarget: '_blank',
        allowedElements: undefined,
        disallowedElements: undefined,
        rehypePlugins: []
      },
      
      // 链接对话框
      linkDialogVisible: false,
      linkForm: {
        text: '',
        url: '',
        title: ''
      },
      
      // 表情符号对话框
      showEmojiDialog: false,
      currentEmojiCategory: 'smileys',
      emojiCategories: [
        { key: 'smileys', name: '笑脸' },
        { key: 'people', name: '人物' },
        { key: 'nature', name: '自然' },
        { key: 'food', name: '食物' },
        { key: 'activities', name: '活动' },
        { key: 'travel', name: '旅行' },
        { key: 'objects', name: '物品' },
        { key: 'symbols', name: '符号' }
      ],
      emojiData: {
        smileys: [
          { emoji: '😀', name: '开心', code: 'grinning' },
          { emoji: '😃', name: '大笑', code: 'smiley' },
          { emoji: '😄', name: '笑眯眯', code: 'smile' },
          { emoji: '😁', name: '咧嘴笑', code: 'grin' },
          { emoji: '😆', name: '哈哈', code: 'laughing' },
          { emoji: '😅', name: '苦笑', code: 'sweat_smile' },
          { emoji: '🤣', name: '笑哭', code: 'rofl' },
          { emoji: '😂', name: '喜极而泣', code: 'joy' },
          { emoji: '🙂', name: '微笑', code: 'slightly_smiling_face' },
          { emoji: '🙃', name: '倒脸', code: 'upside_down_face' },
          { emoji: '😉', name: '眨眼', code: 'wink' },
          { emoji: '😊', name: '开心', code: 'blush' },
          { emoji: '😇', name: '天使', code: 'innocent' },
          { emoji: '🥰', name: '爱心眼', code: 'smiling_face_with_hearts' },
          { emoji: '😍', name: '花痴', code: 'heart_eyes' },
          { emoji: '🤩', name: '星星眼', code: 'star_struck' },
          { emoji: '😘', name: '飞吻', code: 'kissing_heart' },
          { emoji: '😗', name: '亲亲', code: 'kissing' },
          { emoji: '☺️', name: '害羞', code: 'relaxed' },
          { emoji: '😚', name: '闭眼亲', code: 'kissing_closed_eyes' }
        ],
        people: [
          { emoji: '👶', name: '婴儿', code: 'baby' },
          { emoji: '🧒', name: '儿童', code: 'child' },
          { emoji: '👦', name: '男孩', code: 'boy' },
          { emoji: '👧', name: '女孩', code: 'girl' },
          { emoji: '🧑', name: '成人', code: 'adult' },
          { emoji: '👱', name: '金发人', code: 'blond_haired_person' },
          { emoji: '👨', name: '男人', code: 'man' },
          { emoji: '🧔', name: '络腮胡男人', code: 'bearded_person' },
          { emoji: '👩', name: '女人', code: 'woman' },
          { emoji: '🧓', name: '老人', code: 'older_adult' },
          { emoji: '👴', name: '老爷爷', code: 'older_man' },
          { emoji: '👵', name: '老奶奶', code: 'older_woman' },
          { emoji: '👮', name: '警察', code: 'police_officer' },
          { emoji: '🕵️', name: '侦探', code: 'detective' },
          { emoji: '💂', name: '卫兵', code: 'guard' },
          { emoji: '👷', name: '建筑工人', code: 'construction_worker' },
          { emoji: '🤴', name: '王子', code: 'prince' },
          { emoji: '👸', name: '公主', code: 'princess' },
          { emoji: '👳', name: '戴头巾的人', code: 'person_with_turban' },
          { emoji: '👲', name: '戴瓜皮帽的人', code: 'man_with_gua_pi_mao' }
        ],
        nature: [
          { emoji: '🐶', name: '狗脸', code: 'dog' },
          { emoji: '🐱', name: '猫脸', code: 'cat' },
          { emoji: '🐭', name: '鼠脸', code: 'mouse' },
          { emoji: '🐹', name: '仓鼠脸', code: 'hamster' },
          { emoji: '🐰', name: '兔脸', code: 'rabbit' },
          { emoji: '🦊', name: '狐狸脸', code: 'fox_face' },
          { emoji: '🐻', name: '熊脸', code: 'bear' },
          { emoji: '🐼', name: '熊猫脸', code: 'panda_face' },
          { emoji: '🐨', name: '考拉', code: 'koala' },
          { emoji: '🐯', name: '老虎脸', code: 'tiger' },
          { emoji: '🦁', name: '狮子脸', code: 'lion' },
          { emoji: '🐮', name: '牛脸', code: 'cow' },
          { emoji: '🐷', name: '猪脸', code: 'pig' },
          { emoji: '🐸', name: '青蛙脸', code: 'frog' },
          { emoji: '🐵', name: '猴脸', code: 'monkey_face' },
          { emoji: '🌸', name: '樱花', code: 'cherry_blossom' },
          { emoji: '🌺', name: '木槿花', code: 'hibiscus' },
          { emoji: '🌻', name: '向日葵', code: 'sunflower' },
          { emoji: '🌹', name: '玫瑰', code: 'rose' },
          { emoji: '🌷', name: '郁金香', code: 'tulip' }
        ],
        food: [
          { emoji: '🍎', name: '红苹果', code: 'apple' },
          { emoji: '🍊', name: '橘子', code: 'tangerine' },
          { emoji: '🍋', name: '柠檬', code: 'lemon' },
          { emoji: '🍌', name: '香蕉', code: 'banana' },
          { emoji: '🍉', name: '西瓜', code: 'watermelon' },
          { emoji: '🍇', name: '葡萄', code: 'grapes' },
          { emoji: '🍓', name: '草莓', code: 'strawberry' },
          { emoji: '🍈', name: '甜瓜', code: 'melon' },
          { emoji: '🍒', name: '樱桃', code: 'cherries' },
          { emoji: '🍑', name: '桃子', code: 'peach' },
          { emoji: '🥭', name: '芒果', code: 'mango' },
          { emoji: '🍍', name: '菠萝', code: 'pineapple' },
          { emoji: '🥥', name: '椰子', code: 'coconut' },
          { emoji: '🥝', name: '猕猴桃', code: 'kiwi_fruit' },
          { emoji: '🍅', name: '番茄', code: 'tomato' },
          { emoji: '🍆', name: '茄子', code: 'eggplant' },
          { emoji: '🥑', name: '牛油果', code: 'avocado' },
          { emoji: '🥦', name: '西兰花', code: 'broccoli' },
          { emoji: '🥒', name: '黄瓜', code: 'cucumber' },
          { emoji: '🌶️', name: '辣椒', code: 'hot_pepper' }
        ],
        activities: [
          { emoji: '⚽', name: '足球', code: 'soccer' },
          { emoji: '🏀', name: '篮球', code: 'basketball' },
          { emoji: '🏈', name: '美式足球', code: 'football' },
          { emoji: '⚾', name: '棒球', code: 'baseball' },
          { emoji: '🥎', name: '垒球', code: 'softball' },
          { emoji: '🎾', name: '网球', code: 'tennis' },
          { emoji: '🏐', name: '排球', code: 'volleyball' },
          { emoji: '🏉', name: '橄榄球', code: 'rugby_football' },
          { emoji: '🥏', name: '飞盘', code: 'flying_disc' },
          { emoji: '🎱', name: '台球', code: 'pool_8_ball' },
          { emoji: '🏓', name: '乒乓球', code: 'ping_pong' },
          { emoji: '🏸', name: '羽毛球', code: 'badminton' },
          { emoji: '🥅', name: '球门', code: 'goal_net' },
          { emoji: '⛳', name: '高尔夫', code: 'golf' },
          { emoji: '🏹', name: '射箭', code: 'bow_and_arrow' },
          { emoji: '🎣', name: '钓鱼', code: 'fishing_pole' },
          { emoji: '🤿', name: '潜水', code: 'diving_mask' },
          { emoji: '🥊', name: '拳击手套', code: 'boxing_glove' },
          { emoji: '🥋', name: '武术服', code: 'martial_arts_uniform' },
          { emoji: '🎪', name: '马戏团', code: 'circus_tent' }
        ],
        travel: [
          { emoji: '🚗', name: '汽车', code: 'car' },
          { emoji: '🚕', name: '出租车', code: 'taxi' },
          { emoji: '🚙', name: 'SUV', code: 'blue_car' },
          { emoji: '🚌', name: '公交车', code: 'bus' },
          { emoji: '🚎', name: '无轨电车', code: 'trolleybus' },
          { emoji: '🏎️', name: '赛车', code: 'racing_car' },
          { emoji: '🚓', name: '警车', code: 'police_car' },
          { emoji: '🚑', name: '救护车', code: 'ambulance' },
          { emoji: '🚒', name: '消防车', code: 'fire_engine' },
          { emoji: '🚐', name: '小巴', code: 'minibus' },
          { emoji: '🛻', name: '皮卡', code: 'pickup_truck' },
          { emoji: '🚚', name: '货车', code: 'truck' },
          { emoji: '🚛', name: '拖车', code: 'articulated_lorry' },
          { emoji: '🚜', name: '拖拉机', code: 'tractor' },
          { emoji: '🏍️', name: '摩托车', code: 'motorcycle' },
          { emoji: '🛵', name: '踏板车', code: 'motor_scooter' },
          { emoji: '🚲', name: '自行车', code: 'bicycle' },
          { emoji: '🛴', name: '滑板车', code: 'kick_scooter' },
          { emoji: '✈️', name: '飞机', code: 'airplane' },
          { emoji: '🚁', name: '直升机', code: 'helicopter' }
        ],
        objects: [
          { emoji: '💡', name: '灯泡', code: 'bulb' },
          { emoji: '🔦', name: '手电筒', code: 'flashlight' },
          { emoji: '🕯️', name: '蜡烛', code: 'candle' },
          { emoji: '🪔', name: '油灯', code: 'diya_lamp' },
          { emoji: '🔥', name: '火', code: 'fire' },
          { emoji: '💥', name: '爆炸', code: 'boom' },
          { emoji: '💫', name: '眩晕', code: 'dizzy' },
          { emoji: '⭐', name: '星星', code: 'star' },
          { emoji: '🌟', name: '闪亮星星', code: 'star2' },
          { emoji: '✨', name: '闪光', code: 'sparkles' },
          { emoji: '⚡', name: '闪电', code: 'zap' },
          { emoji: '☄️', name: '彗星', code: 'comet' },
          { emoji: '💎', name: '钻石', code: 'gem' },
          { emoji: '🔮', name: '水晶球', code: 'crystal_ball' },
          { emoji: '🪄', name: '魔法棒', code: 'magic_wand' },
          { emoji: '📱', name: '手机', code: 'iphone' },
          { emoji: '💻', name: '笔记本电脑', code: 'computer' },
          { emoji: '⌨️', name: '键盘', code: 'keyboard' },
          { emoji: '🖥️', name: '台式电脑', code: 'desktop_computer' },
          { emoji: '🖨️', name: '打印机', code: 'printer' }
        ],
        symbols: [
          { emoji: '❤️', name: '红心', code: 'heart' },
          { emoji: '🧡', name: '橙心', code: 'orange_heart' },
          { emoji: '💛', name: '黄心', code: 'yellow_heart' },
          { emoji: '💚', name: '绿心', code: 'green_heart' },
          { emoji: '💙', name: '蓝心', code: 'blue_heart' },
          { emoji: '💜', name: '紫心', code: 'purple_heart' },
          { emoji: '🖤', name: '黑心', code: 'black_heart' },
          { emoji: '🤍', name: '白心', code: 'white_heart' },
          { emoji: '🤎', name: '棕心', code: 'brown_heart' },
          { emoji: '💔', name: '心碎', code: 'broken_heart' },
          { emoji: '❣️', name: '心形感叹号', code: 'heavy_heart_exclamation' },
          { emoji: '💕', name: '两颗心', code: 'two_hearts' },
          { emoji: '💞', name: '旋转的心', code: 'revolving_hearts' },
          { emoji: '💓', name: '心跳', code: 'heartbeat' },
          { emoji: '💗', name: '成长的心', code: 'heartpulse' },
          { emoji: '💖', name: '闪亮的心', code: 'sparkling_heart' },
          { emoji: '💘', name: '丘比特之箭', code: 'cupid' },
          { emoji: '💝', name: '心形礼物', code: 'gift_heart' },
          { emoji: '💟', name: '心形装饰', code: 'heart_decoration' },
          { emoji: '☮️', name: '和平符号', code: 'peace_symbol' }
        ]
      }
    }
  },
  computed: {
    // 字数统计
    wordCount() {
      if (!this.content) return 0
      const text = this.content.replace(/[#*`\-\[\]()]/g, '').trim()
      return text ? text.split(/\s+/).length : 0
    },
    
    // 当前分类的表情符号
    currentCategoryEmojis() {
      const category = this.currentEmojiCategory
      return this.emojiData[category] || []
    }
  },
  mounted() {
    this.calculateEditorHeight()
    window.addEventListener('resize', this.calculateEditorHeight)
    this.loadAutoSavedContent()
    this.setupAutoSave()
    
    // 强制重新渲染编辑器以解决offsetTop错误
    this.$nextTick(() => {
      this.editorKey++
    })
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.calculateEditorHeight)
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer)
    }
  },
  methods: {
    // 计算编辑器高度
    calculateEditorHeight() {
      const toolbar = document.querySelector('.toolbar')
      const toolbarHeight = toolbar ? toolbar.offsetHeight : 60
      const windowHeight = window.innerHeight
      const headerHeight = 80
      const padding = 40
      
      this.editorHeight = `${windowHeight - toolbarHeight - headerHeight - padding}px`
    },
    
    // 新建文件
    async newFile() {
      if (this.hasChanges) {
        try {
          await ElMessageBox.confirm(
            '当前文件有未保存的更改，确定要新建文件吗？',
            '新建文件',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
          )
        } catch (error) {
          return
        }
      }
      
      this.content = ''
      this.originalContent = ''
      this.currentFileName = ''
      this.hasChanges = false
      this.$message.success('新建文件成功')
    },
    
    // 打开文件
    openFile() {
      this.$refs.fileInput.click()
    },
    
    // 处理文件选择
    handleFileSelect(event) {
      const file = event.target.files[0]
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = (e) => {
        this.content = e.target.result
        this.originalContent = this.content
        this.currentFileName = file.name
        this.hasChanges = false
        this.$message.success('文件打开成功')
      }
      reader.readAsText(file)
    },
    
    // 显示另存为对话框
    showSaveDialog() {
      this.$prompt('请输入文件名:', '保存', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: this.currentFileName || 'document.md',
        inputPattern: /^.+\.(md|txt|markdown)$/,
        inputErrorMessage: '文件名格式不正确，请使用 .md、.txt 或 .markdown 扩展名'
      }).then(({ value }) => {
        this.saveFileWithName(value)
      }).catch(() => {
        // 用户取消操作
      })
    },

    showSaveAsDialog() {
      this.$prompt('请输入文件名:', '另存为', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: this.currentFileName || 'document.md',
        inputPattern: /^.+\.(md|txt|markdown)$/,
        inputErrorMessage: '文件名格式不正确，请使用 .md、.txt 或 .markdown 扩展名'
      }).then(({ value }) => {
        this.saveAsFileWithName(value)
      }).catch(() => {
        // 用户取消操作
      })
    },

    // 使用指定文件名保存
    saveFileWithName(fileName) {
      // 显示保存中的加载状态
      const loading = this.$loading({
        lock: true,
        text: '正在保存文件...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      
      try {
        const blob = new Blob([this.content], { type: 'text/markdown' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        // 更新当前文件名和状态
        this.currentFileName = fileName
        this.originalContent = this.content
        this.hasChanges = false
        
        // 延迟关闭加载状态，让用户看到保存过程
        setTimeout(() => {
          loading.close()
          this.$message({
            message: `文件 "${fileName}" 保存成功`,
            type: 'success',
            duration: 3000,
            showClose: true
          })
        }, 500)
      } catch (error) {
        loading.close()
        this.$message.error('文件保存失败，请重试')
        console.error('保存文件时出错:', error)
      }
    },

    // 使用指定文件名另存为
    saveAsFileWithName(fileName) {
      // 显示保存中的加载状态
      const loading = this.$loading({
        lock: true,
        text: '正在另存为文件...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      
      try {
        const blob = new Blob([this.content], { type: 'text/markdown' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        this.currentFileName = fileName
        this.originalContent = this.content
        this.hasChanges = false
        
        // 延迟关闭加载状态，让用户看到保存过程
        setTimeout(() => {
          loading.close()
          this.$message({
            message: `文件已另存为: "${fileName}"`,
            type: 'success',
            duration: 3000,
            showClose: true
          })
        }, 500)
      } catch (error) {
        loading.close()
        this.$message.error('文件另存为失败，请重试')
        console.error('另存为文件时出错:', error)
      }
    },

    // 导出为HTML
    exportAsHtml() {
      // 显示导出中的加载状态
      const loading = this.$loading({
        lock: true,
        text: '正在导出HTML文件...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      
      try {
        // 获取预览的HTML内容
        const previewElement = document.querySelector('.md-editor-preview')
        if (!previewElement) {
          loading.close()
          this.$message.error('无法获取预览内容，请确保预览模式已开启')
          return
        }
        
        const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.currentFileName || 'Document'}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1, h2, h3, h4, h5, h6 { color: #333; }
        code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
        pre { background: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }
        blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 20px; color: #666; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
${previewElement.innerHTML}
</body>
</html>`
        
        const blob = new Blob([htmlContent], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = (this.currentFileName || 'document').replace(/\.(md|txt|markdown)$/, '') + '.html'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        // 延迟关闭加载状态
        setTimeout(() => {
          loading.close()
          this.$message({
            message: 'HTML文件导出成功',
            type: 'success',
            duration: 3000,
            showClose: true
          })
        }, 500)
      } catch (error) {
        loading.close()
        this.$message.error('HTML文件导出失败，请重试')
        console.error('导出HTML文件时出错:', error)
      }
    },

    // 保存文件
    saveFile() {
      // 如果没有文件名或内容为空，显示保存对话框
      if (!this.currentFileName || this.currentFileName.trim() === '') {
        this.showSaveDialog()
        return
      }
      
      // 显示保存中的加载状态
      const loading = this.$loading({
        lock: true,
        text: '正在保存文件...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      
      try {
        const blob = new Blob([this.content], { type: 'text/markdown' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = this.currentFileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        this.originalContent = this.content
        this.hasChanges = false
        
        // 延迟关闭加载状态，让用户看到保存过程
        setTimeout(() => {
          loading.close()
          this.$message({
            message: `文件 "${this.currentFileName}" 保存成功`,
            type: 'success',
            duration: 3000,
            showClose: true
          })
        }, 500)
      } catch (error) {
        loading.close()
        this.$message.error('文件保存失败，请重试')
        console.error('保存文件时出错:', error)
      }
    },

    // 另存为文件（保留原方法以兼容）
    saveAsFile() {
      this.showSaveAsDialog()
    },
    
    // 处理内容变化
    handleContentChange(value) {
      this.hasChanges = value !== this.originalContent
    },
    
    // 处理链接对话框关闭
    handleLinkDialogClose() {
      this.linkDialogVisible = false
      this.linkForm = {
        text: '',
        url: '',
        title: ''
      }
    },
    
    // 插入链接
    insertLink() {
      if (!this.linkForm.url.trim()) {
        this.$message.warning('请输入链接地址')
        return
      }
      
      let linkText = this.linkForm.text.trim() || this.linkForm.url
      let linkMarkdown = `[${linkText}](${this.linkForm.url})`
      
      if (this.linkForm.title.trim()) {
        linkMarkdown = `[${linkText}](${this.linkForm.url} "${this.linkForm.title}")`
      }
      
      this.insertTextAtCursor(linkMarkdown)
      this.handleLinkDialogClose()
      this.$message.success('链接插入成功')
    },
    
    // 处理表情符号对话框关闭
    handleEmojiDialogClose() {
      this.showEmojiDialog = false
      this.currentEmojiCategory = 'smileys'
    },
    
    // 打开表情符号对话框
    openEmojiDialog() {
      this.showEmojiDialog = true
    },
    
    // 插入表情符号
    insertEmoji(emoji) {
      this.insertTextAtCursor(emoji)
      this.handleEmojiDialogClose()
      this.$message.success('表情符号插入成功')
    },
    
    // 插入水平分割线
    insertHorizontalRule() {
      this.insertTextAtCursor('\n---\n')
      this.$message.success('水平分割线插入成功')
    },
    
    // 在光标位置插入文本
    insertTextAtCursor(text) {
      const editor = this.$refs.mdEditor
      if (editor && editor.insertText) {
        editor.insertText(text)
      } else {
        this.content += text
      }
    },
    
    // 加载自动保存的内容
    loadAutoSavedContent() {
      const saved = localStorage.getItem('markdown-editor-autosave')
      if (saved) {
        this.content = saved
        this.hasChanges = true
      }
    },
    
    // 设置自动保存
    setupAutoSave() {
      this.autoSaveTimer = setInterval(() => {
        if (this.content) {
          localStorage.setItem('markdown-editor-autosave', this.content)
        }
      }, 30000) // 每30秒自动保存
    },
    
    // 处理图片上传
    handleUploadImage(files, callback) {
      const file = files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          callback([e.target.result])
        }
        reader.readAsDataURL(file)
      }
    }
  }
}
</script>

<style scoped>
.markdown-editor-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #fff;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
}

.toolbar-left {
  display: flex;
  gap: 10px;
  align-items: center;
}

.toolbar-right {
  display: flex;
  gap: 15px;
  align-items: center;
  font-size: 14px;
  color: #666;
}

.back-btn {
  margin-right: 10px;
}

.file-info {
  font-weight: 500;
  color: #333;
}

.word-count {
  color: #999;
}

.editor-wrapper {
  flex: 1;
  overflow: hidden;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.emoji-dialog-container {
  max-height: 400px;
  overflow-y: auto;
}

.emoji-container {
  padding: 10px;
}

.emoji-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.emoji-category-btn {
  font-size: 12px;
  padding: 5px 10px;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.emoji-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  border: 1px solid #eee;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  background: #fff;
}

.emoji-item:hover {
  background: #f0f9ff;
  border-color: #409eff;
  transform: translateY(-1px);
}

.emoji-symbol {
  font-size: 20px;
  margin-bottom: 4px;
}

.emoji-name {
  font-size: 10px;
  color: #666;
  text-align: center;
  line-height: 1.2;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.emoji-toolbar-icon {
  font-size: 16px;
}

/* 预览区域链接样式优化 */
:deep(.md-editor-preview a) {
  color: #409eff;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: all 0.3s ease;
  cursor: pointer;
}

:deep(.md-editor-preview a:hover) {
  color: #66b1ff;
  border-bottom-color: #66b1ff;
  text-decoration: none;
}

:deep(.md-editor-preview a:visited) {
  color: #909399;
}

:deep(.md-editor-preview a:active) {
  color: #337ecc;
}
</style>