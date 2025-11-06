<script lang="ts">
	import { settings } from '$lib/stores/settings';
	import { transform } from '$lib/stores/transform';
	import { browser } from '$app/environment';

	export let onClear: () => void;

	let colorValue = $settings.color;
	let widthValue = $settings.width;
	let presentationWindow: Window | null = null;

	function handleResetView() {
		transform.reset();
	}

	function openPresentation() {
		if (!browser) return;

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
</script>

<div class="toolbar">
	<div class="toolbar-section">
		<h3>Drawing Tools</h3>
	</div>

	<div class="toolbar-section">
		<label for="color-picker">
			<span class="label-text">Color</span>
			<div class="color-input-wrapper">
				<input
					id="color-picker"
					type="color"
					value={colorValue}
					on:input={handleColorChange}
					class="color-picker"
				/>
				<span class="color-value">{colorValue}</span>
			</div>
		</label>
	</div>

	<div class="toolbar-section">
		<label for="width-slider">
			<span class="label-text">Width: {widthValue}px</span>
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
		<div class="width-preview">
			<div
				class="preview-line"
				style="height: {widthValue}px; background-color: {colorValue};"
			/>
		</div>
	</div>

	<div class="toolbar-section">
		<button class="clear-button" on:click={onClear}> Clear Canvas </button>
	</div>

	<div class="toolbar-section">
		<button class="reset-button" on:click={handleResetView}> Reset View </button>
	</div>

	<div class="toolbar-section">
		<button class="present-button" on:click={openPresentation}> Open Presentation </button>
	</div>
</div>

<style>
	.toolbar {
		position: fixed;
		top: 20px;
		left: 20px;
		background: white;
		border: 1px solid #ddd;
		border-radius: 8px;
		padding: 16px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		z-index: 1000;
		min-width: 200px;
		font-family: system-ui, -apple-system, sans-serif;
	}

	.toolbar-section {
		margin-bottom: 16px;
	}

	.toolbar-section:last-child {
		margin-bottom: 0;
	}

	h3 {
		margin: 0 0 12px 0;
		font-size: 14px;
		font-weight: 600;
		color: #333;
	}

	label {
		display: block;
		cursor: pointer;
	}

	.label-text {
		display: block;
		font-size: 13px;
		font-weight: 500;
		color: #555;
		margin-bottom: 8px;
	}

	.color-input-wrapper {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.color-picker {
		width: 50px;
		height: 32px;
		border: 1px solid #ddd;
		border-radius: 4px;
		cursor: pointer;
		padding: 2px;
	}

	.color-picker:hover {
		border-color: #999;
	}

	.color-value {
		font-size: 12px;
		color: #666;
		font-family: monospace;
	}

	.width-slider {
		width: 100%;
		height: 6px;
		border-radius: 3px;
		outline: none;
		cursor: pointer;
	}

	.width-slider::-webkit-slider-thumb {
		appearance: none;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: #007bff;
		cursor: pointer;
	}

	.width-slider::-webkit-slider-thumb:hover {
		background: #0056b3;
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

	.width-preview {
		margin-top: 12px;
		padding: 8px;
		background: #f8f8f8;
		border-radius: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 30px;
	}

	.preview-line {
		width: 100%;
		border-radius: 2px;
		transition: all 0.2s ease;
	}

	.clear-button {
		width: 100%;
		padding: 10px 16px;
		background: #dc3545;
		color: white;
		border: none;
		border-radius: 4px;
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s ease;
	}

	.clear-button:hover {
		background: #c82333;
	}

	.clear-button:active {
		transform: translateY(1px);
	}

	.reset-button {
		width: 100%;
		padding: 10px 16px;
		background: #007bff;
		color: white;
		border: none;
		border-radius: 4px;
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s ease;
	}

	.reset-button:hover {
		background: #0056b3;
	}

	.reset-button:active {
		transform: translateY(1px);
	}

	.present-button {
		width: 100%;
		padding: 10px 16px;
		background: #28a745;
		color: white;
		border: none;
		border-radius: 4px;
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s ease;
	}

	.present-button:hover {
		background: #218838;
	}

	.present-button:active {
		transform: translateY(1px);
	}
</style>
