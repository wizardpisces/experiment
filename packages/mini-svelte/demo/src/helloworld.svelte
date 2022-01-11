<script>
	let name = 'world';
	let name2 = 'world2';
	let count = 0;

	function handleClick() {
		count += 1;
	}
</script>

<h1>Hello {name} {name2}!</h1>
<h2>Hello  {name2}!</h2>
<!-- <button on:click={handleClick}>
	Clicked {count} {count === 1 ? 'time' : 'times'}
</button> -->

<style>
	h1{
		color:red;
	}
</style>