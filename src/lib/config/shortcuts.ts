// Keyboard shortcuts configuration for Esquisse
// Centralized configuration for all keyboard shortcuts

export interface ShortcutConfig {
	key: string;
	ctrl?: boolean;
	shift?: boolean;
	alt?: boolean;
	description: string;
}

export const SHORTCUTS = {
	// File operations
	save: {
		key: 's',
		ctrl: true,
		description: 'Save drawing'
	},
	load: {
		key: 'o',
		ctrl: true,
		description: 'Load drawing'
	},

	// History
	undo: {
		key: 'z',
		ctrl: true,
		description: 'Undo last action'
	},
	redo: [
		{
			key: 'y',
			ctrl: true,
			description: 'Redo last undone action'
		},
		{
			key: 'z',
			ctrl: true,
			shift: true,
			description: 'Redo last undone action (Photoshop style)'
		}
	],

	// Canvas operations
	clear: {
		key: 'C',
		ctrl: true,
		shift: true,
		description: 'Clear all strokes'
	},

	// View/Navigation
	panMode: {
		key: 'Space',
		description: 'Pan mode (hold + drag to pan)'
	},
	zoomMode: {
		key: 'x',
		description: 'Zoom mode (hold + drag up/down to zoom in/out)'
	},
	resetView: {
		key: 'r',
		description: 'Reset view (zoom & pan)'
	},
	zoomIn: {
		key: '+',
		ctrl: true,
		description: 'Zoom in'
	},
	zoomInAlt: {
		key: '=',
		ctrl: true,
		description: 'Zoom in (alternative)'
	},
	zoomOut: {
		key: '-',
		ctrl: true,
		description: 'Zoom out'
	},
	resetZoom: {
		key: '0',
		ctrl: true,
		description: 'Reset zoom to 100%'
	},

	// UI
	help: [
		{
			key: 'h',
			description: 'Show help dialog'
		},
		{
			key: '?',
			description: 'Show help dialog'
		}
	],

	// Performance testing
	performanceTest: {
		key: 't',
		description: 'Toggle performance test'
	}
} as const;

/**
 * Format shortcut for display (e.g., "Cmd+Z" or "Shift+R")
 */
export function formatShortcut(shortcut: ShortcutConfig, isMac: boolean = false): string {
	const parts: string[] = [];

	if (shortcut.ctrl) {
		parts.push(isMac ? '⌘' : 'Ctrl');
	}
	if (shortcut.shift) {
		parts.push('Shift');
	}
	if (shortcut.alt) {
		parts.push(isMac ? '⌥' : 'Alt');
	}

	parts.push(shortcut.key.toUpperCase());

	return parts.join('+');
}

/**
 * Check if a keyboard event matches a shortcut configuration
 */
export function matchesShortcut(
	event: KeyboardEvent,
	shortcut: ShortcutConfig,
	isMac: boolean = false
): boolean {
	const ctrlOrCmd = isMac ? event.metaKey : event.ctrlKey;

	// Check modifier keys
	if (shortcut.ctrl && !ctrlOrCmd) return false;
	if (!shortcut.ctrl && ctrlOrCmd) return false;

	if (shortcut.shift && !event.shiftKey) return false;
	if (!shortcut.shift && event.shiftKey) return false;

	if (shortcut.alt && !event.altKey) return false;
	if (!shortcut.alt && event.altKey) return false;

	// Check key (case-insensitive)
	// For special keys like "Space", use event.code
	if (shortcut.key === 'Space') {
		return event.code === 'Space';
	}

	return event.key.toLowerCase() === shortcut.key.toLowerCase();
}

/**
 * Check if pan mode key is pressed (for Canvas component)
 */
export function isPanModeKey(event: KeyboardEvent): boolean {
	return matchesShortcut(event, SHORTCUTS.panMode, false);
}

/**
 * Check if zoom mode key is pressed (for Canvas component)
 */
export function isZoomModeKey(event: KeyboardEvent): boolean {
	return matchesShortcut(event, SHORTCUTS.zoomMode, false);
}

/**
 * Get all shortcuts as a flat list for documentation
 */
export function getAllShortcuts(): Array<{ name: string; shortcuts: readonly ShortcutConfig[] }> {
	return Object.entries(SHORTCUTS).map(([name, config]) => ({
		name,
		shortcuts: (Array.isArray(config) ? config : [config]) as readonly ShortcutConfig[]
	}));
}
