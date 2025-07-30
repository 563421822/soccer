import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { visualizer } from 'rollup-plugin-visualizer'

// 使用 CommonJS 方式导入
import purgecssModule from '@fullhuman/postcss-purgecss'
const purgecss = purgecssModule.default || purgecssModule // 兼容 default 和 module.exports

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    visualizer({ open: false })
  ],
  base: './',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // ,
  // build: {
  //   outDir: 'D:\\commu\\src\\main\\resources\\static\\dist',
  //   emptyOutDir: true
  // }
  css: {
    postcss: {
      plugins: process.env.NODE_ENV === 'production'
        ? [
            purgecss({
              content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
              defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
              safelist: [] // 可选: 保留的类名
            })
          ]
        : []
    }
  }
})
