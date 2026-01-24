import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from '@vant/auto-import-resolver'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')

  // 生产环境标志
  const isProd = mode === 'production'
  // 请不要在构建期间全局覆盖 `console`，会导致构建日志和错误被屏蔽。
  // 使用 terserOptions.drop_console 在打包阶段移除客户端的 console 调用。

  return {
    plugins: [
      vue(),
      // 仅在开发和测试环境启用 vue-devtools
      !isProd && vueDevTools(),
      AutoImport({
        resolvers: [VantResolver()],
      }),
      Components({
        resolvers: [VantResolver()],
      }),
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: isProd ? 'https://your_server_url' : 'http://localhost:8080',
          changeOrigin: true,
          ws: true
        }
      },
    },
    // 生产环境特定配置
    build: {
      // 移除 console
      terserOptions: {
        compress: {
          drop_console: isProd,
          drop_debugger: isProd,
        },
      },
    },
  }
})
