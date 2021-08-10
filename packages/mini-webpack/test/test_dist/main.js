(function (graph) {

    var installedModules = {};

    function __mini_require(_module) {

        function _localRequire(subModule) {
            return __mini_require(graph[_module].dependencies[subModule])
        }

        if (installedModules[_module]) {
            return installedModules[_module].exports
        }

        let module = installedModules[_module] = {
            id: _module,
            exports: {}
        };

        // @ts-ignore
        ;
        (function (require, exports, code) {
            eval(code)
        })(_localRequire, module.exports, graph[_module].code);

        return module.exports;
    }

    __mini_require("/Users/liuze/workspace/wizardpisces-projects/my-lerna-repo/packages/mini-webpack/test/examples/index.js")

    // cache
    __mini_require.c = installedModules

})({
    "/Users/liuze/workspace/wizardpisces-projects/my-lerna-repo/packages/mini-webpack/test/examples/index.js": {
        "dependencies": {
            "./message.js": "/Users/liuze/workspace/wizardpisces-projects/my-lerna-repo/packages/mini-webpack/test/examples/message.js"
        },
        "code": "\"use strict\";\n\nvar _message = _interopRequireDefault(require(\"./message.js\"));\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { \"default\": obj }; }\n\nconsole.log(_message[\"default\"]);"
    },
    "/Users/liuze/workspace/wizardpisces-projects/my-lerna-repo/packages/mini-webpack/test/examples/message.js": {
        "dependencies": {
            "./word.js": "/Users/liuze/workspace/wizardpisces-projects/my-lerna-repo/packages/mini-webpack/test/examples/word.js"
        },
        "code": "\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports[\"default\"] = void 0;\n\nvar _word = require(\"./word.js\");\n\nvar message = \"\".concat(_word.word);\nvar _default = message;\nexports[\"default\"] = _default;"
    },
    "/Users/liuze/workspace/wizardpisces-projects/my-lerna-repo/packages/mini-webpack/test/examples/word.js": {
        "dependencies": {},
        "code": "\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.word = void 0;\nvar word = 'hello world';\nexports.word = word;"
    }
})