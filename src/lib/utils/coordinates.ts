import type { Transform, Point } from '$lib/types';

/**
 * Convert screen coordinates to world coordinates.
 * World coordinates are independent of zoom/pan.
 */
export function screenToWorld(screenX: number, screenY: number, transform: Transform): Point {
	return {
		x: (screenX - transform.x) / transform.scale,
		y: (screenY - transform.y) / transform.scale
	};
}

/**
 * Convert world coordinates to screen coordinates.
 */
export function worldToScreen(worldX: number, worldY: number, transform: Transform): Point {
	return {
		x: worldX * transform.scale + transform.x,
		y: worldY * transform.scale + transform.y
	};
}
