import { URL, fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import { fileViewerRenderers } from '@file-viewer/vite-plugin'

/** 抑制第三方库 Node.js 模块在浏览器环境被外部化的已知告警 */
function suppressExternalizedWarnings(): Plugin {
  return {
    name: 'suppress-externalized-warnings',
    config() {
      return {
        build: {
          rollupOptions: {
            onLog(level, log) {
              if (level === 'warn' && (log as { code: string }).code === 'MODULE_EXTERNALIZED_BROWSER') {
                return false
              }
            }
          }
        }
      }
    }
  }
}

export default defineConfig({
  define: {
    global: 'globalThis'
  },
  plugins: [
    vue(),
    fileViewerRenderers({
      copyAssets: true,
      inject: false
    }),
    createSvgIconsPlugin({
      iconDirs: [fileURLToPath(new URL('src/assets/icons', import.meta.url))],
      symbolId: 'icon-[dir]-[name]'
    }),
    suppressExternalizedWarnings()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('src', import.meta.url)),
      buffer: 'buffer/',
      stream: 'stream-browserify',
      util: 'util/',
      events: 'events/',
      path: 'path-browserify',
      zlib: 'browserify-zlib',
      assert: 'assert/'
    }
  },
  css: {
    transformer: 'lightningcss',
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/variables.scss" as *;\n`
      }
    }
  },
  optimizeDeps: {
    include: ['mermaid']
  },
  build: {
    sourcemap: false,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 3500,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('element-plus') || id.includes('@element-plus')) return 'element-plus'
          if (id.includes('maplibre-gl')) return 'map-lib'
          if (id.includes('heic2any')) return 'image-lib'
          if (id.includes('codemirror') || id.includes('@codemirror')) return 'vendor-codemirror'
          return undefined
        }
      }
    }
  }
})
