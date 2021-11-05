const Koa = require('koa');
const app = new Koa();

async function sdk(ctx){
    await Promise.resolve().then(_=>{
        ctx.redirect('/re')
    })
    ctx.status = 200;
    ctx.body = 'redirect'
}
// response
app.use(async (ctx, next) => {

    if (ctx.path === '/re') {
        ctx.body = 'redirect body'
        ctx.status = 200
        // ctx.res.end()
    }else{
        await next()
    }

});

app.use(async (ctx, next) => {
    const start = Date.now();
    if(ctx.path === '/home'){
        await sdk(ctx)
    }


    await next();
    const ms = Date.now() - start;
    console.log(`${ctx.path} ${ctx.method} ${ctx.url} - ${ms}ms`);
});

// response
app.use(async (ctx, next) => {
    ctx.body = 'Hello Koa';
});


app.listen(3000);