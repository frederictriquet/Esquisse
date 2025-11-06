<script lang="ts">
	import Canvas from '$lib/components/Canvas.svelte';
	import { onMount, onDestroy } from 'svelte';

	onMount(() => {
		// Set document title for presentation window
		document.title = 'Esquisse - Presentation';
	});
</script>

<svelte:head>
	<title>Esquisse - Presentation</title>
</svelte:head>

<div class="presentation-view">
	<Canvas />
</div>

<style>
	.presentation-view {
		width: 100vw;
		height: 100vh;
		margin: 0;
		padding: 0;
		overflow: hidden;
		background: #ffffff;
	}

	:global(body) {
		margin: 0 !important;
		padding: 0 !important;
		overflow: hidden !important;
	}
</style>
