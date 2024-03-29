import { build } from '../src';
import path from 'path'
import fs from 'fs'
import vm from 'vm'
// @ts-ignore
import { js } from 'js-beautify'

describe('mini webpack', () => {
  it('build', () => {
    let code = js(build(path.join(__dirname, '/examples/index.js')))
    console.log = jest.fn();

    let distCodePath = path.join(__dirname, `/test_dist/main.js`)
    fs.writeFileSync(distCodePath, code);
    // eval(code)
    new vm.Script(code).runInContext(vm.createContext({ console: console }))

    expect(console.log).toHaveBeenCalledWith('hello world');
  });
});
