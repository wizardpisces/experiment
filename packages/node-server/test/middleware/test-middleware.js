module.exports = function test(index) {
    return (req, res, next) => {
        console.log('[test middleware index]: ', index);
        next()
    }
}
