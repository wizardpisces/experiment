"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../src/parse/index");
const fs_1 = __importDefault(require("fs"));
let code = `
<script>
  import Counter from "./lib/Counter.svelte";
  let name = "parent";
  let count = 0;
  function inc() {
    ++count
  }
</script>

<main>
  <h1>Hello {name} Typescript!</h1>
  <button on:click={inc}>
    {name} Clicked {count}
  </button>
  <br/>
  <Counter />
</main>

<style>
  :root {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  }

  main {
    text-align: center;
    padding: 1em;
    margin: 0 auto;
  }

  img {
    height: 16rem;
    width: 16rem;
  }

  p {
    max-width: 14rem;
    margin: 1rem auto;
    line-height: 1.35;
  }
</style>
`;
let descriptor = (0, index_1.parseMain)(code);
console.log(descriptor.script);
console.log(descriptor.style);
console.log(descriptor.template);
fs_1.default.writeFileSync(__dirname + '/result.js', descriptor.template, 'utf8');
console.log('\ncompile success.....');
