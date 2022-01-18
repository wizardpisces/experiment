<script>
	let name = 'child Count';
	let count = 0;

	function handleClick() {
		++count;
		++count;
	}
</script>

<h1>{name}!</h1>
<h2>Hello {count}!</h2>
<button on:click={handleClick}>
	Clicked {count}
</button>

<style>
	h1{
		color:red;
	}
</style>