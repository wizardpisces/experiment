import { Descriptor, parseMain } from "../src/parse/index"

let code = `
<script>
	let name = 'world';
	let name2 = 'world2';
	let count = 0;

	function handleClick() {
		count++;
	}
</script>

<h1>Hello {name} {name2}!</h1>
<h2>Hello  {name2} {count}!</h2>
<button on:click={handleClick}>
	Clicked {count}
</button>

<style>
	h1{
		color:red;
	}
</style>`
console.log('test mini-svelte')
parseMain(code)