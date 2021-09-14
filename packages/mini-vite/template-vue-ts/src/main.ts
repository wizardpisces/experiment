import { createApp } from 'vue'
import App from './App.vue'
import module from './mimic-store/index'
type a = number;
console.log('module id',module.id)

createApp(App).mount('#app')
