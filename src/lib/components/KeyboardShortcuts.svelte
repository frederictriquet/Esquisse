<script lang="ts">
	import { onMount } from 'svelte';
	import { drawing } from '$lib/stores/drawing';
	import { transform } from '$lib/stores/transform';
	import { createEventDispatcher } from 'svelte';
	import { SHORTCUTS, matchesShortcut } from '$lib/config/shortcuts';

	const dispatch = createEventDispatcher<{
		save: void;
		load: void;
		clear: void;
		help: void;
		performanceTest: void;
	}>();

	const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

	/**
	 * Handle keyboard shortcuts globally
	 */
	function handleKeyDown(event: KeyboardEvent) {
		// Save
		if (matchesShortcut(event, SHORTCUTS.save, isMac)) {
			event.preventDefault();
			dispatch('save');
			return;
		}

		// Load
		if (matchesShortcut(event, SHORTCUTS.load, isMac)) {
			event.preventDefault();
			dispatch('load');
			return;
		}

		// Undo
		if (matchesShortcut(event, SHORTCUTS.undo, isMac)) {
			event.preventDefault();
			drawing.undo();
			return;
		}

		// Redo (supports multiple shortcuts)
		const redoShortcuts = Array.isArray(SHORTCUTS.redo) ? SHORTCUTS.redo : [SHORTCUTS.redo];
		for (const shortcut of redoShortcuts) {
			if (matchesShortcut(event, shortcut, isMac)) {
				event.preventDefault();
				drawing.redo();
				return;
			}
		}

		// Clear canvas
		if (matchesShortcut(event, SHORTCUTS.clear, isMac)) {
			event.preventDefault();
			if (confirm('Clear all strokes? This cannot be undone.')) {
				dispatch('clear');
			}
			return;
		}

		// Reset view
		if (matchesShortcut(event, SHORTCUTS.resetView, isMac)) {
			event.preventDefault();
			transform.reset();
			return;
		}

		// Zoom in
		if (matchesShortcut(event, SHORTCUTS.zoomIn, isMac) || matchesShortcut(event, SHORTCUTS.zoomInAlt, isMac)) {
			event.preventDefault();
			const centerX = window.innerWidth / 2;
			const centerY = window.innerHeight / 2;
			transform.zoom(200, centerX, centerY);
			return;
		}

		// Zoom out
		if (matchesShortcut(event, SHORTCUTS.zoomOut, isMac)) {
			event.preventDefault();
			const centerX = window.innerWidth / 2;
			const centerY = window.innerHeight / 2;
			transform.zoom(-200, centerX, centerY);
			return;
		}

		// Reset zoom
		if (matchesShortcut(event, SHORTCUTS.resetZoom, isMac)) {
			event.preventDefault();
			transform.reset();
			return;
		}

		// Help (supports multiple shortcuts)
		const helpShortcuts = Array.isArray(SHORTCUTS.help) ? SHORTCUTS.help : [SHORTCUTS.help];
		for (const shortcut of helpShortcuts) {
			if (matchesShortcut(event, shortcut, isMac)) {
				event.preventDefault();
				dispatch('help');
				return;
			}
		}

		// Performance test
		if (matchesShortcut(event, SHORTCUTS.performanceTest, isMac)) {
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
