import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const CURRENT_VERSION = import.meta.env.VITE_BUILD_TIMESTAMP || 'dev';

export interface VersionState {
	currentVersion: string;
	latestVersion: string | null;
	hasUpdate: boolean;
	checking: boolean;
}

function createVersionStore() {
	const { subscribe, update } = writable<VersionState>({
		currentVersion: CURRENT_VERSION,
		latestVersion: null,
		hasUpdate: false,
		checking: false
	});

	let pendingWorker: ServiceWorker | null = null;

	function setUpdateAvailable(newWorker?: ServiceWorker) {
		if (newWorker) {
			pendingWorker = newWorker;
			update(state => ({
				...state,
				hasUpdate: true,
				checking: false
			}));
		} else {
			// Dismiss notification
			update(state => ({
				...state,
				hasUpdate: false,
				checking: false
			}));
		}
	}

	function reloadPage() {
		// If we have a pending service worker, tell it to activate
		if (pendingWorker) {
			pendingWorker.postMessage({ type: 'SKIP_WAITING' });
		}

		// Force reload from server
		window.location.reload();
	}

	// Initialize service worker integration
	if (browser && 'serviceWorker' in navigator) {
		navigator.serviceWorker.ready.then((registration) => {
			// Listen for updates
			registration.addEventListener('updatefound', () => {
				const newWorker = registration.installing;
				if (newWorker) {
					newWorker.addEventListener('statechange', () => {
						if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
							// New version is available
							setUpdateAvailable(newWorker);
						}
					});
				}
			});

			// Check for updates immediately
			registration.update();
		});

		// Handle when service worker takes control
		navigator.serviceWorker.addEventListener('controllerchange', () => {
			window.location.reload();
		});
	}

	return {
		subscribe,
		setUpdateAvailable,
		reloadPage
	};
}

export const versionStore = createVersionStore();
