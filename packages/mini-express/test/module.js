const {
    App
} = require('../index');
const logger = require('./middleware/logger')

const {
    info
} = require('./util')

let app = new App(),
    port = 8080

app.use(logger())
app.use('/home', (req, res) => {
    res.end(info('home route is ok'))
})

app.use('/', (req, res) => {
    res.end(info('route is ok'))
})

app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`)
})