import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface DrawingSettings {
	color: string;
	width: number;
	viewportCulling: boolean;
	pressureCurve: number; // 0.5 = linear, < 0.5 = soft, > 0.5 = hard
	tiltEnabled: boolean; // Enable tilt-based brush effects
}

const CHANNEL_NAME = 'esquisse-settings';
const INITIAL_SETTINGS: DrawingSettings = {
	color: '#000000',
	width: 2,
	viewportCulling: true,
	pressureCurve: 0.5, // Linear by default
	tiltEnabled: true // Tilt effects enabled by default
};

function createSettingsStore() {
	const { subscribe, set, update } = writable<DrawingSettings>(INITIAL_SETTINGS);

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
	const broadcastUpdate = (fn: (state: DrawingSettings) => DrawingSettings) => {
		update((state) => {
			const newState = fn(state);
			if (channel && !isReceiving) {
				channel.postMessage(newState);
			}
			return newState;
		});
	};

	const broadcastSet = (value: DrawingSettings) => {
		set(value);
		if (channel && !isReceiving) {
			channel.postMessage(value);
		}
	};

	return {
		subscribe,
		setColor: (color: string) => broadcastUpdate(s => ({ ...s, color })),
		setWidth: (width: number) => broadcastUpdate(s => ({ ...s, width })),
		setViewportCulling: (viewportCulling: boolean) => broadcastUpdate(s => ({ ...s, viewportCulling })),
		setPressureCurve: (pressureCurve: number) => broadcastUpdate(s => ({ ...s, pressureCurve })),
		setTiltEnabled: (tiltEnabled: boolean) => broadcastUpdate(s => ({ ...s, tiltEnabled })),
		reset: () => broadcastSet(INITIAL_SETTINGS)
	};
}

export const settings = createSettingsStore();
