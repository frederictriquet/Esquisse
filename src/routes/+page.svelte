<script lang="ts">
	import Canvas from '$lib/components/Canvas.svelte';
</script>

<svelte:head>
	<title>Esquisse - Drawing Application</title>
	<meta name="description" content="A simple drawing application built with SvelteKit" />
</svelte:head>

<main>
	<Canvas />
</main>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		overflow: hidden;
	}

	main {
		width: 100%;
		height: 100vh;
		margin: 0;
		padding: 0;
	}
</style>
