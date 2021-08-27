const vm = require('vm')
const fs = require('fs')
const moduleNativeModule = require('module')
const path = require('path')

let moduleCache = {}

function r(filepath) {
    return _esm_require(filepath)
};

function _esm_require(filepath) {
    filepath = path.join(process.cwd(), filepath)
    let runableWrapper,
        exports = {},
        m = {
            module: {
                exports
            },
            exports
        };

    if (!moduleCache[filepath]) {
        let code = fs.readFileSync(filepath, 'utf-8')
        let wrappedCode = moduleNativeModule.wrap(code)
        /**
         * wrappedCode: (function (exports, require, module, __filename, __dirname) { ${code} })
         */
        let compiledScript = new vm.Script(wrappedCode)
        /**
         * runInContext 性能会比 runInThisContext 低
         * cache 
         */
        runableWrapper = compiledScript.runInThisContext()
        runableWrapper.call(m.exports, m.exports, r, m)
        /**
         * cache compiled and wrapped function and runed result
         */
        moduleCache[filepath] = exports
    }


    return moduleCache[filepath]
}

module.exports = _esm_require