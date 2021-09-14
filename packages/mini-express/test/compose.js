const {
    App,
    compose
} = require('../index');

const testM = require('./middleware/test-middleware')

let app = new App(),
    port = 8080

app.use(compose([
    testM(1),
    testM(2)
]))

app.use('/', (req, res) => {
   res.end('[tiny-server]: compose test is ok')
})

app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`)
})