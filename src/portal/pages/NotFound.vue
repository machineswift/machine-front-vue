<template>
  <div class="not-found-page">
    <div class="not-found-content">
      <!-- 404 信息 -->
      <div class="error-section">
        <div class="error-code">404</div>
        <div class="error-message">别找了，玩一把 2048 吧！</div>
        <div class="error-desc">使用方向键 / WASD 滑动合并方块，向 2048 发起冲击</div>
      </div>

      <!-- 2048 游戏 -->
      <div class="game-section">
        <!-- 状态栏 -->
        <div class="game-header">
          <div class="mode-switch">
            <button :class="['mode-btn', { active: gridSize === 4 }]" @click="changeMode(4)">4×4</button>
            <button :class="['mode-btn', { active: gridSize === 5 }]" @click="changeMode(5)">5×5</button>
          </div>
          <div class="scores">
            <div class="score-box">
              <span class="score-label">得分</span>
              <span class="score-value">{{ score }}</span>
            </div>
            <div class="score-box">
              <span class="score-label">最高</span>
              <span class="score-value best">{{ bestScore }}</span>
            </div>
          </div>
        </div>

        <!-- 棋盘 -->
        <div class="board-container">
          <div class="board" ref="boardRef" :style="{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }">
            <!-- 背景网格 -->
            <div v-for="idx in gridSize * gridSize" :key="'bg-' + idx" class="cell cell-empty"></div>
            <!-- 方块（绝对定位，通过 CSS transition 滑动） -->
            <div
              v-for="tile in tiles"
              :key="tile.id"
              :class="['tile', tileCSSClass(tile.value), { 'tile-new': tile.isNew, 'tile-merged': tile.isMerged }]"
              :style="tilePosStyle(tile)"
            >
              <span class="tile-num">{{ tile.value }}</span>
            </div>
          </div>

          <!-- 胜利弹窗 -->
          <Transition name="fade">
            <div v-if="gameWon && !keepPlaying" class="overlay">
              <div class="overlay-card">
                <div class="overlay-icon">🎉</div>
                <div class="overlay-title">恭喜达到 2048！</div>
                <div class="overlay-score">得分：{{ score }}</div>
                <div class="overlay-actions">
                  <button class="btn btn-primary" @click="continueGame">继续游戏</button>
                  <button class="btn btn-secondary" @click="newGame">再来一局</button>
                </div>
              </div>
            </div>
          </Transition>

          <!-- 失败弹窗 -->
          <Transition name="fade">
            <div v-if="gameOver" class="overlay">
              <div class="overlay-card">
                <div class="overlay-icon">😵</div>
                <div class="overlay-title">游戏结束</div>
                <div class="overlay-score">得分：{{ score }}</div>
                <div class="overlay-actions">
                  <button class="btn btn-primary" @click="newGame">再来一局</button>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <!-- 操作提示 -->
        <div class="game-footer">
          <span class="hint-text">⬆⬇⬅➡ 方向键 / WASD 移动</span>
          <button class="btn btn-new" @click="newGame">🔄 新游戏</button>
        </div>

        <!-- 移动端方向键 -->
        <div class="mobile-controls">
          <div class="dpad">
            <button class="dpad-btn up" @touchstart.prevent="move('up')" @click="move('up')">⬆</button>
            <div class="dpad-row">
              <button class="dpad-btn left" @touchstart.prevent="move('left')" @click="move('left')">⬅</button>
              <button class="dpad-btn center" disabled></button>
              <button class="dpad-btn right" @touchstart.prevent="move('right')" @click="move('right')">➡</button>
            </div>
            <button class="dpad-btn down" @touchstart.prevent="move('down')" @click="move('down')">⬇</button>
          </div>
        </div>
      </div>

      <!-- 底部操作 -->
      <div class="bottom-actions">
        <button class="btn btn-home" @click="goHome">🏠 {{ isAuthenticated ? '返回控制台首页' : '返回官网首页' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
  import { useRouter } from 'vue-router'
  import { useIamUserStore } from '@/shared/stores/IamUser.store'

  const router = useRouter()
  const userStore = useIamUserStore()
  const isAuthenticated = computed(() => userStore.isAuthenticated)

  function goHome() {
    router.push(userStore.isAuthenticated ? '/admin/home' : '/')
  }

  // ========== Tile 类型 ==========
  interface TileObj {
    id: number
    value: number
    row: number
    col: number
    isNew: boolean
    isMerged: boolean
  }

  interface LineMove {
    id: number
    fromIdx: number
    toIdx: number
  }
  interface LineMerge {
    survivorId: number
    absorbedId: number
    newValue: number
  }

  // ========== 游戏状态 ==========
  const gridSize = ref(4)
  const grid = ref<number[][]>([])
  const tiles = ref<TileObj[]>([])
  const score = ref(0)
  const bestScore = ref(0)
  const gameWon = ref(false)
  const gameOver = ref(false)
  const keepPlaying = ref(false)
  const isAnimating = ref(false)
  const boardRef = ref<HTMLElement | null>(null)
  const boardWidth = ref(0)

  let tileIdCounter = 0
  let resizeObs: ResizeObserver | null = null

  const ANIM_DURATION = 120 // ms, 与 CSS transition 一致

  // ========== Tile 位置计算 ==========
  function tilePosStyle(tile: TileObj): Record<string, string | number> {
    const bw = boardWidth.value
    if (!bw) return {}
    const n = gridSize.value
    const pad = 8
    const gap = 6
    const cs = (bw - pad * 2 - gap * (n - 1)) / n
    return {
      position: 'absolute',
      left: `${pad + tile.col * (cs + gap)}px`,
      top: `${pad + tile.row * (cs + gap)}px`,
      width: `${cs}px`,
      height: `${cs}px`,
      transition: `left ${ANIM_DURATION}ms ease, top ${ANIM_DURATION}ms ease`,
      zIndex: tile.isMerged ? 3 : tile.isNew ? 4 : 1
    }
  }

  function updateBoardWidth() {
    if (boardRef.value) {
      boardWidth.value = boardRef.value.clientWidth
    }
  }

  // ========== CSS 类 ==========
  function tileCSSClass(val: number): string {
    const key = val <= 8192 ? val : 8192
    return `tile-${key}`
  }

  // ========== 核心逻辑 ==========
  function initGrid(size: number): number[][] {
    return Array.from({ length: size }, () => Array(size).fill(0))
  }

  function getEmptyCells(g: number[][]): [number, number][] {
    const cells: [number, number][] = []
    for (let r = 0; r < g.length; r++) {
      for (let c = 0; c < g[r].length; c++) {
        if (g[r][c] === 0) cells.push([r, c])
      }
    }
    return cells
  }

  // 构建 tile 引用矩阵
  function buildTileMatrix(): (TileObj | null)[][] {
    const n = gridSize.value
    const m: (TileObj | null)[][] = Array.from({ length: n }, () => Array(n).fill(null))
    for (const t of tiles.value) {
      m[t.row][t.col] = t
    }
    return m
  }

  // 从 grid 数值和 tile 引用重建 tiles 列表
  function rebuildTilesFromGrid() {
    const n = gridSize.value
    const newTiles: TileObj[] = []
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const v = grid.value[r][c]
        if (v !== 0) {
          newTiles.push({
            id: tileIdCounter++,
            value: v,
            row: r,
            col: c,
            isNew: false,
            isMerged: false
          })
        }
      }
    }
    tiles.value = newTiles
  }

  // 一行左滑（tile 感知）
  function slideLineWithTiles(
    values: number[],
    tileRefs: (TileObj | null)[]
  ): {
    newValues: number[]
    moves: LineMove[]
    merges: LineMerge[]
    gained: number
    moved: boolean
  } {
    const n = values.length
    // 提取非空 tile
    const active: { tile: TileObj; val: number; idx: number }[] = []
    for (let i = 0; i < n; i++) {
      if (tileRefs[i]) {
        active.push({ tile: tileRefs[i]!, val: values[i], idx: i })
      }
    }

    const moves: LineMove[] = []
    const merges: LineMerge[] = []
    let gained = 0
    let writeIdx = 0
    let i = 0

    while (i < active.length) {
      if (i + 1 < active.length && active[i].val === active[i + 1].val) {
        // 合并：右边滑到左边位置
        const left = active[i]
        const right = active[i + 1]
        const mergedVal = left.val * 2
        gained += mergedVal

        if (left.idx !== writeIdx) {
          moves.push({ id: left.tile.id, fromIdx: left.idx, toIdx: writeIdx })
        }
        if (right.idx !== writeIdx) {
          moves.push({ id: right.tile.id, fromIdx: right.idx, toIdx: writeIdx })
        }
        merges.push({ survivorId: left.tile.id, absorbedId: right.tile.id, newValue: mergedVal })

        writeIdx++
        i += 2
      } else {
        const cur = active[i]
        if (cur.idx !== writeIdx) {
          moves.push({ id: cur.tile.id, fromIdx: cur.idx, toIdx: writeIdx })
        }
        writeIdx++
        i++
      }
    }

    // 构建新数值行
    const newValues = Array(n).fill(0)
    // 合并后的 tile 占据 writeIdx 个位置
    // 重新填充数值
    let vi = 0
    let ai = 0
    while (ai < active.length) {
      if (ai + 1 < active.length && active[ai].val === active[ai + 1].val) {
        newValues[vi] = active[ai].val * 2
        ai += 2
      } else {
        newValues[vi] = active[ai].val
        ai++
      }
      vi++
    }

    const moved = moves.length > 0 || merges.length > 0
    return { newValues, moves, merges, gained, moved }
  }

  // ========== 游戏操作 ==========
  function move(dir: 'left' | 'right' | 'up' | 'down') {
    if (isAnimating.value || gameOver.value || (gameWon.value && !keepPlaying.value)) return

    const g = grid.value
    const n = gridSize.value
    const tileMat = buildTileMatrix()

    // ----- 1. 计算所有移动 -----
    interface LineResult {
      newValues: number[]
      moves: LineMove[]
      merges: LineMerge[]
      gained: number
      moved: boolean
      lineIdx: number
    }

    const lineResults: LineResult[] = []
    let totalGained = 0
    let anyMoved = false

    // 提取行，统一按「左滑」处理
    const lines: { vals: number[]; refs: (TileObj | null)[]; lineIdx: number }[] = []

    if (dir === 'left') {
      for (let r = 0; r < n; r++) {
        lines.push({ vals: g[r], refs: tileMat[r], lineIdx: r })
      }
    } else if (dir === 'right') {
      for (let r = 0; r < n; r++) {
        lines.push({ vals: [...g[r]].reverse(), refs: [...tileMat[r]].reverse(), lineIdx: r })
      }
    } else if (dir === 'up') {
      for (let c = 0; c < n; c++) {
        const vals: number[] = []
        const refs: (TileObj | null)[] = []
        for (let r = 0; r < n; r++) {
          vals.push(g[r][c])
          refs.push(tileMat[r][c])
        }
        lines.push({ vals, refs, lineIdx: c })
      }
    } else {
      // down
      for (let c = 0; c < n; c++) {
        const vals: number[] = []
        const refs: (TileObj | null)[] = []
        for (let r = n - 1; r >= 0; r--) {
          vals.push(g[r][c])
          refs.push(tileMat[r][c])
        }
        lines.push({ vals, refs, lineIdx: c })
      }
    }

    for (const line of lines) {
      const res = slideLineWithTiles(line.vals, line.refs)
      lineResults.push({ ...res, lineIdx: line.lineIdx })
      totalGained += res.gained
      if (res.moved) anyMoved = true
    }

    if (!anyMoved) return

    // ----- 2. 构建新网格 -----
    const newGrid = initGrid(n)
    for (const lr of lineResults) {
      if (dir === 'left') {
        newGrid[lr.lineIdx] = lr.newValues
      } else if (dir === 'right') {
        newGrid[lr.lineIdx] = [...lr.newValues].reverse()
      } else if (dir === 'up') {
        for (let r = 0; r < n; r++) {
          newGrid[r][lr.lineIdx] = lr.newValues[r]
        }
      } else {
        // down
        for (let r = 0; r < n; r++) {
          newGrid[n - 1 - r][lr.lineIdx] = lr.newValues[r]
        }
      }
    }

    // ----- 3. 应用滑动（Phase 1：更新 tile 位置，触发 CSS transition）-----
    isAnimating.value = true

    for (const lr of lineResults) {
      for (const m of lr.moves) {
        const tile = tiles.value.find(t => t.id === m.id)
        if (!tile) continue

        let toRow: number, toCol: number
        if (dir === 'left') {
          toRow = lr.lineIdx
          toCol = m.toIdx
        } else if (dir === 'right') {
          toRow = lr.lineIdx
          toCol = n - 1 - m.toIdx
        } else if (dir === 'up') {
          toRow = m.toIdx
          toCol = lr.lineIdx
        } else {
          // down
          toRow = n - 1 - m.toIdx
          toCol = lr.lineIdx
        }

        tile.row = toRow
        tile.col = toCol
      }
    }
    // 触发响应式
    tiles.value = [...tiles.value]

    // ----- 4. 动画完成后处理合并 + 生成新方块 -----
    setTimeout(() => {
      // 处理合并
      for (const lr of lineResults) {
        for (const mg of lr.merges) {
          const survivor = tiles.value.find(t => t.id === mg.survivorId)
          // 移除被吸收的 tile
          tiles.value = tiles.value.filter(t => t.id !== mg.absorbedId)
          if (survivor) {
            survivor.value = mg.newValue
            survivor.isMerged = true
          }
        }
      }

      // 更新 grid
      grid.value = newGrid
      score.value += totalGained
      if (score.value > bestScore.value) {
        bestScore.value = score.value
        localStorage.setItem(`2048-best-${gridSize.value}`, String(bestScore.value))
      }

      // 生成新方块
      const emptyCells = getEmptyCells(grid.value)
      if (emptyCells.length > 0) {
        const [r, c] = emptyCells[Math.floor(Math.random() * emptyCells.length)]
        const newTile: TileObj = {
          id: tileIdCounter++,
          value: Math.random() < 0.9 ? 2 : 4,
          row: r,
          col: c,
          isNew: true,
          isMerged: false
        }
        tiles.value = [...tiles.value, newTile]
        grid.value[r][c] = newTile.value
      }

      // 清除动画标记
      setTimeout(() => {
        for (const t of tiles.value) {
          t.isNew = false
          t.isMerged = false
        }
        tiles.value = [...tiles.value]
        nextTick(() => {
          isAnimating.value = false
        })
      }, 200)

      // 检查胜利
      if (!keepPlaying.value && hasWon(grid.value)) {
        gameWon.value = true
      }
      // 检查失败
      if (!canMove(grid.value)) {
        gameOver.value = true
      }
    }, ANIM_DURATION)
  }

  function canMove(g: number[][]): boolean {
    const size = g.length
    if (getEmptyCells(g).length > 0) return true
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const v = g[r][c]
        if (c + 1 < size && g[r][c + 1] === v) return true
        if (r + 1 < size && g[r + 1][c] === v) return true
      }
    }
    return false
  }

  function hasWon(g: number[][]): boolean {
    for (const row of g) {
      if (row.some(v => v >= 2048)) return true
    }
    return false
  }

  // ========== 游戏控制 ==========
  function continueGame() {
    keepPlaying.value = true
    gameWon.value = false
  }

  function newGame() {
    grid.value = initGrid(gridSize.value)
    score.value = 0
    gameWon.value = false
    gameOver.value = false
    keepPlaying.value = false
    isAnimating.value = false
    tiles.value = []
    tileIdCounter = 0

    // 初始生成两个方块
    addRandomTileToGrid(grid.value)
    addRandomTileToGrid(grid.value)
    rebuildTilesFromGrid()
    nextTick(() => updateBoardWidth())
  }

  function addRandomTileToGrid(g: number[][]) {
    const empty = getEmptyCells(g)
    if (empty.length === 0) return
    const [r, c] = empty[Math.floor(Math.random() * empty.length)]
    g[r][c] = Math.random() < 0.9 ? 2 : 4
  }

  function changeMode(size: number) {
    gridSize.value = size
    const saved = localStorage.getItem(`2048-best-${size}`)
    bestScore.value = saved ? parseInt(saved, 10) : 0
    newGame()
  }

  // ========== 键盘事件 ==========
  const keyHandler = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        e.preventDefault()
        move('up')
        break
      case 'ArrowDown':
      case 's':
      case 'S':
        e.preventDefault()
        move('down')
        break
      case 'ArrowLeft':
      case 'a':
      case 'A':
        e.preventDefault()
        move('left')
        break
      case 'ArrowRight':
      case 'd':
      case 'D':
        e.preventDefault()
        move('right')
        break
    }
  }

  // ========== 触屏滑动手势 ==========
  let touchStartX = 0
  let touchStartY = 0

  function handleTouchStart(e: TouchEvent) {
    touchStartX = e.touches[0].clientX
    touchStartY = e.touches[0].clientY
  }

  function handleTouchEnd(e: TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchStartX
    const dy = e.changedTouches[0].clientY - touchStartY
    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)
    if (Math.max(absDx, absDy) < 30) return
    if (absDx > absDy) {
      move(dx > 0 ? 'right' : 'left')
    } else {
      move(dy > 0 ? 'down' : 'up')
    }
  }

  // ========== 生命周期 ==========
  onMounted(() => {
    const saved = localStorage.getItem('2048-best-4')
    bestScore.value = saved ? parseInt(saved, 10) : 0
    newGame()

    // 监听窗口大小变化，刷新 tile 位置
    updateBoardWidth()
    resizeObs = new ResizeObserver(() => updateBoardWidth())
    if (boardRef.value?.parentElement) {
      resizeObs.observe(boardRef.value.parentElement)
    }

    window.addEventListener('keydown', keyHandler)
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })
  })

  onUnmounted(() => {
    resizeObs?.disconnect()
    window.removeEventListener('keydown', keyHandler)
    window.removeEventListener('touchstart', handleTouchStart)
    window.removeEventListener('touchend', handleTouchEnd)
  })
</script>

<style scoped>
  .not-found-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--portal-bg, #0f0f11);
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans SC', sans-serif;
  }

  .not-found-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    max-width: 600px;
    width: 100%;
  }

  /* ===== 404 信息 ===== */
  .error-section {
    text-align: center;
  }

  .error-code {
    font-size: 72px;
    font-weight: 900;
    background: linear-gradient(135deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    line-height: 1;
    text-shadow: 0 0 40px rgba(102, 126, 234, 0.3);
  }

  .error-message {
    font-size: 20px;
    font-weight: 700;
    color: var(--portal-t1, rgba(255, 255, 255, 0.87));
    margin-top: 6px;
  }

  .error-desc {
    font-size: 13px;
    color: var(--portal-t2, rgba(255, 255, 255, 0.6));
    margin-top: 2px;
  }

  /* ===== 游戏区域 ===== */
  .game-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    width: 100%;
  }

  /* ===== 状态栏 ===== */
  .game-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    max-width: 460px;
  }

  .mode-switch {
    display: flex;
    gap: 6px;
  }

  .mode-btn {
    padding: 6px 16px;
    border: 1px solid var(--portal-bd, rgba(255, 255, 255, 0.06));
    border-radius: 6px;
    background: var(--portal-bc, rgba(255, 255, 255, 0.03));
    color: var(--portal-t2, rgba(255, 255, 255, 0.6));
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .mode-btn:hover {
    background: var(--portal-bd-hover, rgba(255, 255, 255, 0.1));
    color: var(--portal-t1, rgba(255, 255, 255, 0.87));
  }

  .mode-btn.active {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #fff;
    border-color: transparent;
    box-shadow: 0 4px 14px rgba(102, 126, 234, 0.25);
  }

  .scores {
    display: flex;
    gap: 8px;
  }

  .score-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: var(--portal-bc, rgba(255, 255, 255, 0.03));
    border: 1px solid var(--portal-bd, rgba(255, 255, 255, 0.06));
    border-radius: 8px;
    padding: 4px 14px;
    min-width: 70px;
  }

  .score-label {
    font-size: 10px;
    color: var(--portal-t3, rgba(255, 255, 255, 0.38));
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .score-value {
    font-size: 20px;
    font-weight: 800;
    color: var(--portal-t1, rgba(255, 255, 255, 0.87));
    line-height: 1.2;
  }

  .score-value.best {
    color: #667eea;
  }

  /* ===== 棋盘 ===== */
  .board-container {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    box-shadow:
      0 0 30px rgba(102, 126, 234, 0.06),
      0 8px 32px rgba(0, 0, 0, 0.4);
    border: 1px solid var(--portal-bd, rgba(255, 255, 255, 0.06));
    background: var(--portal-bc, rgba(255, 255, 255, 0.03));
    padding: 8px;
    width: 100%;
    max-width: 560px;
    aspect-ratio: 1 / 1;
  }

  .board {
    display: grid;
    gap: 6px;
    width: 100%;
    height: 100%;
    position: relative;
  }

  /* 背景网格 - 空单元格（像空白方块一样显示） */
  .cell {
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.06);
    aspect-ratio: 1 / 1;
  }

  /* ===== 方块（绝对定位） ===== */
  .tile {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    font-weight: 800;
    will-change: left, top;
  }

  .tile-num {
    font-size: clamp(16px, 4vw, 32px);
    font-weight: 800;
    user-select: none;
    line-height: 1;
  }

  /* 各数字颜色 */
  .tile-2 {
    background: #eee4da;
  }
  .tile-2 .tile-num {
    color: #776e65;
  }
  .tile-4 {
    background: #ede0c8;
  }
  .tile-4 .tile-num {
    color: #776e65;
  }
  .tile-8 {
    background: #f2b179;
  }
  .tile-8 .tile-num {
    color: #f9f6f2;
    font-size: clamp(14px, 3.5vw, 28px);
  }
  .tile-16 {
    background: #f59563;
  }
  .tile-16 .tile-num {
    color: #f9f6f2;
    font-size: clamp(14px, 3.5vw, 28px);
  }
  .tile-32 {
    background: #f67c5f;
  }
  .tile-32 .tile-num {
    color: #f9f6f2;
    font-size: clamp(14px, 3.5vw, 28px);
  }
  .tile-64 {
    background: #f65e3b;
  }
  .tile-64 .tile-num {
    color: #f9f6f2;
    font-size: clamp(14px, 3.5vw, 28px);
  }
  .tile-128 {
    background: #edcf72;
  }
  .tile-128 .tile-num {
    color: #f9f6f2;
    font-size: clamp(13px, 3vw, 26px);
  }
  .tile-256 {
    background: #edcc61;
  }
  .tile-256 .tile-num {
    color: #f9f6f2;
    font-size: clamp(13px, 3vw, 26px);
  }
  .tile-512 {
    background: #edc850;
  }
  .tile-512 .tile-num {
    color: #f9f6f2;
    font-size: clamp(13px, 3vw, 26px);
  }
  .tile-1024 {
    background: #edc53f;
  }
  .tile-1024 .tile-num {
    color: #f9f6f2;
    font-size: clamp(11px, 2.5vw, 22px);
  }
  .tile-2048 {
    background: #edc22e;
  }
  .tile-2048 .tile-num {
    color: #f9f6f2;
    font-size: clamp(11px, 2.5vw, 22px);
  }
  .tile-4096 {
    background: #3c3a32;
  }
  .tile-4096 .tile-num {
    color: #f9f6f2;
    font-size: clamp(11px, 2.5vw, 22px);
  }
  .tile-8192 {
    background: #3c3a32;
  }
  .tile-8192 .tile-num {
    color: #f9f6f2;
    font-size: clamp(11px, 2.5vw, 22px);
  }

  /* ===== 新方块出现动画 ===== */
  .tile-new {
    animation: tile-appear 0.2s ease-out;
  }

  @keyframes tile-appear {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    50% {
      transform: scale(1.12);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  /* ===== 合并方块弹跳动画 ===== */
  .tile-merged {
    animation: tile-merge-pop 0.25s ease-out;
  }

  @keyframes tile-merge-pop {
    0% {
      transform: scale(1);
    }
    40% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
    }
  }

  /* ===== 弹窗 ===== */
  .overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(4px);
    border-radius: 12px;
    z-index: 10;
  }

  .overlay-card {
    background: var(--portal-bg, #0f0f11);
    border: 1px solid var(--portal-bd, rgba(255, 255, 255, 0.06));
    border-radius: 16px;
    padding: 28px 36px;
    text-align: center;
    box-shadow: 0 0 40px rgba(102, 126, 234, 0.08);
  }

  .overlay-title {
    font-size: 20px;
    font-weight: 700;
    color: var(--portal-t1, rgba(255, 255, 255, 0.87));
    margin-bottom: 6px;
  }

  .overlay-score {
    font-size: 14px;
    color: var(--portal-t2, rgba(255, 255, 255, 0.6));
    margin-bottom: 16px;
  }

  .overlay-icon {
    font-size: 42px;
    margin-bottom: 8px;
  }

  .overlay-actions {
    display: flex;
    gap: 10px;
    justify-content: center;
  }

  /* ===== 按钮 ===== */
  .btn {
    padding: 10px 24px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn:hover {
    transform: translateY(-1px);
  }

  .btn:active {
    transform: translateY(0);
  }

  .btn-primary {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #fff;
  }

  .btn-primary:hover {
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  }

  .btn-secondary {
    background: var(--portal-bc, rgba(255, 255, 255, 0.03));
    border: 1px solid var(--portal-bd, rgba(255, 255, 255, 0.06));
    color: var(--portal-t2, rgba(255, 255, 255, 0.6));
  }

  .btn-secondary:hover {
    background: var(--portal-bd-hover, rgba(255, 255, 255, 0.1));
    color: var(--portal-t1, rgba(255, 255, 255, 0.87));
  }

  .btn-home {
    background: var(--portal-bc, rgba(255, 255, 255, 0.03));
    border: 1px solid var(--portal-bd, rgba(255, 255, 255, 0.06));
    color: var(--portal-t2, rgba(255, 255, 255, 0.6));
    padding: 10px 32px;
    font-size: 14px;
  }

  .btn-home:hover {
    background: var(--portal-bd-hover, rgba(255, 255, 255, 0.1));
    color: var(--portal-t1, rgba(255, 255, 255, 0.87));
  }

  .btn-new {
    background: var(--portal-bc, rgba(255, 255, 255, 0.03));
    color: var(--portal-t2, rgba(255, 255, 255, 0.6));
    padding: 8px 16px;
    font-size: 13px;
    border: 1px solid var(--portal-bd, rgba(255, 255, 255, 0.06));
    border-radius: 6px;
  }

  .btn-new:hover {
    background: var(--portal-bd-hover, rgba(255, 255, 255, 0.1));
    color: var(--portal-t1, rgba(255, 255, 255, 0.87));
  }

  .bottom-actions {
    margin-top: 4px;
  }

  /* ===== 底部 ===== */
  .game-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    max-width: 460px;
  }

  .hint-text {
    font-size: 12px;
    color: var(--portal-t3, rgba(255, 255, 255, 0.38));
  }

  /* ===== 过渡动画 ===== */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.25s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  /* ===== 移动端方向键 ===== */
  .mobile-controls {
    display: none;
    margin-top: 4px;
  }

  .dpad {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .dpad-row {
    display: flex;
    gap: 4px;
  }

  .dpad-btn {
    width: 52px;
    height: 52px;
    border: 1px solid var(--portal-bd, rgba(255, 255, 255, 0.06));
    border-radius: 10px;
    background: var(--portal-bc, rgba(255, 255, 255, 0.03));
    color: var(--portal-t2, rgba(255, 255, 255, 0.6));
    font-size: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    -webkit-user-select: none;
    transition: all 0.15s ease;
  }

  .dpad-btn:active {
    background: rgba(102, 126, 234, 0.2);
    border-color: rgba(102, 126, 234, 0.3);
    color: #667eea;
  }

  .dpad-btn:disabled {
    opacity: 0;
    cursor: default;
  }

  /* 触屏设备显示方向键 */
  @media (hover: none) and (pointer: coarse) {
    .mobile-controls {
      display: flex;
    }
  }

  /* 小屏适配 */
  @media (max-width: 520px) {
    .not-found-page {
      padding: 12px;
    }

    .error-code {
      font-size: 52px;
    }

    .error-message {
      font-size: 17px;
    }

    .board-container {
      padding: 6px;
    }

    .board {
      gap: 4px;
    }
  }
</style>
