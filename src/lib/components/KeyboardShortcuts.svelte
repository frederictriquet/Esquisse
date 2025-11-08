<script lang="ts">
	import { onMount } from 'svelte';
	import { drawing } from '$lib/stores/drawing';
	import { transform } from '$lib/stores/transform';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher<{
		save: void;
		load: void;
		clear: void;
		help: void;
		performanceTest: void;
	}>();

	/**
	 * Handle keyboard shortcuts globally
	 */
	function handleKeyDown(event: KeyboardEvent) {
		// Check for modifier keys
		const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
		const ctrlOrCmd = isMac ? event.metaKey : event.ctrlKey;

		// Ctrl/Cmd + S: Save
		if (ctrlOrCmd && event.key === 's') {
			event.preventDefault();
			dispatch('save');
			return;
		}

		// Ctrl/Cmd + O: Load
		if (ctrlOrCmd && event.key === 'o') {
			event.preventDefault();
			dispatch('load');
			return;
		}

		// Ctrl/Cmd + Z: Undo
		if (ctrlOrCmd && event.key === 'z' && !event.shiftKey) {
			event.preventDefault();
			drawing.undo();
			return;
		}

		// Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y: Redo
		if (ctrlOrCmd && ((event.shiftKey && event.key === 'z') || event.key === 'y')) {
			event.preventDefault();
			drawing.redo();
			return;
		}

		// Ctrl/Cmd + Shift + C: Clear canvas
		if (ctrlOrCmd && event.shiftKey && event.key === 'C') {
			event.preventDefault();
			if (confirm('Clear all strokes? This cannot be undone.')) {
				dispatch('clear');
			}
			return;
		}

		// R: Reset view (no modifier)
		if (!ctrlOrCmd && !event.shiftKey && !event.altKey && event.key === 'r') {
			event.preventDefault();
			transform.reset();
			return;
		}

		// H or ?: Open help
		if (!ctrlOrCmd && (event.key === 'h' || event.key === '?')) {
			event.preventDefault();
			dispatch('help');
			return;
		}

		// T: Toggle performance test
		if (!ctrlOrCmd && !event.shiftKey && !event.altKey && event.key === 't') {
			event.preventDefault();
			dispatch('performanceTest');
			return;
		}
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeyDown);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	});
</script>

<!-- This component has no visual representation -->
