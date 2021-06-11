import AsyncApp, { middleware } from 'server-async'

let app = new AsyncApp(),
    port = 8080

app.use(middleware.logger())

app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`)
})

