import { Options, init } from '../../src'

// import './style.css'

let structure: Options['structure'] = {
  data:{
    msg: 'Hello Vite!',
  },
  created() {
    setTimeout(() => {
      this.setData({
        msg: 'setData'
      })
    }, 3000)
  },
  render(){
    const app = document.querySelector<HTMLDivElement>('#app')!

    app.innerHTML = `
      <h1>${this.data.msg}</h1>
      <a href="https://vitejs.dev/guide/features.html" target="_blank">Documentation</a>
    `
  }

}

init({
  structure,
  workerPath: './src/main.ts'
})