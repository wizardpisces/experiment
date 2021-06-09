let onHeaders = require('on-headers')
module.exports = function responseTime() {

    return (req, res, next) => {
        var startAt = process.hrtime()
        next()
        onHeaders(res,()=>{
            var delta = process.hrtime(startAt),
            // Format to high resolution time with nano time to milliseconds
                time = delta[0] * 1000 + delta[1] / 1000000;
            console.log(`[response-time]: ${req.query.id} - ${time}`)
            setHeader(res, req, time)
        })
    }
}

function setHeader(res, req, time) {
    res.setHeader('X-Response-Time', time + 'ms')
}