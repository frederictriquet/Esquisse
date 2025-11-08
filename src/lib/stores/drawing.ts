import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { Stroke } from '$lib/types';
import {
	createEsquisseFile,
	downloadEsquisseFile,
	readEsquisseFile,
	selectFile,
	type EsquisseFile
} from '$lib/utils/fileIO';
import { history } from './history';

export interface DrawingState {
	strokes: Stroke[];
	currentStroke: Stroke | null;
	currentFile: EsquisseFile | null; // Track current file for save/load
}

const CHANNEL_NAME = 'esquisse-drawing';

function createDrawingStore() {
	const initialState: DrawingState = {
		strokes: [],
		currentStroke: null,
		currentFile: null
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

				// Record action in history
				history.record({
					type: 'stroke_add',
					stroke: state.currentStroke
				});

				return {
					...state,
					strokes: [...state.strokes, state.currentStroke],
					currentStroke: null
				};
			});
		},

		/**
		 * Cancel the current stroke without saving it
		 */
		cancelStroke: () => {
			broadcastUpdate((state) => ({
				...state,
				currentStroke: null
			}));
		},

		/**
		 * Add a completed stroke directly (for undo/redo, imports, etc.)
		 * @param recordHistory - Whether to record this action in history (default: false for undo/redo)
		 */
		addStroke: (stroke: Stroke, recordHistory = false) => {
			broadcastUpdate((state) => ({
				...state,
				strokes: [...state.strokes, stroke]
			}));

			if (recordHistory) {
				history.record({
					type: 'stroke_add',
					stroke
				});
			}
		},

		/**
		 * Clear all strokes and current stroke
		 */
		clear: () => {
			let currentStrokes: Stroke[] = [];
			const unsubscribe = subscribe((state) => {
				currentStrokes = state.strokes;
			});
			unsubscribe();

			// Record clear action in history (so it can be undone)
			if (currentStrokes.length > 0) {
				history.record({
					type: 'strokes_clear',
					strokes: currentStrokes
				});
			}

			broadcastSet(initialState);
		},

		/**
		 * Remove a stroke at a specific index (for undo/redo)
		 * @param index - Index of stroke to remove
		 * @param recordHistory - Whether to record this action in history
		 */
		removeStroke: (index: number, recordHistory = false) => {
			broadcastUpdate((state) => {
				if (index < 0 || index >= state.strokes.length) return state;

				const stroke = state.strokes[index];
				if (recordHistory) {
					history.record({
						type: 'stroke_remove',
						stroke,
						index
					});
				}

				const newStrokes = [...state.strokes];
				newStrokes.splice(index, 1);

				return {
					...state,
					strokes: newStrokes
				};
			});
		},

		/**
		 * Remove the last completed stroke (legacy method - now uses history)
		 */
		removeLastStroke: () => {
			let lastIndex = -1;
			const unsubscribe = subscribe((state) => {
				lastIndex = state.strokes.length - 1;
			});
			unsubscribe();

			if (lastIndex >= 0) {
				drawing.removeStroke(lastIndex, true);
			}
		},

		/**
		 * Replace all strokes (for loading saved drawings)
		 */
		setStrokes: (strokes: Stroke[]) => {
			broadcastUpdate((state) => ({
				...state,
				strokes
			}));
		},

		/**
		 * Save drawing to file
		 */
		save: async (filename?: string): Promise<void> => {
			try {
				let currentState: DrawingState | undefined;
				const unsubscribe = subscribe((state) => {
					currentState = state;
				});
				unsubscribe();

				if (!currentState) {
					throw new Error('Failed to get drawing state');
				}

				const file = createEsquisseFile(
					currentState.strokes,
					currentState.currentFile || undefined
				);
				await downloadEsquisseFile(file, filename);

				// Update current file reference
				update((state) => ({
					...state,
					currentFile: file
				}));
			} catch (error) {
				throw error;
			}
		},

		/**
		 * Load drawing from file
		 */
		load: async (): Promise<void> => {
			try {
				// Select file
				const file = await selectFile();
				if (!file) {
					return; // User cancelled
				}

				// Read and parse file
				const esquisseFile = await readEsquisseFile(file);

				// Update store with loaded data
				broadcastUpdate((state) => ({
					...state,
					strokes: esquisseFile.strokes,
					currentStroke: null,
					currentFile: esquisseFile
				}));
			} catch (error) {
				throw error;
			}
		},

		/**
		 * Undo the last action
		 */
		undo: () => {
			const action = history.undo();
			if (!action) return;

			switch (action.type) {
				case 'stroke_add':
					// Remove the stroke that was added
					broadcastUpdate((state) => ({
						...state,
						strokes: state.strokes.slice(0, -1)
					}));
					break;

				case 'stroke_remove':
					// Re-add the stroke that was removed
					broadcastUpdate((state) => {
						const newStrokes = [...state.strokes];
						newStrokes.splice(action.index, 0, action.stroke);
						return {
							...state,
							strokes: newStrokes
						};
					});
					break;

				case 'strokes_clear':
					// Restore all strokes that were cleared
					broadcastUpdate((state) => ({
						...state,
						strokes: action.strokes
					}));
					break;
			}
		},

		/**
		 * Redo the last undone action
		 */
		redo: () => {
			const action = history.redo();
			if (!action) return;

			switch (action.type) {
				case 'stroke_add':
					// Re-add the stroke
					broadcastUpdate((state) => ({
						...state,
						strokes: [...state.strokes, action.stroke]
					}));
					break;

				case 'stroke_remove':
					// Remove the stroke again
					broadcastUpdate((state) => {
						const newStrokes = [...state.strokes];
						newStrokes.splice(action.index, 1);
						return {
							...state,
							strokes: newStrokes
						};
					});
					break;

				case 'strokes_clear':
					// Clear all strokes again
					broadcastUpdate((state) => ({
						...state,
						strokes: []
					}));
					break;
			}
		},

		/**
		 * Check if undo is available
		 */
		canUndo: () => history.canUndo(),

		/**
		 * Check if redo is available
		 */
		canRedo: () => history.canRedo()
	};
}

export const drawing = createDrawingStore();
