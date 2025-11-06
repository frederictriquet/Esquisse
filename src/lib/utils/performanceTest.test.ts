import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateTestStrokes, FPSCounter, PerformanceTest } from './performanceTest';

describe('Performance Test Utilities', () => {
	describe('generateTestStrokes', () => {
		it('should generate the requested number of strokes', () => {
			const strokes = generateTestStrokes(100);
			expect(strokes).toHaveLength(100);
		});

		it('should generate unique stroke IDs', () => {
			const strokes = generateTestStrokes(50);
			const ids = strokes.map((s) => s.id);
			const uniqueIds = new Set(ids);

			expect(uniqueIds.size).toBe(50);
		});

		it('should generate strokes with valid colors', () => {
			const strokes = generateTestStrokes(10);
			const validColors = [
				'#000000',
				'#ff0000',
				'#00ff00',
				'#0000ff',
				'#ff00ff',
				'#ffff00',
				'#00ffff'
			];

			for (const stroke of strokes) {
				expect(validColors).toContain(stroke.color);
			}
		});

		it('should generate strokes with valid widths', () => {
			const strokes = generateTestStrokes(50);

			for (const stroke of strokes) {
				expect(stroke.width).toBeGreaterThanOrEqual(1);
				expect(stroke.width).toBeLessThanOrEqual(6);
			}
		});

		it('should generate strokes with 10-50 points', () => {
			const strokes = generateTestStrokes(50);

			for (const stroke of strokes) {
				expect(stroke.points.length).toBeGreaterThanOrEqual(10);
				expect(stroke.points.length).toBeLessThanOrEqual(50);
			}
		});

		it('should generate strokes across large canvas (10000x10000)', () => {
			const strokes = generateTestStrokes(100);

			// Check that strokes start across the full canvas
			const startX = strokes.map((s) => s.points[0].x);
			const startY = strokes.map((s) => s.points[0].y);

			expect(Math.min(...startX)).toBeLessThan(1000);
			expect(Math.max(...startX)).toBeGreaterThan(9000);
			expect(Math.min(...startY)).toBeLessThan(1000);
			expect(Math.max(...startY)).toBeGreaterThan(9000);
		});

		it('should generate points with reasonable variation', () => {
			const strokes = generateTestStrokes(10);

			for (const stroke of strokes) {
				const xs = stroke.points.map((p) => p.x);
				const ys = stroke.points.map((p) => p.y);

				// Points should have some variation (not all the same)
				const xRange = Math.max(...xs) - Math.min(...xs);
				const yRange = Math.max(...ys) - Math.min(...ys);

				expect(xRange).toBeGreaterThan(0);
				expect(yRange).toBeGreaterThan(0);
			}
		});

		it('should generate strokes with unique timestamps', () => {
			const strokes = generateTestStrokes(10);
			const timestamps = strokes.map((s) => s.timestamp);

			// Timestamps should be sequential and unique
			for (let i = 1; i < timestamps.length; i++) {
				expect(timestamps[i]).not.toBe(timestamps[i - 1]);
			}
		});

		it('should handle single stroke generation', () => {
			const strokes = generateTestStrokes(1);

			expect(strokes).toHaveLength(1);
			expect(strokes[0].points.length).toBeGreaterThanOrEqual(10);
		});

		it('should handle large number of strokes', () => {
			const strokes = generateTestStrokes(5000);

			expect(strokes).toHaveLength(5000);
			expect(strokes[0].id).toBe('test-stroke-0');
			expect(strokes[4999].id).toBe('test-stroke-4999');
		});
	});

	describe('FPSCounter', () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		it('should initialize with 0 FPS', () => {
			const counter = new FPSCounter();
			expect(counter.getFPS()).toBe(0);
		});

		it('should return 0 FPS with only one frame recorded', () => {
			const counter = new FPSCounter();
			counter.recordFrame();
			expect(counter.getFPS()).toBe(0);
		});

		it('should calculate FPS correctly with two frames', () => {
			const counter = new FPSCounter();

			counter.recordFrame();
			vi.advanceTimersByTime(1000); // 1 second later
			counter.recordFrame();

			const fps = counter.getFPS();
			expect(fps).toBeGreaterThan(0);
			expect(fps).toBeLessThanOrEqual(60);
		});

		it('should calculate 60 FPS for frames 16.67ms apart', () => {
			const counter = new FPSCounter();

			// Simulate 10 frames at 60fps (16.67ms per frame)
			for (let i = 0; i < 10; i++) {
				counter.recordFrame();
				vi.advanceTimersByTime(16.67);
			}

			const fps = counter.getFPS();
			expect(fps).toBeGreaterThanOrEqual(55);
			expect(fps).toBeLessThanOrEqual(65);
		});

		it('should calculate 30 FPS for frames 33.33ms apart', () => {
			const counter = new FPSCounter();

			// Simulate 10 frames at 30fps
			for (let i = 0; i < 10; i++) {
				counter.recordFrame();
				vi.advanceTimersByTime(33.33);
			}

			const fps = counter.getFPS();
			expect(fps).toBeGreaterThanOrEqual(25);
			expect(fps).toBeLessThanOrEqual(35);
		});

		it('should maintain a sliding window of 60 frames', () => {
			const counter = new FPSCounter();

			// Record 100 frames
			for (let i = 0; i < 100; i++) {
				counter.recordFrame();
				vi.advanceTimersByTime(16.67);
			}

			// FPS should only consider the most recent 60 frames
			const fps = counter.getFPS();
			expect(fps).toBeDefined();
		});

		it('should reset correctly', () => {
			const counter = new FPSCounter();

			// Record some frames
			for (let i = 0; i < 10; i++) {
				counter.recordFrame();
				vi.advanceTimersByTime(16.67);
			}

			expect(counter.getFPS()).toBeGreaterThan(0);

			counter.reset();
			expect(counter.getFPS()).toBe(0);
		});

		it('should handle irregular frame timing', () => {
			const counter = new FPSCounter();

			counter.recordFrame();
			vi.advanceTimersByTime(16.67); // 60fps
			counter.recordFrame();
			vi.advanceTimersByTime(50); // 20fps
			counter.recordFrame();
			vi.advanceTimersByTime(100); // 10fps
			counter.recordFrame();

			const fps = counter.getFPS();
			expect(fps).toBeGreaterThan(0);
			expect(fps).toBeLessThan(60);
		});
	});

	describe('PerformanceTest', () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		it('should initialize as not running', () => {
			const test = new PerformanceTest();
			expect(test.running).toBe(false);
		});

		it('should set running state when started', () => {
			const test = new PerformanceTest();
			test.start();
			expect(test.running).toBe(true);
		});

		it('should record frames during test', () => {
			const test = new PerformanceTest();
			test.start();

			// Record some frames
			for (let i = 0; i < 10; i++) {
				test.recordFrame();
				vi.advanceTimersByTime(16.67);
			}

			expect(test.running).toBe(true);
		});

		it('should calculate results on stop', () => {
			const test = new PerformanceTest();
			test.start();

			// Record 60 frames at 60fps
			for (let i = 0; i < 60; i++) {
				test.recordFrame();
				vi.advanceTimersByTime(16.67);
			}

			const results = test.stop(1000, 850);

			expect(results.strokeCount).toBe(1000);
			expect(results.culledStrokesAvg).toBe(850);
			expect(results.avgFPS).toBeGreaterThan(0);
			expect(results.minFPS).toBeGreaterThan(0);
			expect(results.maxFPS).toBeGreaterThan(0);
			expect(results.duration).toBeGreaterThan(0);
		});

		it('should calculate min/max/avg FPS correctly', () => {
			const test = new PerformanceTest();
			test.start();

			// Simulate varying FPS
			for (let i = 0; i < 30; i++) {
				test.recordFrame();
				vi.advanceTimersByTime(16.67); // 60fps
			}

			for (let i = 0; i < 30; i++) {
				test.recordFrame();
				vi.advanceTimersByTime(33.33); // 30fps
			}

			const results = test.stop(100, 50);

			expect(results.minFPS).toBeLessThanOrEqual(results.avgFPS);
			expect(results.maxFPS).toBeGreaterThanOrEqual(results.avgFPS);
			expect(results.avgFPS).toBeGreaterThan(0);
		});

		it('should handle very short test duration', () => {
			const test = new PerformanceTest();
			test.start();

			test.recordFrame();
			vi.advanceTimersByTime(100);
			test.recordFrame();

			const results = test.stop(10, 0);

			expect(results.duration).toBeGreaterThanOrEqual(0);
			expect(results.strokeCount).toBe(10);
		});

		it('should return zero FPS for no frames recorded', () => {
			const test = new PerformanceTest();
			test.start();

			const results = test.stop(100, 50);

			expect(results.avgFPS).toBe(0);
			expect(results.minFPS).toBe(0);
			expect(results.maxFPS).toBe(0);
		});

		it('should not record frames when not running', () => {
			const test = new PerformanceTest();

			// Try to record without starting
			test.recordFrame();
			vi.advanceTimersByTime(16.67);
			test.recordFrame();

			test.start();
			const results = test.stop(100, 50);

			expect(results.avgFPS).toBe(0);
		});

		it('should reset state on new test', () => {
			const test = new PerformanceTest();

			// First test
			test.start();
			for (let i = 0; i < 30; i++) {
				test.recordFrame();
				vi.advanceTimersByTime(16.67);
			}
			test.stop(100, 50);

			// Second test
			test.start();
			expect(test.running).toBe(true);

			for (let i = 0; i < 20; i++) {
				test.recordFrame();
				vi.advanceTimersByTime(16.67);
			}

			const results = test.stop(200, 100);
			expect(results.strokeCount).toBe(200);
		});

		it('should have numeric duration', () => {
			const test = new PerformanceTest();
			test.start();

			vi.advanceTimersByTime(1234.56);

			const results = test.stop(100, 50);
			expect(typeof results.duration).toBe('number');
			expect(results.duration).toBeGreaterThan(1);
		});
	});
});
