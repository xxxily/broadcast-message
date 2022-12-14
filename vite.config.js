import { resolve } from 'path'
import { defineConfig, loadEnv } from 'vite'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig((command) => {
  const env = loadEnv(command.mode, __dirname)
  console.log(`[mode][${command.mode}]`, env)

  if (command.mode === 'lib' || command.mode === 'lib-only') {
    return {
      build: {
        // https://cn.vitejs.dev/config/build-options.html#build-lib
        lib: {
          entry: resolve(__dirname, 'src/index.ts'),
          name: 'BroadcastMessage',
          fileName: 'BroadcastMessage',
          formats: ['es', 'umd', 'cjs', 'iife'],
        },

        copyPublicDir: false,

        /* 构建库的时候跟进mode决定要不要清空构建目录 */
        emptyOutDir: command.mode === 'lib' ? false : true,
        // sourcemap: true,
        // minify: false,
      },
    }
  } else {
    return {
      plugins: [
        // https://github.com/vitejs/vite/tree/main/packages/plugin-legacy
        // 注意lib模式下使用legacy是无效的
        legacy({
          targets: ['defaults', 'not IE 11'],
        }),
      ],
      /* 使用相对地址 */
      base: './',
      // https://cn.vitejs.dev/config/build-options.html
      build: {
        rollupOptions: {
          input: {
            demo: resolve(__dirname, 'pages/demo.html'),
            broadcastMessage: resolve(__dirname, 'pages/broadcast-message.html'),
          },
        },

        // sourcemap: true,
        // minify: false,
      },
    }
  }
})
