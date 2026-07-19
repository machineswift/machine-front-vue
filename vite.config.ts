import { URL, fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { fileViewerRenderers } from '@file-viewer/vite-plugin'

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    fileViewerRenderers({
      copyAssets: true
    }),
    createSvgIconsPlugin({
      iconDirs: [fileURLToPath(new URL('src/assets/icons', import.meta.url))],
      symbolId: 'icon-[dir]-[name]'
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('src', import.meta.url)),
      '@/modules': fileURLToPath(new URL('src/modules', import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/variables.scss" as *;\n`,
        api: 'modern-compiler'
      }
    }
  },
  optimizeDeps: {
    include: ['mermaid']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 将 element-plus 及其图标聚合到同一 chunk，避免循环依赖
          if (id.includes('element-plus') || id.includes('@element-plus')) {
            return 'element-plus'
          }
        }
      }
    }
  }
})
