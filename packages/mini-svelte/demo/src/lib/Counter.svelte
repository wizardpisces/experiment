<script>
	let name = 'child';
	let count = 0;

	function handleClick() {
		++count;
		++count;
	}
</script>

<h1>Hello {name}!</h1>
<h2>Hello {count}!</h2>
<button on:click={handleClick}>
	Clicked {count}
</button>

<style>
	h1{
		color:red;
	}
</style>