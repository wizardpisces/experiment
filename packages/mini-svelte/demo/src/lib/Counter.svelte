<script>
	let name = 'child2';
	let count = 0;

	function handleClick() {
		++count;
		++count;
	}
</script>

<h1>{name}:own count: {count}!</h1>
<button on:click={handleClick}>
	{name} Clicked {count}
</button>

<style>
	h1{
		color:red;
	}
</style>