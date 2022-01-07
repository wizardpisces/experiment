import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
// import {
//   miniSveltePlugin
// } from '../src/index.js'

// https://vitejs.dev/config/
export default defineConfig({
  plugins:[svelte()]
  // plugins: [miniSveltePlugin()]
})
