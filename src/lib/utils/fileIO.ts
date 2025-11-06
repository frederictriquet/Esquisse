/**
 * File I/O utilities for Esquisse drawing application
 * Handles save/load functionality for drawing files
 */

import type { Stroke } from '$lib/types';

// File format version for compatibility
export const FILE_FORMAT_VERSION = '1.0';

/**
 * Esquisse file format structure
 */
export interface EsquisseFile {
	version: string;
	created: string;
	modified: string;
	strokes: Stroke[];
}

/**
 * Validates an Esquisse file structure
 */
export function validateEsquisseFile(data: unknown): data is EsquisseFile {
	if (!data || typeof data !== 'object') {
		return false;
	}

	const file = data as Partial<EsquisseFile>;

	// Check required fields
	if (!file.version || typeof file.version !== 'string') {
		return false;
	}

	if (!file.created || typeof file.created !== 'string') {
		return false;
	}

	if (!file.modified || typeof file.modified !== 'string') {
		return false;
	}

	if (!Array.isArray(file.strokes)) {
		return false;
	}

	// Validate each stroke
	for (const stroke of file.strokes) {
		if (!validateStroke(stroke)) {
			return false;
		}
	}

	return true;
}

/**
 * Validates a single stroke structure
 */
function validateStroke(stroke: unknown): stroke is Stroke {
	if (!stroke || typeof stroke !== 'object') {
		return false;
	}

	const s = stroke as Partial<Stroke>;

	// Check required fields
	if (!s.id || typeof s.id !== 'string') {
		return false;
	}

	if (!s.color || typeof s.color !== 'string') {
		return false;
	}

	if (typeof s.width !== 'number' || s.width <= 0) {
		return false;
	}

	if (!Array.isArray(s.points) || s.points.length === 0) {
		return false;
	}

	// Validate points
	for (const point of s.points) {
		if (!point || typeof point !== 'object') {
			return false;
		}
		const p = point as { x?: unknown; y?: unknown };
		if (typeof p.x !== 'number' || typeof p.y !== 'number') {
			return false;
		}
	}

	if (typeof s.timestamp !== 'number') {
		return false;
	}

	return true;
}

/**
 * Creates an Esquisse file object from strokes
 */
export function createEsquisseFile(
	strokes: Stroke[],
	existingFile?: EsquisseFile
): EsquisseFile {
	const now = new Date().toISOString();

	return {
		version: FILE_FORMAT_VERSION,
		created: existingFile?.created || now,
		modified: now,
		strokes
	};
}

/**
 * Serializes an Esquisse file to JSON string
 */
export function serializeEsquisseFile(file: EsquisseFile): string {
	return JSON.stringify(file, null, 2);
}

/**
 * Deserializes and validates an Esquisse file from JSON string
 */
export function deserializeEsquisseFile(json: string): EsquisseFile {
	let data: unknown;

	try {
		data = JSON.parse(json);
	} catch (error) {
		throw new Error('Invalid JSON format');
	}

	if (!validateEsquisseFile(data)) {
		throw new Error('Invalid Esquisse file format');
	}

	return data;
}

/**
 * Downloads an Esquisse file to the user's computer
 */
export function downloadEsquisseFile(file: EsquisseFile, filename?: string): void {
	const json = serializeEsquisseFile(file);
	const blob = new Blob([json], { type: 'application/json' });
	const url = URL.createObjectURL(blob);

	const link = document.createElement('a');
	link.href = url;
	link.download = filename || `esquisse-${Date.now()}.json`;

	// Trigger download
	document.body.appendChild(link);
	link.click();

	// Cleanup
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

/**
 * Reads and parses an Esquisse file from a File object
 */
export async function readEsquisseFile(file: File): Promise<EsquisseFile> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = (event) => {
			try {
				const json = event.target?.result as string;
				const esquisseFile = deserializeEsquisseFile(json);
				resolve(esquisseFile);
			} catch (error) {
				reject(error);
			}
		};

		reader.onerror = () => {
			reject(new Error('Failed to read file'));
		};

		reader.readAsText(file);
	});
}

/**
 * Creates a file input element and triggers file selection
 */
export function selectFile(): Promise<File | null> {
	return new Promise((resolve) => {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.json,application/json';

		input.onchange = () => {
			const file = input.files?.[0] || null;
			resolve(file);
		};

		// Handle case where user closes dialog without selecting
		input.oncancel = () => {
			resolve(null);
		};

		// Trigger file selection
		input.click();
	});
}
