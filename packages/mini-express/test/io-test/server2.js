
const {
    App
} = require('../../index');
const logger = require('../middleware/logger')

let app = new App(),
    port = 8081,
    duration = 1000

// app.use(logger())

app.use('/async', (req, res, next) => {
    setTimeout(() => {
        duration = duration === 1000 ? 2000 : 2000
        res.end('[tiny-server2] : Response string')
    }, duration)
})

app.use('*', (req, res) => {
    res.end('[tiny-server2]: default router hit')
})

app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`)
})