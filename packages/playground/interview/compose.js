function add1(n, callback) {
    setTimeout(function () {
        // callback(new Error(10), n + 1);
        callback(null, n + 1);
    }, 10);
}

function mul3(n, callback) {
    setTimeout(function () {
        callback(null, n * 3);
    }, 10);
}

var add1mul3 = compose(mul3, add1);
add1mul3(4, function (err, result) {
    // result now equals 15
    console.log(err, result)
});


















































































// solution 1 : build composed function before runtime

/**
 * type callback = (error, num) => void
 * type fn = (num,callback) => void
 */

function compose(...fns) {

    let composedFn = (num, callback) => {
        let fun = fns.reduce((cb,fn) => {
            return (err, n) => {
                if (err!==null) { // interrupt
                    callback(err, '\nError Interruption')
                } else {
                    fn(n, cb)
                }
            }
        }, callback)

        fun(null, num)
    }

    return (num, callback) => {
        composedFn(num, callback)
    }
}

// solution 2 : execute during iteration without before runtime build

function compose(...fns) {

    return (input, cb) => {

        function callback(err = null, input) {
            if (err || fns.length === 0) {
                return cb(err, input);
            }

            let fn = fns.pop()

            fn(input, callback)
        }

        callback(null, input)
    }
}