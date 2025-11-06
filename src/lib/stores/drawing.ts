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

				return {
					...state,
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
		}
	};
}

export const drawing = createDrawingStore();
