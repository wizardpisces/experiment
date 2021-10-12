import vue from '@vitejs/plugin-vue'

export default {
  port: '8000',
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    target: 'es2020',
    format: 'esm'
  },
  server: {
    port: 8080
  }
}