<script lang="ts">
	import Canvas from '$lib/components/Canvas.svelte';
	import Toolbar from '$lib/components/Toolbar.svelte';

	let canvasComponent: Canvas;

	function handleClear() {
		canvasComponent.clear();
	}
</script>

<svelte:head>
	<title>Esquisse - Drawing Application</title>
	<meta name="description" content="A simple drawing application built with SvelteKit" />
</svelte:head>

<Toolbar onClear={handleClear} />

<main>
	<Canvas bind:this={canvasComponent} />
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
