import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { Stroke } from '$lib/types';

export interface DrawingState {
	strokes: Stroke[];
	currentStroke: Stroke | null;
}

const CHANNEL_NAME = 'esquisse-drawing';

function createDrawingStore() {
	const initialState: DrawingState = {
		strokes: [],
		currentStroke: null
	};

	const { subscribe, set, update } = writable<DrawingState>(initialState);

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
	const broadcastUpdate = (fn: (state: DrawingState) => DrawingState) => {
		update((state) => {
			const newState = fn(state);
			if (channel && !isReceiving) {
				channel.postMessage(newState);
			}
			return newState;
		});
	};

	const broadcastSet = (value: DrawingState) => {
		set(value);
		if (channel && !isReceiving) {
			channel.postMessage(value);
		}
	};

	return {
		subscribe,

		/**
		 * Start a new stroke
		 */
		startStroke: (stroke: Stroke) => {
			broadcastUpdate((state) => ({
				...state,
				currentStroke: stroke
			}));
		},

		/**
		 * Update the current stroke's points
		 */
		updateCurrentStroke: (points: { x: number; y: number }[]) => {
			broadcastUpdate((state) => {
				if (!state.currentStroke) return state;

				return {
					...state,
					currentStroke: {
						...state.currentStroke,
						points
					}
				};
			});
		},

		/**
		 * Finish the current stroke and add it to the strokes array
		 */
		finishStroke: () => {
			broadcastUpdate((state) => {
				if (!state.currentStroke) return state;

				return {
					strokes: [...state.strokes, state.currentStroke],
					currentStroke: null
				};
			});
		},

		/**
		 * Add a completed stroke directly (for undo/redo, imports, etc.)
		 */
		addStroke: (stroke: Stroke) => {
			broadcastUpdate((state) => ({
				...state,
				strokes: [...state.strokes, stroke]
			}));
		},

		/**
		 * Clear all strokes and current stroke
		 */
		clear: () => {
			broadcastSet(initialState);
		},

		/**
		 * Remove the last completed stroke (for undo functionality)
		 */
		removeLastStroke: () => {
			broadcastUpdate((state) => ({
				...state,
				strokes: state.strokes.slice(0, -1)
			}));
		},

		/**
		 * Replace all strokes (for loading saved drawings)
		 */
		setStrokes: (strokes: Stroke[]) => {
			broadcastUpdate((state) => ({
				...state,
				strokes
			}));
		}
	};
}

export const drawing = createDrawingStore();
