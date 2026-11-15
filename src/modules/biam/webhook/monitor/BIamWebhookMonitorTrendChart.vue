<template>
  <div ref="containerRef" class="trend-chart" :style="{ height: `${height}px` }">
    <svg v-if="hasData" class="trend-chart-svg" :width="width" :height="height" role="img" aria-label="Webhook 投递趋势图">
      <defs>
        <linearGradient v-for="item in areaSeries" :id="gradientId(item.key)" :key="`grad-${item.key}`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="item.color" stop-opacity="0.22" />
          <stop offset="100%" :stop-color="item.color" stop-opacity="0.02" />
        </linearGradient>
      </defs>

      <g class="chart-grid">
        <line v-for="tick in yTicks" :key="`grid-${tick.value}`" class="grid-line" :x1="plotLeft" :x2="plotRight" :y1="tick.y" :y2="tick.y" />
        <text v-for="tick in yTicks" :key="`y-label-${tick.value}`" class="axis-text" :x="plotLeft - 10" :y="tick.y + 4" text-anchor="end">
          {{ tick.label }}
        </text>
      </g>

      <g class="chart-x-axis">
        <text v-for="tick in xTicks" :key="`x-label-${tick.index}`" class="axis-text" :x="tick.x" :y="height - 8" :text-anchor="tick.anchor">
          {{ tick.label }}
        </text>
      </g>

      <path v-for="item in areaSeries" :key="`area-${item.key}`" :d="item.areaPath" :fill="`url(#${gradientId(item.key)})`" />

      <polyline
        v-for="item in lineSeries"
        :key="`line-${item.key}`"
        :points="item.points"
        fill="none"
        :stroke="item.color"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <g v-if="hoverState" class="chart-hover">
        <line class="hover-line" :x1="hoverState.x" :x2="hoverState.x" :y1="plotTop" :y2="plotBottom" />
        <circle
          v-for="marker in hoverState.markers"
          :key="`marker-${marker.key}`"
          :cx="hoverState.x"
          :cy="marker.y"
          r="4"
          :fill="marker.color"
          stroke="#fff"
          stroke-width="2"
        />
      </g>

      <rect
        class="chart-hit-area"
        :x="plotLeft"
        :y="plotTop"
        :width="plotWidth"
        :height="plotHeight"
        fill="transparent"
        @mousemove="handleMouseMove"
        @mouseleave="hoverIndex = -1"
      />
    </svg>

    <div v-else class="trend-chart-empty">
      <el-empty description="当前区间暂无投递数据" :image-size="72" />
    </div>

    <div v-if="hoverState" class="trend-chart-tooltip" :style="tooltipStyle">
      <div class="tooltip-time">{{ hoverState.timeLabel }}</div>
      <div v-for="row in hoverState.rows" :key="row.key" class="tooltip-row">
        <span class="tooltip-dot" :style="{ backgroundColor: row.color }" />
        <span class="tooltip-label">{{ row.label }}</span>
        <span class="tooltip-value">{{ row.value }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
  import type { BIamWebhookMonitorTrendPoint, BIamWebhookTrendSeries } from './type/BIamWebhookMonitor.type'

  const props = withDefaults(
    defineProps<{
      points: BIamWebhookMonitorTrendPoint[]
      series: BIamWebhookTrendSeries[]
      /** 当前可见的指标 key，用于图例联动 */
      visibleKeys: string[]
      /** 统计粒度（BIamWebhookMonitorIntervalEnum），决定 X 轴标签格式 */
      interval?: string
      height?: number
    }>(),
    { interval: '', height: 300 }
  )

  /** 同一页面可能存在多个图表，渐变 id 需保持唯一 */
  const chartId = `webhook-trend-${useId()}`

  const PADDING = { top: 16, right: 24, bottom: 30, left: 56 }
  const Y_TICK_COUNT = 4

  const containerRef = ref<HTMLElement | null>(null)
  const width = ref(0)
  const hoverIndex = ref(-1)

  let resizeObserver: ResizeObserver | null = null

  const plotLeft = PADDING.left
  const plotTop = PADDING.top
  const plotRight = computed(() => Math.max(plotLeft + 20, width.value - PADDING.right))
  const plotBottom = computed(() => props.height - PADDING.bottom)
  const plotWidth = computed(() => Math.max(0, plotRight.value - plotLeft))
  const plotHeight = computed(() => Math.max(0, plotBottom.value - plotTop))

  const hasData = computed(() => props.points.length > 0 && width.value > 0)

  const activeSeries = computed(() => props.series.filter(item => props.visibleKeys.includes(item.key)))

  const xAt = (index: number): number => {
    const total = props.points.length
    if (total <= 1) return plotLeft + plotWidth.value / 2
    return plotLeft + (plotWidth.value * index) / (total - 1)
  }

  const yAt = (value: number, yMax: number): number => {
    if (yMax <= 0) return plotBottom.value
    return plotBottom.value - (Math.min(Math.max(value, 0), yMax) / yMax) * plotHeight.value
  }

  /** 让刻度落在 1 / 2 / 2.5 / 5 / 10 的整数倍上，避免出现 137 这类难读刻度 */
  const niceStep = (rawStep: number): number => {
    if (!Number.isFinite(rawStep) || rawStep <= 0) return 1
    const exponent = Math.floor(Math.log10(rawStep))
    const fraction = rawStep / 10 ** exponent
    const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 2.5 ? 2.5 : fraction <= 5 ? 5 : 10
    return niceFraction * 10 ** exponent
  }

  const maxValue = computed(() => {
    let max = 0
    for (const point of props.points) {
      for (const item of activeSeries.value) {
        const value = Number(point[item.key] ?? 0)
        if (value > max) max = value
      }
    }
    return max
  })

  const yMax = computed(() => {
    const step = niceStep(maxValue.value / Y_TICK_COUNT)
    return Math.max(step * Y_TICK_COUNT, Y_TICK_COUNT)
  })

  const yTicks = computed(() => {
    const step = yMax.value / Y_TICK_COUNT
    return Array.from({ length: Y_TICK_COUNT + 1 }, (_, index) => {
      const value = step * index
      return { value, label: formatAxisNumber(value), y: yAt(value, yMax.value) }
    })
  })

  const xTicks = computed(() => {
    const total = props.points.length
    if (total === 0) return []
    const maxLabelCount = Math.max(2, Math.min(7, Math.floor(plotWidth.value / 90)))
    const step = Math.max(1, Math.ceil(total / maxLabelCount))
    const indexes = new Set<number>()
    for (let index = 0; index < total; index += step) indexes.add(index)
    indexes.add(total - 1)
    return [...indexes]
      .sort((a, b) => a - b)
      .map(index => {
        const point = props.points[index]
        return {
          index,
          x: xAt(index),
          label: formatBucketLabel(point?.bucketTime ?? 0, props.interval),
          anchor: index === 0 ? 'start' : index === total - 1 ? 'end' : 'middle'
        }
      })
  })

  const lineSeries = computed(() =>
    activeSeries.value.map(item => ({
      key: item.key,
      color: item.color,
      points: props.points.map((point, index) => `${xAt(index)},${yAt(Number(point[item.key] ?? 0), yMax.value)}`).join(' ')
    }))
  )

  const areaSeries = computed(() => {
    if (props.points.length < 2) return []
    return activeSeries.value
      .filter(item => item.area)
      .map(item => {
        const coordinates = props.points.map((point, index) => `${xAt(index)},${yAt(Number(point[item.key] ?? 0), yMax.value)}`)
        const first = coordinates[0] ?? `${plotLeft},${plotBottom.value}`
        const lastX = xAt(props.points.length - 1)
        return {
          key: item.key,
          color: item.color,
          areaPath: `M ${first} L ${coordinates.slice(1).join(' L ')} L ${lastX},${plotBottom.value} L ${plotLeft},${plotBottom.value} Z`
        }
      })
  })

  const hoverState = computed(() => {
    const index = hoverIndex.value
    const point = index >= 0 ? props.points[index] : undefined
    if (!point) return null
    return {
      x: xAt(index),
      timeLabel: formatFullTime(point.bucketTime),
      markers: activeSeries.value.map(item => ({ key: item.key, color: item.color, y: yAt(Number(point[item.key] ?? 0), yMax.value) })),
      rows: activeSeries.value.map(item => ({
        key: item.key,
        label: item.label,
        color: item.color,
        value: formatAxisNumber(Number(point[item.key] ?? 0))
      }))
    }
  })

  const tooltipStyle = computed(() => {
    const state = hoverState.value
    if (!state) return {}
    const offset = 14
    const flip = state.x + offset + 160 > width.value
    return {
      left: `${flip ? state.x - offset : state.x + offset}px`,
      transform: flip ? 'translateX(-100%)' : 'none',
      top: `${plotTop}px`
    }
  })

  const gradientId = (key: string): string => `${chartId}-${key}`

  const handleMouseMove = (event: MouseEvent) => {
    const rect = containerRef.value?.getBoundingClientRect()
    const total = props.points.length
    if (!rect || total === 0 || plotWidth.value <= 0) return
    const offsetX = event.clientX - rect.left
    const ratio = (offsetX - plotLeft) / plotWidth.value
    const index = Math.round(ratio * (total - 1))
    hoverIndex.value = Math.min(total - 1, Math.max(0, index))
  }

  const updateWidth = () => {
    const next = Math.floor(containerRef.value?.clientWidth ?? 0)
    if (next > 0 && next !== width.value) width.value = next
  }

  watch(
    () => props.points,
    () => {
      hoverIndex.value = -1
    }
  )

  onMounted(() => {
    updateWidth()
    resizeObserver = new ResizeObserver(updateWidth)
    if (containerRef.value) resizeObserver.observe(containerRef.value)
  })

  onBeforeUnmount(() => {
    resizeObserver?.disconnect()
    resizeObserver = null
  })

  const formatAxisNumber = (value: number): string => {
    if (value >= 100000000) return `${Number((value / 100000000).toFixed(1))}亿`
    if (value >= 10000) return `${Number((value / 10000).toFixed(1))}万`
    return `${Math.round(value)}`
  }

  const pad = (value: number): string => String(value).padStart(2, '0')

  /** X 轴标签按粒度压缩：分钟/小时显示时分，天显示月日 */
  const formatBucketLabel = (timestamp: number, interval: string): string => {
    const date = new Date(timestamp)
    if (interval === 'DAY') return `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
    if (interval === 'HOUR') return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:00`
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`
  }

  const formatFullTime = (timestamp: number): string => {
    const date = new Date(timestamp)
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
  }
</script>

<style scoped lang="scss">
  .trend-chart {
    position: relative;
    width: 100%;
  }

  .trend-chart-svg {
    display: block;
    overflow: visible;
  }

  .grid-line {
    stroke: var(--el-border-color-lighter);
    stroke-width: 1;
    stroke-dasharray: 4 4;
  }

  .axis-text {
    font-size: 12px;
    fill: var(--el-text-color-secondary);
  }

  .hover-line {
    stroke: var(--el-color-primary);
    stroke-width: 1;
    stroke-dasharray: 3 3;
    opacity: 0.6;
  }

  .chart-hit-area {
    cursor: crosshair;
  }

  .trend-chart-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  .trend-chart-tooltip {
    position: absolute;
    z-index: 5;
    min-width: 150px;
    padding: 8px 10px;
    font-size: 12px;
    line-height: 1.8;
    background: var(--el-bg-color-overlay);
    border: 1px solid var(--el-border-color-light);
    border-radius: 6px;
    box-shadow: var(--el-box-shadow-light);
    pointer-events: none;

    .tooltip-time {
      margin-bottom: 2px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .tooltip-row {
      display: flex;
      gap: 6px;
      align-items: center;
    }

    .tooltip-dot {
      flex-shrink: 0;
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .tooltip-label {
      color: var(--el-text-color-regular);
    }

    .tooltip-value {
      margin-left: auto;
      font-variant-numeric: tabular-nums;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }
</style>
