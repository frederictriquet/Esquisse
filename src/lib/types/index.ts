// Core type definitions for Esquisse drawing application

export interface Point {
	x: number;
	y: number;
}

export interface Stroke {
	id: string;
	color: string;
	width: number;
	points: Point[];
	timestamp: number;
}

export interface DrawingState {
	strokes: Stroke[];
}

export interface Transform {
	x: number;      // Pan X offset
	y: number;      // Pan Y offset
	scale: number;  // Zoom scale
}

export interface DrawingSettings {
	color: string;
	width: number;
}

// History action types for undo/redo functionality
export type HistoryAction =
	| { type: 'stroke_add'; stroke: Stroke }
	| { type: 'stroke_remove'; stroke: Stroke; index: number }
	| { type: 'strokes_clear'; strokes: Stroke[] };

export interface HistoryState {
	past: HistoryAction[];
	future: HistoryAction[];
	maxSize: number;
}
