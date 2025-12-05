<script lang="ts">
	export let open = false;

	function handleClose() {
		open = false;
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			handleClose();
		}
	}

	const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
	const modKey = isMac ? '⌘' : 'Ctrl';

	const buildTimestamp = import.meta.env.VITE_BUILD_TIMESTAMP;
	const formattedBuildDate = buildTimestamp
		? new Date(buildTimestamp).toLocaleString()
		: 'Development';
</script>

{#if open}
	<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
	<div class="modal-backdrop" on:click={handleClose} on:keydown={handleKeyDown}>
		<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
		<div class="modal-content" on:click|stopPropagation>
			<div class="modal-header">
				<h2>Esquisse Help & Shortcuts</h2>
				<button class="close-button" on:click={handleClose}>&times;</button>
			</div>

			<div class="modal-body">
				<section>
					<h3>Drawing</h3>
					<ul>
						<li><strong>Left Click + Drag</strong> - Draw with mouse</li>
						<li><strong>Right Click + Drag</strong> - Pan the canvas</li>
						<li><strong>Mouse Wheel</strong> - Zoom in/out (centered on cursor)</li>
					</ul>
				</section>

				<section>
					<h3>Toolbar & Shortcuts</h3>
					<ul>
						<li><strong>Color Picker</strong> - Choose drawing color</li>
						<li><strong>Width Slider</strong> - Adjust line thickness (1-20px)</li>
						<li>
							<strong>↺ Undo</strong> (<strong>{modKey} + Z</strong>) - Undo last action
						</li>
						<li>
							<strong>↻ Redo</strong> (<strong>{modKey} + Y</strong> or <strong>{modKey} + Shift + Z</strong>) - Redo last undone action
						</li>
						<li>
							<strong>🗑️ Clear Canvas</strong> (<strong>{modKey} + Shift + C</strong>) - Remove all drawings
						</li>
						<li>
							<strong>🎯 Reset View</strong> (<strong>R</strong>) - Return to default zoom/position
						</li>
						<li>
							<strong>💾 Save Drawing</strong> (<strong>{modKey} + S</strong>) - Save your work as JSON file
						</li>
						<li>
							<strong>📂 Load Drawing</strong> (<strong>{modKey} + O</strong>) - Load a saved JSON file
						</li>
						<li>
							<strong>🖥️ Open Presentation</strong> - Open a separate window for presentation
						</li>
						<li>
							<strong>❓ Help</strong> (<strong>H</strong> or <strong>?</strong>) - Show this help dialog
						</li>
						<li><strong>T</strong> - Toggle performance test (1000 strokes)</li>
						<li><strong>Esc</strong> - Close this dialog</li>
					</ul>
				</section>

				<section>
					<h3>Multi-Window Sync</h3>
					<ul>
						<li>
							<strong>Presentation Mode</strong> - Click "Open Presentation" to open a
							canvas-only view
						</li>
						<li>
							<strong>Real-Time Sync</strong> - All changes sync instantly across windows
						</li>
						<li><strong>Independent Windows</strong> - Each window can have different zoom/pan</li>
					</ul>
				</section>

				<section>
					<h3>File Format</h3>
					<ul>
						<li><strong>Format</strong> - JSON (human-readable)</li>
						<li><strong>Version</strong> - Files include version for future compatibility</li>
						<li><strong>Metadata</strong> - Created and modified timestamps</li>
						<li><strong>Coordinates</strong> - Strokes stored in world coordinates</li>
					</ul>
				</section>

				<section>
					<h3>Performance</h3>
					<ul>
						<li><strong>Viewport Culling</strong> - Only visible strokes are rendered</li>
						<li><strong>Smooth Lines</strong> - Quadratic curve interpolation</li>
						<li><strong>Optimized</strong> - Handles 1000+ strokes at 60fps</li>
					</ul>
				</section>
			</div>

			<div class="modal-footer">
				<div class="build-info">
					<span class="build-label">Build:</span>
					<span class="build-timestamp">{formattedBuildDate}</span>
				</div>
				<button class="primary-button" on:click={handleClose}>Got it!</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10000;
		padding: 20px;
		backdrop-filter: blur(2px);
	}

	.modal-content {
		background: white;
		border-radius: 12px;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
		max-width: 700px;
		width: 100%;
		max-height: 90vh;
		display: flex;
		flex-direction: column;
		font-family: system-ui, -apple-system, sans-serif;
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20px 24px;
		border-bottom: 1px solid #e0e0e0;
	}

	.modal-header h2 {
		margin: 0;
		font-size: 20px;
		font-weight: 600;
		color: #333;
	}

	.close-button {
		background: none;
		border: none;
		font-size: 32px;
		line-height: 1;
		color: #999;
		cursor: pointer;
		padding: 0;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
		transition: all 0.2s ease;
	}

	.close-button:hover {
		background: #f5f5f5;
		color: #333;
	}

	.modal-body {
		padding: 24px;
		overflow-y: auto;
		flex: 1;
	}

	section {
		margin-bottom: 24px;
	}

	section:last-child {
		margin-bottom: 0;
	}

	section h3 {
		margin: 0 0 12px 0;
		font-size: 16px;
		font-weight: 600;
		color: #333;
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	li {
		padding: 6px 0;
		font-size: 14px;
		line-height: 1.5;
		color: #555;
	}

	li strong {
		color: #333;
		font-weight: 500;
	}

	.modal-footer {
		padding: 16px 24px;
		border-top: 1px solid #e0e0e0;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.build-info {
		display: flex;
		gap: 8px;
		font-size: 13px;
		color: #666;
	}

	.build-label {
		font-weight: 500;
	}

	.build-timestamp {
		color: #888;
	}

	.primary-button {
		padding: 10px 24px;
		background: #007bff;
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s ease;
	}

	.primary-button:hover {
		background: #0056b3;
	}

	.primary-button:active {
		transform: translateY(1px);
	}

	/* Scrollbar styling */
	.modal-body::-webkit-scrollbar {
		width: 8px;
	}

	.modal-body::-webkit-scrollbar-track {
		background: #f5f5f5;
		border-radius: 4px;
	}

	.modal-body::-webkit-scrollbar-thumb {
		background: #ccc;
		border-radius: 4px;
	}

	.modal-body::-webkit-scrollbar-thumb:hover {
		background: #999;
	}
</style>
