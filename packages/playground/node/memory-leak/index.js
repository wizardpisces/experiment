const path = require('path');
const Koa = require('koa');
const app = new Koa();
var heapdump = require('heapdump');

const one = (ctx, next) => {
    global.appContext = ctx
    next();
}

// const two = (ctx, next) => {
//     console.log('>> two');
//     next();
//     console.log('<< two');
// }
app.use(one);
app.use((ctx)=>{
    if(ctx.path === '/dump'){
        heapdump.writeSnapshot(path.join(__dirname,Date.now() + '.heapsnapshot'));
        ctx.body = 'finished dump'
    }else{
        ctx.body = 'thisi end'
    }
})
// app.use(two);
let port = 3100
app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`)
});
