import b from './b.js'
console.log('this is index read ',b)
import('./message.js').then(mod=>{
    console.log('this is index: ',mod.default)
})