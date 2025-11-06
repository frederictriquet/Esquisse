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
