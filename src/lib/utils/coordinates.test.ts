import { describe, it, expect } from 'vitest';
import { screenToWorld, worldToScreen } from './coordinates';

describe('Coordinate Utilities', () => {
	describe('screenToWorld', () => {
		it('should convert screen coordinates to world coordinates with no transform', () => {
			const transform = { x: 0, y: 0, scale: 1 };
			const result = screenToWorld(100, 200, transform);

			expect(result).toEqual({ x: 100, y: 200 });
		});

		it('should convert screen coordinates with translation', () => {
			const transform = { x: 50, y: 100, scale: 1 };
			const result = screenToWorld(100, 200, transform);

			expect(result).toEqual({ x: 50, y: 100 });
		});

		it('should convert screen coordinates with scale', () => {
			const transform = { x: 0, y: 0, scale: 2 };
			const result = screenToWorld(100, 200, transform);

			expect(result).toEqual({ x: 50, y: 100 });
		});

		it('should convert screen coordinates with translation and scale', () => {
			const transform = { x: 100, y: 200, scale: 2 };
			const result = screenToWorld(100, 200, transform);

			// (100 - 100) / 2 = 0, (200 - 200) / 2 = 0
			expect(result).toEqual({ x: 0, y: 0 });
		});

		it('should handle zoom in (scale > 1)', () => {
			const transform = { x: 0, y: 0, scale: 4 };
			const result = screenToWorld(400, 800, transform);

			expect(result).toEqual({ x: 100, y: 200 });
		});

		it('should handle zoom out (scale < 1)', () => {
			const transform = { x: 0, y: 0, scale: 0.5 };
			const result = screenToWorld(100, 200, transform);

			expect(result).toEqual({ x: 200, y: 400 });
		});

		it('should handle negative screen coordinates', () => {
			const transform = { x: 0, y: 0, scale: 1 };
			const result = screenToWorld(-100, -200, transform);

			expect(result).toEqual({ x: -100, y: -200 });
		});

		it('should handle fractional values', () => {
			const transform = { x: 50.5, y: 100.5, scale: 1.5 };
			const result = screenToWorld(100, 200, transform);

			const expectedX = (100 - 50.5) / 1.5;
			const expectedY = (200 - 100.5) / 1.5;

			expect(result.x).toBeCloseTo(expectedX, 5);
			expect(result.y).toBeCloseTo(expectedY, 5);
		});
	});

	describe('worldToScreen', () => {
		it('should convert world coordinates to screen coordinates with no transform', () => {
			const transform = { x: 0, y: 0, scale: 1 };
			const result = worldToScreen(100, 200, transform);

			expect(result).toEqual({ x: 100, y: 200 });
		});

		it('should convert world coordinates with translation', () => {
			const transform = { x: 50, y: 100, scale: 1 };
			const result = worldToScreen(100, 200, transform);

			expect(result).toEqual({ x: 150, y: 300 });
		});

		it('should convert world coordinates with scale', () => {
			const transform = { x: 0, y: 0, scale: 2 };
			const result = worldToScreen(100, 200, transform);

			expect(result).toEqual({ x: 200, y: 400 });
		});

		it('should convert world coordinates with translation and scale', () => {
			const transform = { x: 100, y: 200, scale: 2 };
			const result = worldToScreen(50, 100, transform);

			// 50 * 2 + 100 = 200, 100 * 2 + 200 = 400
			expect(result).toEqual({ x: 200, y: 400 });
		});

		it('should be inverse of screenToWorld', () => {
			const transform = { x: 123.45, y: 678.90, scale: 2.5 };
			const worldCoords = { x: 500, y: 750 };

			const screen = worldToScreen(worldCoords.x, worldCoords.y, transform);
			const world = screenToWorld(screen.x, screen.y, transform);

			expect(world.x).toBeCloseTo(worldCoords.x, 5);
			expect(world.y).toBeCloseTo(worldCoords.y, 5);
		});

		it('should handle negative world coordinates', () => {
			const transform = { x: 0, y: 0, scale: 1 };
			const result = worldToScreen(-100, -200, transform);

			expect(result).toEqual({ x: -100, y: -200 });
		});
	});

	describe('Round trip conversions', () => {
		it('should maintain accuracy through multiple conversions', () => {
			const transforms = [
				{ x: 0, y: 0, scale: 1 },
				{ x: 100, y: 200, scale: 2 },
				{ x: -50, y: -100, scale: 0.5 },
				{ x: 123.456, y: 789.012, scale: 3.14 }
			];

			for (const transform of transforms) {
				const original = { x: 500, y: 750 };

				// Convert to screen and back
				const screen = worldToScreen(original.x, original.y, transform);
				const world = screenToWorld(screen.x, screen.y, transform);

				expect(world.x).toBeCloseTo(original.x, 5);
				expect(world.y).toBeCloseTo(original.y, 5);
			}
		});
	});
});
