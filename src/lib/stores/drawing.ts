import { writable } from 'svelte/store';
import type { Stroke } from '$lib/types';

export interface DrawingState {
	strokes: Stroke[];
	currentStroke: Stroke | null;
}

function createDrawingStore() {
	const initialState: DrawingState = {
		strokes: [],
		currentStroke: null
	};

	const { subscribe, set, update } = writable<DrawingState>(initialState);

	return {
		subscribe,

		/**
		 * Start a new stroke
		 */
		startStroke: (stroke: Stroke) => {
			update((state) => ({
				...state,
				currentStroke: stroke
			}));
		},

		/**
		 * Update the current stroke's points
		 */
		updateCurrentStroke: (points: { x: number; y: number }[]) => {
			update((state) => {
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
			update((state) => {
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
			update((state) => ({
				...state,
				strokes: [...state.strokes, stroke]
			}));
		},

		/**
		 * Clear all strokes and current stroke
		 */
		clear: () => {
			set(initialState);
		},

		/**
		 * Remove the last completed stroke (for undo functionality)
		 */
		removeLastStroke: () => {
			update((state) => ({
				...state,
				strokes: state.strokes.slice(0, -1)
			}));
		},

		/**
		 * Replace all strokes (for loading saved drawings)
		 */
		setStrokes: (strokes: Stroke[]) => {
			update((state) => ({
				...state,
				strokes
			}));
		}
	};
}

export const drawing = createDrawingStore();
