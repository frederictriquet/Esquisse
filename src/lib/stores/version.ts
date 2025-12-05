import { writable } from 'svelte/store';

const CURRENT_VERSION = import.meta.env.VITE_BUILD_TIMESTAMP || 'dev';
const VERSION_CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes
const VERSION_STORAGE_KEY = 'esquisse_version';

export interface VersionState {
	currentVersion: string;
	latestVersion: string | null;
	hasUpdate: boolean;
	checking: boolean;
}

function createVersionStore() {
	const { subscribe, set, update } = writable<VersionState>({
		currentVersion: CURRENT_VERSION,
		latestVersion: null,
		hasUpdate: false,
		checking: false
	});

	let checkInterval: ReturnType<typeof setInterval> | null = null;

	async function checkForUpdates() {
		// Skip version checks in development
		if (CURRENT_VERSION === 'dev') {
			return;
		}

		update(state => ({ ...state, checking: true }));

		try {
			// Fetch version.json with cache busting
			const response = await fetch(`/version.json?t=${Date.now()}`, {
				cache: 'no-cache'
			});

			if (response.ok) {
				const data = await response.json();
				const latestVersion = data.buildTimestamp;

				update(state => {
					const hasUpdate = latestVersion !== CURRENT_VERSION;
					return {
						...state,
						latestVersion,
						hasUpdate,
						checking: false
					};
				});
			}
		} catch (error) {
			console.warn('Failed to check for updates:', error);
			update(state => ({ ...state, checking: false }));
		}
	}

	function startPeriodicCheck() {
		if (checkInterval) return;

		// Check immediately on start
		checkForUpdates();

		// Then check periodically
		checkInterval = setInterval(checkForUpdates, VERSION_CHECK_INTERVAL);
	}

	function stopPeriodicCheck() {
		if (checkInterval) {
			clearInterval(checkInterval);
			checkInterval = null;
		}
	}

	function reloadPage() {
		// Clear any cached data if needed
		if ('caches' in window) {
			caches.keys().then(names => {
				names.forEach(name => caches.delete(name));
			});
		}

		// Force reload from server
		window.location.reload();
	}

	return {
		subscribe,
		checkForUpdates,
		startPeriodicCheck,
		stopPeriodicCheck,
		reloadPage
	};
}

export const versionStore = createVersionStore();
