(function(modules) {

    var installedModules = {};

    function __mini_require(id) {
        const [fn, dependencies] = modules[id];

        function _localRequire(subModule) {
            return __mini_require(dependencies[subModule])
        }

        if (installedModules[id]) {
            return installedModules[id].exports
        }

        let module = installedModules[id] = {
            id: id,
            exports: {}
        };

        fn(_localRequire, module, module.exports)

        return module.exports;
    }

    __mini_require(0)

    // cache
    __mini_require.c = installedModules

})({
    "0": [
        function(require, module, exports) {
            "use strict";

            var _message = _interopRequireDefault(require("./message.js"));

            function _interopRequireDefault(obj) {
                return obj && obj.__esModule ? obj : {
                    "default": obj
                };
            }

            console.log(_message["default"]);
        },
        {
            "./message.js": 1
        },
    ],
    "1": [
        function(require, module, exports) {
            "use strict";

            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            exports["default"] = void 0;

            var _word = require("./word.js");

            var message = "".concat(_word.word);
            var _default = message;
            exports["default"] = _default;
        },
        {
            "./word.js": 2
        },
    ],
    "2": [
        function(require, module, exports) {
            "use strict";

            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            exports.word = void 0;
            var word = 'hello world';
            exports.word = word;
        },
        {},
    ],
})