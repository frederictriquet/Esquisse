import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { Transform } from '$lib/types';

// Zoom limits for safety and usability
const MIN_SCALE = 0.01;
const MAX_SCALE = 100;

const CHANNEL_NAME = 'esquisse-transform';
const INITIAL_TRANSFORM: Transform = {
	x: 0,
	y: 0,
	scale: 1
};

/**
 * Creates a transform store for managing canvas zoom and pan state.
 */
function createTransformStore() {
	const { subscribe, set, update } = writable<Transform>(INITIAL_TRANSFORM);

	// BroadcastChannel for multi-window sync
	let channel: BroadcastChannel | null = null;
	let isReceiving = false;

	if (browser) {
		channel = new BroadcastChannel(CHANNEL_NAME);

		channel.onmessage = (event) => {
			isReceiving = true;
			set(event.data);
			isReceiving = false;
		};
	}

	// Helper to broadcast updates
	const broadcastUpdate = (fn: (state: Transform) => Transform) => {
		update((state) => {
			const newState = fn(state);
			if (channel && !isReceiving) {
				channel.postMessage(newState);
			}
			return newState;
		});
	};

	const broadcastSet = (value: Transform) => {
		set(value);
		if (channel && !isReceiving) {
			channel.postMessage(value);
		}
	};

	return {
		subscribe,

		/**
		 * Zoom the canvas centered on a specific point.
		 * @param delta - Zoom delta (positive = zoom in, negative = zoom out)
		 * @param mouseX - Mouse X position in screen coordinates
		 * @param mouseY - Mouse Y position in screen coordinates
		 */
		zoom: (delta: number, mouseX: number, mouseY: number) => {
			broadcastUpdate((transform) => {
				// Calculate zoom factor (smaller deltas for smoother zooming)
				const zoomFactor = 1 + delta * 0.001;
				const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, transform.scale * zoomFactor));

				// If scale didn't change (hit limits), don't update
				if (newScale === transform.scale) {
					return transform;
				}

				// Convert mouse position to world coordinates before zoom
				const worldX = (mouseX - transform.x) / transform.scale;
				const worldY = (mouseY - transform.y) / transform.scale;

				// Calculate new pan offset to keep world point under mouse
				const newX = mouseX - worldX * newScale;
				const newY = mouseY - worldY * newScale;

				return {
					x: newX,
					y: newY,
					scale: newScale
				};
			});
		},

		/**
		 * Pan the canvas by a delta amount.
		 * @param deltaX - X movement in screen pixels
		 * @param deltaY - Y movement in screen pixels
		 */
		pan: (deltaX: number, deltaY: number) => {
			broadcastUpdate((transform) => ({
				x: transform.x + deltaX,
				y: transform.y + deltaY,
				scale: transform.scale
			}));
		},

		/**
		 * Reset transform to default state.
		 */
		reset: () => {
			broadcastSet(INITIAL_TRANSFORM);
		}
	};
}

export const transform = createTransformStore();
