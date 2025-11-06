/**
 * Performance testing utilities for Esquisse
 * Generates test data and measures rendering performance
 */

import type { Stroke } from '$lib/types';

/**
 * Generate random strokes for performance testing
 */
export function generateTestStrokes(count: number): Stroke[] {
	const strokes: Stroke[] = [];
	const colors = ['#000000', '#ff0000', '#00ff00', '#0000ff', '#ff00ff', '#ffff00', '#00ffff'];

	// Generate strokes across a large canvas area (10000x10000)
	const canvasWidth = 10000;
	const canvasHeight = 10000;

	for (let i = 0; i < count; i++) {
		// Random stroke properties
		const color = colors[Math.floor(Math.random() * colors.length)];
		const width = 1 + Math.random() * 5; // 1-6px
		const pointCount = 10 + Math.floor(Math.random() * 40); // 10-50 points per stroke

		// Random starting position
		const startX = Math.random() * canvasWidth;
		const startY = Math.random() * canvasHeight;

		// Generate points for this stroke (simulate a drawing motion)
		const points: { x: number; y: number }[] = [];
		let currentX = startX;
		let currentY = startY;

		for (let j = 0; j < pointCount; j++) {
			points.push({ x: currentX, y: currentY });

			// Move in a somewhat random direction
			currentX += (Math.random() - 0.5) * 100;
			currentY += (Math.random() - 0.5) * 100;
		}

		strokes.push({
			id: `test-stroke-${i}`,
			color,
			width,
			points,
			timestamp: Date.now() - (count - i) * 1000 // Spread timestamps
		});
	}

	return strokes;
}

/**
 * FPS counter class
 */
export class FPSCounter {
	private frames: number[] = [];
	private readonly sampleSize = 60; // Number of frames to average over

	/**
	 * Record a frame timestamp
	 */
	recordFrame(): void {
		this.frames.push(performance.now());

		// Keep only the last N frames
		if (this.frames.length > this.sampleSize) {
			this.frames.shift();
		}
	}

	/**
	 * Get current FPS
	 */
	getFPS(): number {
		if (this.frames.length < 2) {
			return 0;
		}

		// Calculate FPS from time difference
		const firstFrame = this.frames[0];
		const lastFrame = this.frames[this.frames.length - 1];
		const timeSpan = lastFrame - firstFrame;
		const fps = (this.frames.length - 1) / (timeSpan / 1000);

		return Math.round(fps);
	}

	/**
	 * Reset the counter
	 */
	reset(): void {
		this.frames = [];
	}
}

/**
 * Performance test results
 */
export interface PerformanceTestResult {
	strokeCount: number;
	avgFPS: number;
	minFPS: number;
	maxFPS: number;
	duration: number; // Test duration in seconds
	culledStrokesAvg: number; // Average number of culled strokes
}

/**
 * Run a performance test
 * Measures FPS over a period while the user can zoom/pan
 */
export class PerformanceTest {
	private fpsCounter = new FPSCounter();
	private fpsReadings: number[] = [];
	private startTime = 0;
	private isRunning = false;

	/**
	 * Start the test
	 */
	start(): void {
		this.fpsCounter.reset();
		this.fpsReadings = [];
		this.startTime = performance.now();
		this.isRunning = true;
	}

	/**
	 * Record a frame (call this on each render)
	 */
	recordFrame(): void {
		if (!this.isRunning) return;

		this.fpsCounter.recordFrame();

		// Record FPS every 10 frames
		if (this.fpsReadings.length === 0 || this.fpsReadings.length % 10 === 0) {
			const fps = this.fpsCounter.getFPS();
			if (fps > 0) {
				this.fpsReadings.push(fps);
			}
		}
	}

	/**
	 * Stop the test and return results
	 */
	stop(strokeCount: number, culledStrokesAvg: number = 0): PerformanceTestResult {
		this.isRunning = false;

		const duration = (performance.now() - this.startTime) / 1000;

		if (this.fpsReadings.length === 0) {
			return {
				strokeCount,
				avgFPS: 0,
				minFPS: 0,
				maxFPS: 0,
				duration,
				culledStrokesAvg
			};
		}

		const avgFPS = Math.round(
			this.fpsReadings.reduce((sum, fps) => sum + fps, 0) / this.fpsReadings.length
		);
		const minFPS = Math.min(...this.fpsReadings);
		const maxFPS = Math.max(...this.fpsReadings);

		return {
			strokeCount,
			avgFPS,
			minFPS,
			maxFPS,
			duration: Math.round(duration),
			culledStrokesAvg
		};
	}

	/**
	 * Check if test is running
	 */
	get running(): boolean {
		return this.isRunning;
	}
}
