const App = require('../index').default;
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

app.use('/', (req, res,next) => {
    req.test = 'this is a slash path'
    next()
    // res.end(info('route is ok'))
})

app.use('*', (req, res) => {
    res.end(info('this is default route'))
})

app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`)
})