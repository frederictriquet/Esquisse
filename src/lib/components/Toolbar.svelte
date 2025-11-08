<script lang="ts">
	import { settings } from '$lib/stores/settings';
	import { transform } from '$lib/stores/transform';
	import { drawing } from '$lib/stores/drawing';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	export let onClear: () => void;
	export let onHelp: (() => void) | undefined = undefined;

	let colorValue = $settings.color;
	let widthValue = $settings.width;
	let presentationWindow: Window | null = null;
	let saveError = '';
	let loadError = '';
	let saveSuccess = false;
	let loadSuccess = false;

	// Track undo/redo availability
	let canUndo = false;
	let canRedo = false;

	// Update undo/redo state reactively
	$: {
		// React to drawing state changes to update button states
		$drawing;
		canUndo = drawing.canUndo();
		canRedo = drawing.canRedo();
	}

	// Tauri window API (dynamically imported)
	let WebviewWindow: any = null;
	let isTauri = false;

	onMount(async () => {
		// Initialize Tauri WebviewWindow API if running in Tauri
		if (typeof window !== 'undefined' && '__TAURI__' in window) {
			try {
				const webviewModule = await import('@tauri-apps/api/webviewWindow');
				WebviewWindow = webviewModule.WebviewWindow;
				isTauri = true;
			} catch (e) {
				console.error('Failed to load Tauri webview API:', e);
			}
		}
	});

	function clearMessages() {
		saveError = '';
		loadError = '';
		saveSuccess = false;
		loadSuccess = false;
	}

	function handleClear() {
		if (confirm('Are you sure you want to clear the canvas? This action cannot be undone.')) {
			onClear();
		}
	}

	async function handleSave() {
		clearMessages();
		try {
			await drawing.save();
			saveSuccess = true;
			setTimeout(() => {
				saveSuccess = false;
			}, 3000);
		} catch (error) {
			saveError = error instanceof Error ? error.message : 'Failed to save file';
			setTimeout(() => {
				saveError = '';
			}, 5000);
		}
	}

	async function handleLoad() {
		clearMessages();
		try {
			await drawing.load();
			loadSuccess = true;
			setTimeout(() => {
				loadSuccess = false;
			}, 3000);
		} catch (error) {
			loadError = error instanceof Error ? error.message : 'Failed to load file';
			setTimeout(() => {
				loadError = '';
			}, 5000);
		}
	}

	function handleResetView() {
		transform.reset();
	}

	function handleUndo() {
		drawing.undo();
	}

	function handleRedo() {
		drawing.redo();
	}

	async function openPresentation() {
		if (!browser) return;

		// Use Tauri webview API if available (desktop mode)
		if (isTauri && WebviewWindow) {
			try {
				const currentUrl = window.location.origin;
				const presentationUrl = `${currentUrl}/present`;

				// Generate unique label to avoid conflicts with closed windows
				const windowLabel = `presentation-${Date.now()}`;

				new WebviewWindow(windowLabel, {
					url: presentationUrl,
					title: 'Esquisse Presentation',
					width: 1024,
					height: 768,
					center: true,
					resizable: true,
					fullscreen: false
				});
			} catch (error) {
				console.error('Failed to open presentation window:', error);
			}
			return;
		}

		// Browser fallback: use window.open()
		// Check if window is already open
		if (presentationWindow && !presentationWindow.closed) {
			presentationWindow.focus();
			return;
		}

		// Open presentation window
		const width = 1024;
		const height = 768;
		const left = window.screenX + (window.outerWidth - width) / 2;
		const top = window.screenY + (window.outerHeight - height) / 2;

		presentationWindow = window.open(
			'/present',
			'esquisse-presentation',
			`width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,location=no`
		);

		// Monitor when window closes
		if (presentationWindow) {
			const checkClosed = setInterval(() => {
				if (presentationWindow && presentationWindow.closed) {
					presentationWindow = null;
					clearInterval(checkClosed);
				}
			}, 500);
		}
	}

	// Update store when inputs change
	function handleColorChange(event: Event) {
		const target = event.target as HTMLInputElement;
		colorValue = target.value;
		settings.setColor(colorValue);
	}

	function handleWidthChange(event: Event) {
		const target = event.target as HTMLInputElement;
		widthValue = parseFloat(target.value);
		settings.setWidth(widthValue);
	}

	// Sync local values with store changes (in case store is updated elsewhere)
	$: colorValue = $settings.color;
	$: widthValue = $settings.width;

	// Export methods for keyboard shortcuts
	export function triggerSave() {
		handleSave();
	}

	export function triggerLoad() {
		handleLoad();
	}
</script>

<div class="toolbar">
	<div class="toolbar-section">
		<div class="zoom-display">
			<span class="label-text">Zoom</span>
			<span class="zoom-value">{Math.round($transform.scale * 100)}%</span>
		</div>
	</div>

	<div class="toolbar-section">
		<label for="color-picker" class="color-label">
			<span class="label-text">Color</span>
			<span class="color-value">{colorValue}</span>
			<input
				id="color-picker"
				type="color"
				value={colorValue}
				on:input={handleColorChange}
				class="color-picker"
			/>
		</label>
	</div>

	<div class="toolbar-section">
		<label for="width-slider">
			<div class="width-header">
				<span class="label-text width-label">Width: {widthValue}px</span>
				<div class="width-preview">
					<div
						class="preview-line"
						style="height: {widthValue}px; background-color: {colorValue};"
					/>
				</div>
			</div>
			<input
				id="width-slider"
				type="range"
				min="1"
				max="20"
				step="0.5"
				value={widthValue}
				on:input={handleWidthChange}
				class="width-slider"
			/>
		</label>
	</div>

	<div class="toolbar-section">
		<label class="checkbox-label">
			<input
				type="checkbox"
				checked={$settings.viewportCulling}
				on:change={(e) => settings.setViewportCulling(e.currentTarget.checked)}
				class="checkbox"
			/>
			<span class="label-text">Viewport Culling</span>
		</label>
	</div>

	<div class="toolbar-section">
		<div class="button-grid-4">
			<button
				class="icon-button"
				on:click={handleUndo}
				disabled={!canUndo}
				title="Undo (Ctrl+Z)"
			>
				↺
			</button>
			<button class="icon-button" on:click={handleRedo} disabled={!canRedo} title="Redo (Ctrl+Y)">
				↻
			</button>
			<button class="icon-button" on:click={handleClear} title="Clear Canvas"> 🗑️ </button>
			<button class="icon-button" on:click={handleResetView} title="Reset View (R)"> 🎯 </button>
			<button class="icon-button" on:click={handleSave} title="Save Drawing (Ctrl+S)"> 💾 </button>
			<button class="icon-button" on:click={handleLoad} title="Load Drawing (Ctrl+O)"> 📂 </button>
			<button class="icon-button" on:click={openPresentation} title="Open Presentation"> 🖥️ </button>
			{#if onHelp}
				<button class="icon-button" on:click={onHelp} title="Help (H)"> ❓ </button>
			{/if}
		</div>
	</div>

	{#if saveSuccess}
		<div class="message success">File saved successfully!</div>
	{/if}

	{#if loadSuccess}
		<div class="message success">File loaded successfully!</div>
	{/if}

	{#if saveError}
		<div class="message error">{saveError}</div>
	{/if}

	{#if loadError}
		<div class="message error">{loadError}</div>
	{/if}
</div>

<style>
	.toolbar {
		position: fixed;
		top: 20px;
		left: 20px;
		background: white;
		border: 1px solid #ddd;
		border-radius: 8px;
		padding: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		z-index: 1000;
		width: 180px;
		font-family: system-ui, -apple-system, sans-serif;
	}

	.toolbar-section {
		margin-bottom: 12px;
	}

	.toolbar-section:last-child {
		margin-bottom: 0;
	}

	label {
		display: block;
		cursor: pointer;
	}

	.label-text {
		display: block;
		font-size: 12px;
		font-weight: 500;
		color: #555;
		margin-bottom: 6px;
	}

	.color-label {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.color-label .label-text {
		display: inline;
		margin-bottom: 0;
		flex-shrink: 0;
	}

	.color-value {
		font-size: 12px;
		color: #666;
		font-family: monospace;
		flex: 1;
		min-width: 65px;
		line-height: 1;
	}

	.color-picker {
		width: 36px;
		height: 24px;
		border: 1px solid #ddd;
		border-radius: 4px;
		cursor: pointer;
		padding: 2px;
		flex-shrink: 0;
	}

	.color-picker:hover {
		border-color: #999;
	}

	.width-slider {
		width: 100%;
		appearance: none;
		outline: none;
		cursor: pointer;
		background: transparent;
	}

	/* WebKit (Safari/Chrome) track */
	.width-slider::-webkit-slider-runnable-track {
		width: 100%;
		height: 6px;
		background: #ddd;
		border-radius: 3px;
		cursor: pointer;
	}

	/* WebKit (Safari/Chrome) thumb */
	.width-slider::-webkit-slider-thumb {
		appearance: none;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: #007bff;
		cursor: pointer;
		margin-top: -5px; /* Center the thumb on the track */
	}

	.width-slider::-webkit-slider-thumb:hover {
		background: #0056b3;
	}

	/* Firefox track */
	.width-slider::-moz-range-track {
		width: 100%;
		height: 6px;
		background: #ddd;
		border-radius: 3px;
		cursor: pointer;
	}

	.width-slider::-moz-range-thumb {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: #007bff;
		cursor: pointer;
		border: none;
	}

	.width-slider::-moz-range-thumb:hover {
		background: #0056b3;
	}

	.width-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 6px;
		margin-bottom: 6px;
	}

	.width-label {
		width: 80px;
		flex-shrink: 0;
	}

	.width-preview {
		padding: 4px 6px;
		background: #f8f8f8;
		border-radius: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 50px;
		flex: 1;
		height: 20px;
		overflow: hidden;
	}

	.preview-line {
		width: 100%;
		border-radius: 2px;
		transition: all 0.2s ease;
		max-height: 20px;
	}


	.message {
		padding: 8px 12px;
		border-radius: 4px;
		font-size: 13px;
		font-weight: 500;
		text-align: center;
		margin-top: 8px;
	}

	.message.success {
		background: #d4edda;
		color: #155724;
		border: 1px solid #c3e6cb;
	}

	.message.error {
		background: #f8d7da;
		color: #721c24;
		border: 1px solid #f5c6cb;
	}

	.zoom-display {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.zoom-display .label-text {
		margin-bottom: 0;
	}

	.zoom-value {
		font-size: 12px;
		color: #666;
		font-family: monospace;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 6px;
		cursor: pointer;
	}

	.checkbox {
		width: 16px;
		height: 16px;
		cursor: pointer;
		accent-color: #007bff;
	}

	.button-grid-4 {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 4px;
	}

	.icon-button {
		padding: 4px;
		background: #f8f8f8;
		color: #333;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 16px;
		cursor: pointer;
		transition: all 0.2s ease;
		min-width: 32px;
		min-height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.icon-button:hover:not(:disabled) {
		background: #e8e8e8;
		border-color: #999;
	}

	.icon-button:active:not(:disabled) {
		transform: translateY(1px);
		background: #ddd;
	}

	.icon-button:disabled {
		background: #f8f8f8;
		color: #ccc;
		cursor: not-allowed;
		opacity: 0.5;
		border-color: #eee;
	}
</style>
