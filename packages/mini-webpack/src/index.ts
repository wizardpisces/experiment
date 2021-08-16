import fs from 'fs'
import path from 'path'
// import parser from '@babel/parser'
const parser = require('@babel/parser')
import traverse from '@babel/traverse'
const babel = require('@babel/core')

export {
  build
}

type Dependencies = Record<string, number>
type DepGraph = {
  [filename: string]: {
    dependencies: Dependencies,
    code: string
  }
}

type FilenameIdMap = Record<string, number>

let context: {
  id: number
  filenameIdMap: FilenameIdMap
  dirname: string,
  _newId: () => number,
  init:(entry:string)=>void,
  generateId: (filename:string) => number,
  makeAbsolutePath:(filename:string)=>string
} = {
  id: -1,
  filenameIdMap: {},
  dirname: '',
  _newId() {
    return ++context.id
  },
  init(entry:string){
    context.generateId(entry)
    context.dirname = path.dirname(entry)
  },
  generateId(filename:string){
    let absoluteFilePath = context.makeAbsolutePath(filename)
    if (!context.filenameIdMap[absoluteFilePath]) {
      context.filenameIdMap[absoluteFilePath] = context._newId()
    }
    // 保证指向同一路径的 不同 relativePath以及绝对路径 指向同一个 id
    context.filenameIdMap[filename] = context.filenameIdMap[absoluteFilePath]
    return context.filenameIdMap[filename]
  },
  makeAbsolutePath(filename:string) {
    if (path.isAbsolute(filename)) {
      return filename
    }
    return path.join(context.dirname, filename)
  }
}

function transform(filename: string) {
  let absoluteFilePath = context.makeAbsolutePath(filename)

  const content = fs.readFileSync(absoluteFilePath, 'utf-8')
  const ast = parser.parse(content, {
    sourceType: 'module'//babel官方规定必须加这个参数，不然无法识别ES Module
  })

  const dependencies: Dependencies = {}

  traverse(ast, {
    ImportDeclaration({ node }) {
      dependencies[node.source.value] = context.generateId(node.source.value)
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

// 生成依赖图
function buildDepGraph(entry: string): DepGraph {
  context.init(entry)
  const entryModule = transform(entry)
  const graphArray = [entryModule]
  for (let i = 0; i < graphArray.length; i++) {
    const item = graphArray[i];
    const { dependencies } = item;
    for (let filename of Object.keys(dependencies)) {
      graphArray.push(
        transform(filename)
      )
    }
  }
  const graph: DepGraph = {}
  graphArray.forEach(item => {
    graph[context.filenameIdMap[item.filename]] = {
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
      [id: number]: {
        id: number;
        exports: {}
      }
    } = {};

    function __mini_require(id: number) {

      function _localRequire(subModule: string) {
        return __mini_require(graph[id].dependencies[subModule])
      }

      if (installedModules[id]) {
        return installedModules[id].exports
      }

      let module = installedModules[id] = {
        id: id,
        exports: {}
      };

      // @ts-ignore
      ; (function (require, exports, code) {
        // console.log(require, JSON.stringify(exports))
        eval(code)
      })(_localRequire, module.exports, graph[id].code);

      return module.exports;
    }

    __mini_require(0)

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

    __mini_require(0)

    // cache
    __mini_require.c = installedModules

  })({${modules}})`

  return result
}

function build(entry: string) {
  return codeGen(entry)
}

