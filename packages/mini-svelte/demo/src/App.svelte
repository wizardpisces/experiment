<script>
  import Counter from "./lib/Counter.svelte";
  import Prop from "./lib/Prop.svelte";
  let name = "parent";
  let count = 0;
  function inc() {
    ++count
  }
</script>

<h1>Hello {name} Typescript!</h1>
<button on:click={inc}>
  {name} Clicked {count}
</button>

<Counter></Counter>
<Prop prop1={count}></Prop>

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
</style>
