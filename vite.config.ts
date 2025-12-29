import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      rollupTypes: true
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VueIntent',
      formats: ['es', 'cjs'],
      fileName: (format) => format === 'es' ? 'index.mjs' : 'index.js'
    },
    rollupOptions: {
      external: ['vue', 'vue-router', 'behavior-runtime-core'],
      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
          'behavior-runtime-core': 'BehaviorRuntimeCore'
        }
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
})
