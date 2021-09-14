const {
    App,
    compose
} = require('../index');

const {
    RenderStream
} = require('./util')

const upcaseTransform = require('./middleware/upcase-transform')
const logger = require('./middleware/logger')
const testM = require('./middleware/test-middleware')

let app = new App(),
    port = 8080

app.use((req, res, next) => {
    req.str = '<h1>this is a test</h1> , should also be in uppercase'
    next()
})

app.use(logger())
app.use(upcaseTransform())
app.use(compose([
    testM(1),
    testM(2)
]))

app.use('/', (req, res) => {
    new RenderStream((write, end) => {
        write('<h1>this is a test</h1> , should also be in uppercase<br>');
        end('this is the end')
    }).pipe(res)
    // res.end(req.str)
})

app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`)
})