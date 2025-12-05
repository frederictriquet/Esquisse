<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import '../app.css';

	onMount(() => {
		if (browser && 'serviceWorker' in navigator) {
			// Register the service worker
			navigator.serviceWorker.register('/service-worker.js').then((registration) => {
				// Check for updates periodically (every 5 minutes)
				const interval = setInterval(() => {
					registration.update();
				}, 5 * 60 * 1000);

				// Check immediately
				registration.update();

				return () => {
					clearInterval(interval);
				};
			});
		}
	});
</script>

<slot />
