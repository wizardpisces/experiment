module.exports = function logger() {
    return (req, res, next) => {
        console.log('[tiny-server logger]: ', req.url, req.path, req.query);
        next()
    }
}