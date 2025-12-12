<script lang="ts">
	import { onMount } from 'svelte';
	import { transform } from '$lib/stores/transform';
	import { settings } from '$lib/stores/settings';
	import { drawing } from '$lib/stores/drawing';
	import { screenToWorld } from '$lib/utils/coordinates';
	import type { Point, Stroke } from '$lib/types';
	import { generateTestStrokes, PerformanceTest } from '$lib/utils/performanceTest';
	import { SHORTCUTS, isPanModeKey, isZoomModeKey } from '$lib/config/shortcuts';

	// Canvas reference
	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null = null;

	// Drawing state
	let isDrawing = false;
	let isPanning = false;
	let isZooming = false; // Track if in zoom mode
	let lastPanPoint: Point | null = null;
	let lastZoomPoint: Point | null = null; // Track last Y position for zoom delta calculation
	let zoomCenterPoint: Point | null = null; // Track zoom center (initial click point)
	let hoverPoint: (Point & { pressure: number }) | null = null; // For stylus hover preview
	let spaceKeyDown = false; // Track if space key is pressed for pan mode
	let zoomKeyDown = false; // Track if zoom key is pressed for zoom mode

	// Touch state for gestures
	let touchState: {
		initialDistance: number | null;
		lastCenter: Point | null;
		isMultiTouch: boolean;
	} = {
		initialDistance: null,
		lastCenter: null,
		isMultiTouch: false
	};

	// Performance testing
	let performanceTest = new PerformanceTest();
	let lastCulledCount = 0;

	// Subscribe to drawing store
	$: strokes = $drawing.strokes;
	$: currentStroke = $drawing.currentStroke;

	// Export clear function for toolbar
	export function clear() {
		drawing.clear();
	}

	// Export performance test functions
	export function startPerformanceTest(strokeCount: number = 1000) {
		// Generate test strokes
		const testStrokes = generateTestStrokes(strokeCount);

		// Set strokes in the store
		drawing.setStrokes(testStrokes);

		// Start the performance test
		performanceTest.start();

		console.log(`🧪 Performance test started with ${strokeCount} strokes`);
		console.log('📊 Pan and zoom around the canvas for 10-15 seconds, then press T again to see results');
	}

	export function stopPerformanceTest() {
		if (!performanceTest.running) {
			console.log('⚠️ No performance test is currently running');
			return;
		}

		// Stop test and get results
		const results = performanceTest.stop(strokes.length, lastCulledCount);

		// Display results
		console.log('');
		console.log('═══════════════════════════════════════');
		console.log('📊 PERFORMANCE TEST RESULTS');
		console.log('═══════════════════════════════════════');
		console.log(`Total Strokes: ${results.strokeCount}`);
		console.log(`Test Duration: ${results.duration}s`);
		console.log(`Average FPS: ${results.avgFPS}`);
		console.log(`Min FPS: ${results.minFPS}`);
		console.log(`Max FPS: ${results.maxFPS}`);
		console.log(`Avg Culled Strokes: ${Math.round(results.culledStrokesAvg)}`);
		console.log(`Avg Rendered: ${results.strokeCount - Math.round(results.culledStrokesAvg)}`);
		console.log('═══════════════════════════════════════');
		console.log('');

		// Show alert with results
		alert(`Performance Test Results:

Strokes: ${results.strokeCount}
Duration: ${results.duration}s
Average FPS: ${results.avgFPS}
Min FPS: ${results.minFPS}
Max FPS: ${results.maxFPS}
Avg Culled: ${Math.round(results.culledStrokesAvg)} (${Math.round((results.culledStrokesAvg / results.strokeCount) * 100)}%)

${results.avgFPS >= 50 ? '✅' : '⚠️'} Performance: ${results.avgFPS >= 50 ? 'Excellent' : results.avgFPS >= 30 ? 'Good' : 'Needs Improvement'}`);
	}

	// Subscribe to transform changes to trigger re-render
	// Need to reference specific properties to make reactivity work
	$: if (ctx) {
		// Access transform properties to make reactive
		void $transform.x;
		void $transform.y;
		void $transform.scale;
		// Also trigger on drawing state changes
		void strokes;
		void currentStroke;
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

		// Handle pan and zoom mode keys (configurable via shortcuts.ts)
		const handleKeyDown = (event: KeyboardEvent) => {
			// Pan mode
			if (isPanModeKey(event) && !spaceKeyDown) {
				event.preventDefault();
				spaceKeyDown = true;
				if (canvas) {
					canvas.style.cursor = 'grab';
				}
			}
			// Zoom mode
			else if (isZoomModeKey(event) && !zoomKeyDown) {
				event.preventDefault();
				zoomKeyDown = true;
				if (canvas) {
					canvas.style.cursor = 'zoom-in';
				}
			}
		};

		const handleKeyUp = (event: KeyboardEvent) => {
			// Pan mode release
			if (isPanModeKey(event)) {
				event.preventDefault();
				spaceKeyDown = false;
				// Stop panning if it was active
				if (isPanning) {
					isPanning = false;
					lastPanPoint = null;
				}
				// Reset cursor to crosshair
				if (canvas) {
					canvas.style.cursor = 'crosshair';
				}
			}
			// Zoom mode release
			else if (isZoomModeKey(event)) {
				event.preventDefault();
				zoomKeyDown = false;
				// Stop zooming if it was active
				if (isZooming) {
					isZooming = false;
					lastZoomPoint = null;
					zoomCenterPoint = null;
				}
				// Reset cursor to crosshair
				if (canvas) {
					canvas.style.cursor = 'crosshair';
				}
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);

		return () => {
			window.removeEventListener('resize', resizeCanvas);
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('keyup', handleKeyUp);
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

		// Prevent drawing during multi-touch gestures
		if (touchState.isMultiTouch) {
			return;
		}

		const screenPoint = getPointerPosition(event);

		// Check for stylus barrel button (typically button 5)
		// Barrel button acts as eraser or alternative tool
		if (event.button === 5 || (event.pointerType === 'pen' && event.button === 2)) {
			// Future: implement eraser or alternative tool
			console.log('Stylus barrel button pressed - eraser mode');
			return;
		}

		// Space + Left button - start panning (like Photoshop)
		if (event.button === 0 && spaceKeyDown) {
			isPanning = true;
			lastPanPoint = screenPoint;
			if (canvas) {
				canvas.style.cursor = 'grabbing';
			}
			return;
		}

		// Zoom key + Left button - start zooming (drag up/down to zoom)
		if (event.button === 0 && zoomKeyDown) {
			isZooming = true;
			lastZoomPoint = screenPoint; // For tracking vertical movement
			zoomCenterPoint = screenPoint; // Remember where we clicked - this is the zoom center
			if (canvas) {
				canvas.style.cursor = 'zoom-in';
			}
			return;
		}

		// Left button - start drawing
		if (event.button === 0) {
			isDrawing = true;

			// Convert screen position to world coordinates
			const worldPoint = screenToWorld(screenPoint.x, screenPoint.y, $transform);

			// Capture pressure from stylus/tablet (0.5 default for mouse)
			const pressure = event.pressure || 0.5;

			// Capture tilt data (stylus angle)
			const tiltX = event.tiltX || 0;
			const tiltY = event.tiltY || 0;

			// Start new stroke in drawing store
			// Width is stored in world coordinates so it zooms naturally
			drawing.startStroke({
				id: crypto.randomUUID(),
				color: $settings.color,
				width: $settings.width / $transform.scale,
				points: [{ ...worldPoint, pressure, tiltX, tiltY }],
				timestamp: Date.now()
			});

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

		if (isDrawing && currentStroke && !touchState.isMultiTouch) {
			// Convert screen position to world coordinates
			const worldPoint = screenToWorld(screenPoint.x, screenPoint.y, $transform);

			// Capture pressure from stylus/tablet (0.5 default for mouse)
			const pressure = event.pressure || 0.5;

			// Capture tilt data (stylus angle)
			const tiltX = event.tiltX || 0;
			const tiltY = event.tiltY || 0;

			// Update current stroke in drawing store
			drawing.updateCurrentStroke([...currentStroke.points, { ...worldPoint, pressure, tiltX, tiltY }]);
		} else if (isZooming && lastZoomPoint && zoomCenterPoint) {
			// Calculate vertical movement for zoom
			const deltaY = lastZoomPoint.y - screenPoint.y; // Inverted: up = positive = zoom in

			// Apply zoom with sensitivity adjustment (1 pixel = 5 units of zoom)
			// Zoom is centered on the initial click point (zoomCenterPoint)
			const zoomDelta = deltaY * 5;
			transform.zoom(zoomDelta, zoomCenterPoint.x, zoomCenterPoint.y);

			// Update last zoom point for continuous zooming (but keep zoomCenterPoint fixed)
			lastZoomPoint = screenPoint;
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

			// Finish current stroke in drawing store
			drawing.finishStroke();

			// Release pointer capture
			if (canvas) {
				canvas.releasePointerCapture(event.pointerId);
			}
		} else if (event.button === 0 && isZooming) {
			// Stop zooming on pointer up (but keep zoomKeyDown if key still pressed)
			isZooming = false;
			lastZoomPoint = null;
			zoomCenterPoint = null;
		} else if (event.button === 2 && isPanning) {
			isPanning = false;
			lastPanPoint = null;
		}
	}

	/**
	 * Handle pointer hover (stylus proximity without touch)
	 */
	function handlePointerHover(event: PointerEvent) {
		// Only show hover for stylus devices
		if (event.pointerType === 'pen' && event.buttons === 0) {
			const screenPoint = getPointerPosition(event);
			const worldPoint = screenToWorld(screenPoint.x, screenPoint.y, $transform);
			const pressure = event.pressure || 0.3; // Light preview pressure

			hoverPoint = { ...worldPoint, pressure };
		} else {
			hoverPoint = null;
		}
	}

	/**
	 * Handle pointer leave (clear hover)
	 */
	function handlePointerLeave() {
		hoverPoint = null;
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
	 * Get touch center point and distance between two touches
	 */
	function getTouchInfo(touches: TouchList): { center: Point; distance: number } | null {
		if (touches.length < 2) return null;

		const touch1 = touches[0];
		const touch2 = touches[1];

		const rect = canvas.getBoundingClientRect();
		const x1 = touch1.clientX - rect.left;
		const y1 = touch1.clientY - rect.top;
		const x2 = touch2.clientX - rect.left;
		const y2 = touch2.clientY - rect.top;

		const dx = x2 - x1;
		const dy = y2 - y1;
		const distance = Math.sqrt(dx * dx + dy * dy);

		const center = {
			x: (x1 + x2) / 2,
			y: (y1 + y2) / 2
		};

		return { center, distance };
	}

	/**
	 * Handle touch start - prepare for pinch/pan gestures
	 */
	function handleTouchStart(event: TouchEvent) {
		// Set multi-touch flag when 2+ fingers are detected
		touchState.isMultiTouch = event.touches.length >= 2;

		// If multi-touch detected, cancel any active drawing
		if (touchState.isMultiTouch && isDrawing) {
			isDrawing = false;
			// Cancel the current stroke (don't save it)
			drawing.cancelStroke();
		}

		// Only handle two-finger gestures for zoom/pan
		if (event.touches.length !== 2) {
			touchState.initialDistance = null;
			touchState.lastCenter = null;
			return;
		}

		// Prevent default to avoid conflicts
		event.preventDefault();

		const info = getTouchInfo(event.touches);
		if (info) {
			touchState.initialDistance = info.distance;
			touchState.lastCenter = info.center;
		}
	}

	/**
	 * Handle touch move - apply pinch zoom and two-finger pan
	 */
	function handleTouchMove(event: TouchEvent) {
		// Only handle two-finger gestures
		if (event.touches.length !== 2) return;

		event.preventDefault();

		const info = getTouchInfo(event.touches);
		if (!info || !touchState.lastCenter || touchState.initialDistance === null) return;

		const { center, distance } = info;

		// Apply pinch zoom
		if (touchState.initialDistance > 0) {
			const distanceChange = distance - touchState.initialDistance;
			// Use a sensitivity factor for smooth zooming (higher = more responsive)
			const zoomDelta = distanceChange * 2.5;
			transform.zoom(zoomDelta, center.x, center.y);
			touchState.initialDistance = distance;
		}

		// Apply pan based on center point movement
		if (touchState.lastCenter) {
			const deltaX = center.x - touchState.lastCenter.x;
			const deltaY = center.y - touchState.lastCenter.y;
			transform.pan(deltaX, deltaY);
		}

		touchState.lastCenter = center;
	}

	/**
	 * Handle touch end - reset gesture state
	 */
	function handleTouchEnd(event: TouchEvent) {
		if (event.touches.length < 2) {
			touchState.initialDistance = null;
			touchState.lastCenter = null;
			touchState.isMultiTouch = false;
		}
	}

	/**
	 * Check if a stroke is visible in the current viewport
	 * Optimizes rendering by skipping offscreen strokes
	 */
	function isStrokeVisible(stroke: Stroke): boolean {
		if (!canvas || stroke.points.length === 0) return false;

		// Calculate viewport bounds in world coordinates
		const viewportLeft = -$transform.x / $transform.scale;
		const viewportTop = -$transform.y / $transform.scale;
		const viewportRight = viewportLeft + canvas.width / $transform.scale;
		const viewportBottom = viewportTop + canvas.height / $transform.scale;

		// Add margin for stroke width
		const margin = stroke.width * 2;

		// Check if any point is within viewport (with margin)
		for (const point of stroke.points) {
			if (
				point.x >= viewportLeft - margin &&
				point.x <= viewportRight + margin &&
				point.y >= viewportTop - margin &&
				point.y <= viewportBottom + margin
			) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Render all strokes and current stroke to canvas with transform applied
	 * Includes viewport culling for performance optimization
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

		// Draw completed strokes (with optional viewport culling optimization)
		// Strokes zoom naturally with the canvas transform
		let culledCount = 0;
		for (const stroke of strokes) {
			// Apply viewport culling only if enabled in settings
			if ($settings.viewportCulling) {
				if (isStrokeVisible(stroke)) {
					drawStroke(stroke);
				} else {
					culledCount++;
				}
			} else {
				// Draw all strokes when culling is disabled
				drawStroke(stroke);
			}
		}

		// Draw current stroke being drawn (always visible)
		// Width was calculated at current zoom level, so appears 2px on screen
		if (currentStroke && currentStroke.points.length > 0) {
			drawStroke(currentStroke);
		}

		// Draw stylus hover preview (cursor preview)
		if (hoverPoint && !isDrawing) {
			const radius = ($settings.width / $transform.scale) * hoverPoint.pressure / 2;
			ctx.beginPath();
			ctx.arc(hoverPoint.x, hoverPoint.y, radius, 0, Math.PI * 2);
			ctx.strokeStyle = $settings.color;
			ctx.lineWidth = 1 / $transform.scale; // 1px stroke at any zoom
			ctx.stroke();
			ctx.fillStyle = $settings.color + '40'; // 25% opacity
			ctx.fill();
		}

		// Restore context state
		ctx.restore();

		// Track culled count for performance testing
		lastCulledCount = culledCount;

		// Record frame for performance testing
		if (performanceTest.running) {
			performanceTest.recordFrame();
		}

		// Log culling stats in development (can be removed for production)
		if (culledCount > 0 && strokes.length > 100 && !performanceTest.running) {
			console.log(`Viewport culling: rendered ${strokes.length - culledCount}/${strokes.length} strokes`);
		}
	}

	/**
	 * Apply pressure curve adjustment
	 * curve: 0.5 = linear, < 0.5 = soft (more responsive to light touch), > 0.5 = hard (requires more pressure)
	 */
	function applyPressureCurve(pressure: number, curve: number): number {
		if (curve === 0.5) return pressure; // Linear, no adjustment

		// Use power function for curve adjustment
		const exponent = curve * 4; // Map 0-1 to 0-4 range
		return Math.pow(pressure, exponent);
	}

	/**
	 * Calculate tilt-based width modifier
	 * More tilt = thicker stroke (like a brush at an angle)
	 */
	function getTiltModifier(tiltX: number = 0, tiltY: number = 0): number {
		if (!$settings.tiltEnabled) return 1.0;

		// Calculate tilt magnitude (0-90 degrees)
		const tiltMagnitude = Math.sqrt(tiltX * tiltX + tiltY * tiltY);

		// Map 0-90 degrees to 1.0-2.0 multiplier
		// More tilt = broader brush stroke
		return 1.0 + (tiltMagnitude / 90) * 1.0;
	}

	/**
	 * Draw a single stroke on the canvas with smooth line interpolation
	 * Stroke width is in world coordinates and zooms naturally with the canvas transform
	 * Supports pressure-sensitive width variation
	 */
	function drawStroke(stroke: Stroke) {
		if (!ctx || stroke.points.length === 0) return;

		// Check if stroke has varying pressure (not just constant 0.5 from mouse)
		const pressures = stroke.points.map(p => p.pressure || 0.5);
		const minPressure = Math.min(...pressures);
		const maxPressure = Math.max(...pressures);
		const hasPressureVariation = (maxPressure - minPressure) > 0.05; // 5% threshold

		if (!hasPressureVariation) {
			// Use uniform rendering for constant pressure (mouse)
			drawStrokeUniform(stroke);
		} else {
			// Use pressure-sensitive rendering for variable pressure (tablet)
			drawStrokePressure(stroke);
		}
	}

	/**
	 * Draw stroke with uniform width (legacy, for backwards compatibility)
	 */
	function drawStrokeUniform(stroke: Stroke) {
		if (!ctx || stroke.points.length === 0) return;

		ctx.beginPath();
		ctx.strokeStyle = stroke.color;
		ctx.lineWidth = stroke.width;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';

		// Move to first point
		const firstPoint = stroke.points[0];
		ctx.moveTo(firstPoint.x, firstPoint.y);

		// For single point, just draw a dot
		if (stroke.points.length === 1) {
			ctx.lineTo(firstPoint.x + 0.01, firstPoint.y);
		}
		// For two points, draw a straight line
		else if (stroke.points.length === 2) {
			const secondPoint = stroke.points[1];
			ctx.lineTo(secondPoint.x, secondPoint.y);
		}
		// For multiple points, use quadratic curves for smoothing
		else {
			// Draw smooth line using quadratic curves
			for (let i = 1; i < stroke.points.length - 1; i++) {
				const point = stroke.points[i];
				const nextPoint = stroke.points[i + 1];

				// Calculate midpoint between current and next point
				const midX = (point.x + nextPoint.x) / 2;
				const midY = (point.y + nextPoint.y) / 2;

				// Draw quadratic curve from previous point to midpoint
				ctx.quadraticCurveTo(point.x, point.y, midX, midY);
			}

			// Draw final segment to last point
			const lastPoint = stroke.points[stroke.points.length - 1];
			const secondLastPoint = stroke.points[stroke.points.length - 2];
			ctx.quadraticCurveTo(secondLastPoint.x, secondLastPoint.y, lastPoint.x, lastPoint.y);
		}

		ctx.stroke();
	}

	/**
	 * Draw stroke with pressure-sensitive width variation
	 * Uses circular stamps interpolated along the path for smooth, continuous strokes
	 */
	function drawStrokePressure(stroke: Stroke) {
		if (!ctx || stroke.points.length === 0) return;

		ctx.fillStyle = stroke.color;

		// For single point, draw a circle with pressure-based radius
		if (stroke.points.length === 1) {
			const point = stroke.points[0];
			const pressure = point.pressure || 0.5;
			const adjustedPressure = applyPressureCurve(pressure, $settings.pressureCurve);
			const amplifiedPressure = adjustedPressure * $settings.pressureMultiplier;
			const tiltModifier = getTiltModifier(point.tiltX, point.tiltY);
			const radius = (stroke.width * amplifiedPressure * tiltModifier) / 2;

			ctx.beginPath();
			ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
			ctx.fill();
			return;
		}

		// Draw stroke using circular stamps for smooth appearance
		// This technique creates smooth, brush-like strokes even with pressure variation
		for (let i = 0; i < stroke.points.length; i++) {
			const point = stroke.points[i];

			// Get pressure and apply adjustments
			const pressure = point.pressure || 0.5;
			const adjustedPressure = applyPressureCurve(pressure, $settings.pressureCurve);
			const amplifiedPressure = adjustedPressure * $settings.pressureMultiplier;
			const tiltModifier = getTiltModifier(point.tiltX, point.tiltY);

			// Calculate radius for this point
			const radius = (stroke.width * amplifiedPressure * tiltModifier) / 2;

			// Draw a filled circle at each point
			ctx.beginPath();
			ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
			ctx.fill();
		}

		// Additionally, draw connecting lines for better coverage between points
		// This fills gaps when points are far apart (fast drawing)
		if (stroke.points.length > 1) {
			for (let i = 0; i < stroke.points.length - 1; i++) {
				const point = stroke.points[i];
				const nextPoint = stroke.points[i + 1];

				// Calculate pressures
				const pressure = point.pressure || 0.5;
				const nextPressure = nextPoint.pressure || 0.5;

				const adjustedPressure = applyPressureCurve(pressure, $settings.pressureCurve);
				const adjustedNextPressure = applyPressureCurve(nextPressure, $settings.pressureCurve);

				const amplifiedPressure = adjustedPressure * $settings.pressureMultiplier;
				const amplifiedNextPressure = adjustedNextPressure * $settings.pressureMultiplier;

				const tiltModifier1 = getTiltModifier(point.tiltX, point.tiltY);
				const tiltModifier2 = getTiltModifier(nextPoint.tiltX, nextPoint.tiltY);

				// Use average width for the connecting line
				const avgWidth = stroke.width * ((amplifiedPressure * tiltModifier1 + amplifiedNextPressure * tiltModifier2) / 2);

				ctx.strokeStyle = stroke.color;
				ctx.lineWidth = avgWidth;
				ctx.lineCap = 'round';
				ctx.lineJoin = 'round';

				ctx.beginPath();
				ctx.moveTo(point.x, point.y);
				ctx.lineTo(nextPoint.x, nextPoint.y);
				ctx.stroke();
			}
		}
	}
</script>

<canvas
	bind:this={canvas}
	on:pointerdown={handlePointerDown}
	on:pointermove={(e) => { handlePointerMove(e); handlePointerHover(e); }}
	on:pointerup={handlePointerUp}
	on:pointerleave={handlePointerLeave}
	on:wheel={handleWheel}
	on:contextmenu={handleContextMenu}
	on:touchstart={handleTouchStart}
	on:touchmove={handleTouchMove}
	on:touchend={handleTouchEnd}
	on:touchcancel={handleTouchEnd}
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
