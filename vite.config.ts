import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
      symbolId: 'icon-[dir]-[name]'
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve('./src'),
      '@/modules': path.resolve('./src/modules')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
        @use "@/styles/variables.scss" as *;
      `
      }
    }
  },
  optimizeDeps: {
    include: ['axios', 'pinia-plugin-persistedstate']
  }
})
