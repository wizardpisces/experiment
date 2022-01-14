import { Descriptor, parseMain } from "../src/parse/index"

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
`

let descriptor = parseMain(code)

console.log(descriptor.script)
console.log(descriptor.style)
console.log(descriptor.template)

console.log('\ncompile success.....')