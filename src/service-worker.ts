/// <reference types="@sveltejs/kit" />
import { build, files, version } from '$service-worker';

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;

const ASSETS = [
	...build, // the app itself
	...files  // everything in `static`
];

self.addEventListener('install', (event) => {
	// Create a new cache and add all files to it
	async function addFilesToCache() {
		const cache = await caches.open(CACHE);
		await cache.addAll(ASSETS);
	}

	(event as ExtendableEvent).waitUntil(addFilesToCache());
});

self.addEventListener('activate', (event) => {
	// Remove previous cached data from disk
	async function deleteOldCaches() {
		for (const key of await caches.keys()) {
			if (key !== CACHE) await caches.delete(key);
		}
	}

	(event as ExtendableEvent).waitUntil(deleteOldCaches());
});

self.addEventListener('fetch', (event) => {
	// ignore POST requests etc
	if ((event as FetchEvent).request.method !== 'GET') return;

	async function respond() {
		const url = new URL((event as FetchEvent).request.url);
		const cache = await caches.open(CACHE);

		// `build`/`files` can always be served from the cache
		if (ASSETS.includes(url.pathname)) {
			const response = await cache.match(url.pathname);
			if (response) {
				return response;
			}
		}

		// for everything else, try the network first, but
		// fall back to the cache if we're offline
		try {
			const response = await fetch((event as FetchEvent).request);

			// if we're offline, fetch can return a `Response` with a non-ok status
			// so we can't just check for `response.ok`
			if (response.status === 200) {
				cache.put((event as FetchEvent).request, response.clone());
			}

			return response;
		} catch {
			const response = await cache.match((event as FetchEvent).request);
			if (response) {
				return response;
			}
		}

		return new Response('Not found', { status: 404 });
	}

	(event as FetchEvent).respondWith(respond());
});

// Listen for messages from the client
self.addEventListener('message', (event) => {
	if ((event as ExtendableMessageEvent).data && (event as ExtendableMessageEvent).data.type === 'SKIP_WAITING') {
		(self as any).skipWaiting();
	}
});
