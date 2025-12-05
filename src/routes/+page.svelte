<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Canvas from '$lib/components/Canvas.svelte';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import KeyboardShortcuts from '$lib/components/KeyboardShortcuts.svelte';
	import HelpModal from '$lib/components/HelpModal.svelte';
	import UpdateNotification from '$lib/components/UpdateNotification.svelte';
	import { versionStore } from '$lib/stores/version';

	let canvasComponent: Canvas;
	let toolbarComponent: Toolbar;
	let showHelp = false;
	let performanceTestRunning = false;

	onMount(() => {
		// Start periodic version checking
		versionStore.startPeriodicCheck();
	});

	onDestroy(() => {
		// Clean up interval when component is destroyed
		versionStore.stopPeriodicCheck();
	});

	function handleClear() {
		canvasComponent.clear();
	}

	function handleSave() {
		toolbarComponent.triggerSave();
	}

	function handleLoad() {
		toolbarComponent.triggerLoad();
	}

	function handleHelp() {
		showHelp = true;
	}

	function handlePerformanceTest() {
		if (!performanceTestRunning) {
			// Start test with 1000 strokes (can be adjusted)
			canvasComponent.startPerformanceTest(1000);
			performanceTestRunning = true;
		} else {
			// Stop test and show results
			canvasComponent.stopPerformanceTest();
			performanceTestRunning = false;
		}
	}
</script>

<svelte:head>
	<title>Esquisse - Drawing Application</title>
	<meta name="description" content="A simple drawing application built with SvelteKit" />
</svelte:head>

<KeyboardShortcuts
	on:save={handleSave}
	on:load={handleLoad}
	on:clear={handleClear}
	on:help={handleHelp}
	on:performanceTest={handlePerformanceTest}
/>

<HelpModal bind:open={showHelp} />
<UpdateNotification />

<Toolbar bind:this={toolbarComponent} onClear={handleClear} onHelp={handleHelp} />

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
