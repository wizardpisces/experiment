import fs from 'fs'
import path from 'path'
// import parser from '@babel/parser'
const parser = require('@babel/parser')
import traverse from '@babel/traverse'
const babel = require('@babel/core')

export {
  build
}

function transform(filename: string) {
  const content = fs.readFileSync(filename, 'utf-8')
  const ast = parser.parse(content, {
    sourceType: 'module'//babel官方规定必须加这个参数，不然无法识别ES Module
  })
  const dependencies: Record<string, string> = {}

  traverse(ast, {
    ImportDeclaration({ node }) {
      const dirname = path.dirname(filename)
      const newFile = path.join(dirname, node.source.value)
      dependencies[node.source.value] = newFile
    }
  })

  const { code } = babel.transformFromAstSync(ast, content, {
    presets: ["@babel/preset-env"]
  })!

  return {
    filename,
    dependencies,
    code
  }
}

type DepGraph = {
  [filename: string]: {
    dependencies: Record<string, string>,
    code: string
  }
}

// 生成依赖图
function buildDepGraph(entry: string): DepGraph {
  const entryModule = transform(entry)
  const graphArray = [entryModule]
  for (let i = 0; i < graphArray.length; i++) {
    const item = graphArray[i];
    const { dependencies } = item;
    for (let j in dependencies) {
      graphArray.push(
        transform(dependencies[j])
      )
    }
  }
  const graph: DepGraph = {}

  graphArray.forEach(item => {
    graph[item.filename] = {
      dependencies: item.dependencies,
      code: item.code as string
    }
  })
  return graph
}

function codeGen(entry: string): string {
  const graphJSON = buildDepGraph(entry);
  /**
   * build time execute code
   * will be code generation result code
   * ----- next code gen start ----
   */
  (function (graph) {

    var installedModules: {
      [filename: string]: {
        id: string;
        exports: {}
      }
    } = {};

    function __mini_require(_module: string) {

      function _localRequire(subModule: string) {
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
      ; (function (require, exports, code) {
        // console.log(require, JSON.stringify(exports))
        eval(code)
      })(_localRequire, module.exports, graph[_module].code);

      return module.exports;
    }

    __mini_require(entry)

    // cache
    __mini_require.c = installedModules

  })(graphJSON)
  /**
   * -----next code gen end ----
   */

  let modules = '';
  Object.keys(graphJSON).forEach(key => {
    let mod = graphJSON[key];
    modules += `"${key}": [
      function (require, module, exports) {
        ${mod.code}
      },
      ${JSON.stringify(mod.dependencies)},
    ],`;
  });

  let result = `(function (modules) {

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

      fn(_localRequire,module, module.exports)

      return module.exports;
    }

    __mini_require("${entry}")

    // cache
    __mini_require.c = installedModules

  })({${modules}})`

  return result
}

function build(entry: string) {
  return codeGen(entry)
}

