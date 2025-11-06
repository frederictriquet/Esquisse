import { writable } from 'svelte/store';

export interface DrawingSettings {
	color: string;
	width: number;
}

function createSettingsStore() {
	const { subscribe, set, update } = writable<DrawingSettings>({
		color: '#000000',
		width: 2
	});

	return {
		subscribe,
		setColor: (color: string) => update(s => ({ ...s, color })),
		setWidth: (width: number) => update(s => ({ ...s, width })),
		reset: () => set({ color: '#000000', width: 2 })
	};
}

export const settings = createSettingsStore();
