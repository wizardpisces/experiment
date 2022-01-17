import path from 'path'
import {
  fileURLToPath
} from 'url';
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import {
  miniSveltePlugin
} from '../src/index.js'

/**
 * fix ReferenceError: __dirname is not defined in ES module scope in Nod@14
 * https: //stackoverflow.com/questions/64383909/dirname-is-not-defined-in-node-14-version
 */

const ___filename = fileURLToPath(import.meta.url);
const ___dirname = path.dirname(___filename);

// https://vitejs.dev/config/
export default defineConfig({
  // plugins:[svelte()]
  plugins: [miniSveltePlugin()],
  resolve: {
    alias: {
      '@miniSvelte': path.resolve(___dirname, '../src'),
    },
  }
})
