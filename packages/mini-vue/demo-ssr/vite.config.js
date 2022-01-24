// import vue from '@vitejs/plugin-vue'

export default {
  server: {
    port: 8081
  },
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    target: 'es2020',
    format: 'esm'
  },
  // plugins: [vue()]
}