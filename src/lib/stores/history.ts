import { writable, get } from 'svelte/store';
import type { Stroke } from '$lib/types';

/**
 * History action types for undo/redo functionality
 */
export type HistoryAction =
	| { type: 'stroke_add'; stroke: Stroke }
	| { type: 'stroke_remove'; stroke: Stroke; index: number }
	| { type: 'strokes_clear'; strokes: Stroke[] };

interface HistoryState {
	past: HistoryAction[];
	future: HistoryAction[];
	maxSize: number;
}

const MAX_HISTORY_SIZE = 100;

function createHistoryStore() {
	const initialState: HistoryState = {
		past: [],
		future: [],
		maxSize: MAX_HISTORY_SIZE
	};

	const { subscribe, set, update } = writable<HistoryState>(initialState);

	return {
		subscribe,

		/**
		 * Record a new action in history
		 * Clears the future stack (can't redo after new action)
		 */
		record: (action: HistoryAction) => {
			update((state) => {
				const newPast = [...state.past, action];

				// Limit history size
				if (newPast.length > state.maxSize) {
					newPast.shift(); // Remove oldest action
				}

				return {
					...state,
					past: newPast,
					future: [] // Clear redo stack on new action
				};
			});
		},

		/**
		 * Undo the last action and return it
		 * Returns null if there's nothing to undo
		 */
		undo: (): HistoryAction | null => {
			const state = get({ subscribe });
			if (state.past.length === 0) {
				return null;
			}

			const action = state.past[state.past.length - 1];

			update((state) => ({
				...state,
				past: state.past.slice(0, -1),
				future: [...state.future, action]
			}));

			return action;
		},

		/**
		 * Redo the last undone action and return it
		 * Returns null if there's nothing to redo
		 */
		redo: (): HistoryAction | null => {
			const state = get({ subscribe });
			if (state.future.length === 0) {
				return null;
			}

			const action = state.future[state.future.length - 1];

			update((state) => ({
				...state,
				past: [...state.past, action],
				future: state.future.slice(0, -1)
			}));

			return action;
		},

		/**
		 * Check if undo is available
		 */
		canUndo: (): boolean => {
			const state = get({ subscribe });
			return state.past.length > 0;
		},

		/**
		 * Check if redo is available
		 */
		canRedo: (): boolean => {
			const state = get({ subscribe });
			return state.future.length > 0;
		},

		/**
		 * Clear all history
		 */
		clear: () => {
			set(initialState);
		}
	};
}

export const history = createHistoryStore();
