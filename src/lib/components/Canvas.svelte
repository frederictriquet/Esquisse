<script lang="ts">
	import { onMount } from 'svelte';
	import { transform } from '$lib/stores/transform';
	import { screenToWorld } from '$lib/utils/coordinates';
	import type { Stroke, Point } from '$lib/types';

	// Canvas reference
	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null = null;

	// Drawing state
	let isDrawing = false;
	let isPanning = false;
	let lastPanPoint: Point | null = null;
	let currentStroke: Stroke | null = null;
	let strokes: Stroke[] = [];

	// Drawing settings (simple defaults for Phase 1)
	const DEFAULT_COLOR = '#000000';
	const DEFAULT_WIDTH = 2;

	// Subscribe to transform changes to trigger re-render
	// Need to reference specific properties to make reactivity work
	$: if (ctx) {
		// Access transform properties to make reactive
		void $transform.x;
		void $transform.y;
		void $transform.scale;
		renderCanvas();
	}

	/**
	 * Initialize canvas context and set up event listeners
	 */
	onMount(() => {
		ctx = canvas.getContext('2d');
		if (!ctx) {
			console.error('Failed to get canvas context');
			return;
		}

		// Set canvas size to match viewport
		resizeCanvas();

		// Handle window resize to keep canvas full screen
		window.addEventListener('resize', resizeCanvas);

		return () => {
			window.removeEventListener('resize', resizeCanvas);
		};
	});

	/**
	 * Resize canvas to fill viewport
	 * Note: Resizing clears the canvas, so we re-render all strokes
	 */
	function resizeCanvas() {
		if (!canvas || !ctx) return;

		// Set canvas size to viewport dimensions
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		// Re-render all strokes after resize
		renderCanvas();
	}

	/**
	 * Start a new stroke or pan on pointer down
	 */
	function handlePointerDown(event: PointerEvent) {
		if (!canvas) return;

		const screenPoint = getPointerPosition(event);

		// Left button - start drawing
		if (event.button === 0) {
			isDrawing = true;

			// Convert screen position to world coordinates
			const worldPoint = screenToWorld(screenPoint.x, screenPoint.y, $transform);

			// Create new stroke with world coordinates
			// Width is stored in world coordinates so it zooms naturally
			currentStroke = {
				id: crypto.randomUUID(),
				color: DEFAULT_COLOR,
				width: DEFAULT_WIDTH / $transform.scale,
				points: [worldPoint],
				timestamp: Date.now()
			};

			// Capture pointer to ensure we receive all events
			canvas.setPointerCapture(event.pointerId);
		}
		// Right button - start panning
		else if (event.button === 2) {
			isPanning = true;
			lastPanPoint = screenPoint;
		}
	}

	/**
	 * Add points to current stroke or pan on pointer move
	 */
	function handlePointerMove(event: PointerEvent) {
		const screenPoint = getPointerPosition(event);

		if (isDrawing && currentStroke) {
			// Convert screen position to world coordinates
			const worldPoint = screenToWorld(screenPoint.x, screenPoint.y, $transform);

			// Add point to current stroke
			currentStroke.points.push(worldPoint);

			// Re-render canvas with updated stroke
			renderCanvas();
		} else if (isPanning && lastPanPoint) {
			// Calculate pan delta
			const deltaX = screenPoint.x - lastPanPoint.x;
			const deltaY = screenPoint.y - lastPanPoint.y;

			// Apply pan
			transform.pan(deltaX, deltaY);

			// Update last pan point
			lastPanPoint = screenPoint;
		}
	}

	/**
	 * Finish stroke or pan on pointer up
	 */
	function handlePointerUp(event: PointerEvent) {
		if (event.button === 0 && isDrawing && currentStroke) {
			isDrawing = false;

			// Add completed stroke to strokes array
			strokes = [...strokes, currentStroke];
			currentStroke = null;

			// Release pointer capture
			if (canvas) {
				canvas.releasePointerCapture(event.pointerId);
			}

			// Final render
			renderCanvas();
		} else if (event.button === 2 && isPanning) {
			isPanning = false;
			lastPanPoint = null;
		}
	}

	/**
	 * Get pointer position relative to canvas
	 */
	function getPointerPosition(event: PointerEvent): Point {
		const rect = canvas.getBoundingClientRect();
		return {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top
		};
	}

	/**
	 * Get mouse position from any mouse-like event
	 */
	function getMousePosition(event: MouseEvent | WheelEvent): Point {
		const rect = canvas.getBoundingClientRect();
		return {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top
		};
	}

	/**
	 * Handle mouse wheel for zooming
	 */
	function handleWheel(event: WheelEvent) {
		event.preventDefault();

		const screenPoint = getMousePosition(event);

		// Use deltaY for zoom (negative = zoom in, positive = zoom out)
		// Negate to make wheel up = zoom in
		transform.zoom(-event.deltaY, screenPoint.x, screenPoint.y);
	}

	/**
	 * Prevent context menu on right-click
	 */
	function handleContextMenu(event: MouseEvent) {
		event.preventDefault();
	}

	/**
	 * Render all strokes and current stroke to canvas with transform applied
	 */
	function renderCanvas() {
		if (!ctx || !canvas) return;

		// Clear canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Save current context state
		ctx.save();

		// Apply transform matrix
		ctx.setTransform(
			$transform.scale,
			0,
			0,
			$transform.scale,
			$transform.x,
			$transform.y
		);

		// Draw all completed strokes (points and width are in world coordinates)
		// Strokes zoom naturally with the canvas transform
		for (const stroke of strokes) {
			drawStroke(stroke);
		}

		// Draw current stroke being drawn
		// Width was calculated at current zoom level, so appears 2px on screen
		if (currentStroke && currentStroke.points.length > 0) {
			drawStroke(currentStroke);
		}

		// Restore context state
		ctx.restore();
	}

	/**
	 * Draw a single stroke on the canvas
	 * Stroke width is in world coordinates and zooms naturally with the canvas transform
	 */
	function drawStroke(stroke: Stroke) {
		if (!ctx || stroke.points.length === 0) return;

		ctx.beginPath();
		ctx.strokeStyle = stroke.color;
		// Width is in world coordinates, canvas transform handles the scaling
		ctx.lineWidth = stroke.width;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';

		// Move to first point
		const firstPoint = stroke.points[0];
		ctx.moveTo(firstPoint.x, firstPoint.y);

		// Draw line through all points
		for (let i = 1; i < stroke.points.length; i++) {
			const point = stroke.points[i];
			ctx.lineTo(point.x, point.y);
		}

		ctx.stroke();
	}
</script>

<canvas
	bind:this={canvas}
	on:pointerdown={handlePointerDown}
	on:pointermove={handlePointerMove}
	on:pointerup={handlePointerUp}
	on:wheel={handleWheel}
	on:contextmenu={handleContextMenu}
	class="drawing-canvas"
/>

<style>
	.drawing-canvas {
		display: block;
		width: 100vw;
		height: 100vh;
		cursor: crosshair;
		touch-action: none; /* Prevent default touch behaviors like scrolling */
		user-select: none; /* Prevent text selection while drawing */
	}
</style>
