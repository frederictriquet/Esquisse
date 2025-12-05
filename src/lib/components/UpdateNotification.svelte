<script lang="ts">
	import { versionStore } from '$lib/stores/version';

	$: hasUpdate = $versionStore.hasUpdate;

	function handleReload() {
		versionStore.reloadPage();
	}

	function handleDismiss() {
		// User dismissed - just hide the notification
		// The service worker will check again on next interval
		versionStore.setUpdateAvailable();
	}
</script>

{#if hasUpdate}
	<div class="update-notification" role="alert">
		<div class="notification-content">
			<div class="notification-icon">🔄</div>
			<div class="notification-text">
				<strong>New version available!</strong>
				<span>Reload to get the latest updates.</span>
			</div>
		</div>
		<div class="notification-actions">
			<button class="reload-button" on:click={handleReload}>Reload Now</button>
			<button class="dismiss-button" on:click={handleDismiss} aria-label="Dismiss">×</button>
		</div>
	</div>
{/if}

<style>
	.update-notification {
		position: fixed;
		top: 20px;
		right: 20px;
		background: white;
		border-radius: 8px;
		box-shadow:
			0 4px 12px rgba(0, 0, 0, 0.15),
			0 0 0 1px rgba(0, 0, 0, 0.1);
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 12px 16px;
		max-width: 400px;
		z-index: 9999;
		animation: slideIn 0.3s ease-out;
		font-family: system-ui, -apple-system, sans-serif;
	}

	@keyframes slideIn {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	.notification-content {
		display: flex;
		align-items: center;
		gap: 12px;
		flex: 1;
	}

	.notification-icon {
		font-size: 24px;
		line-height: 1;
		flex-shrink: 0;
	}

	.notification-text {
		display: flex;
		flex-direction: column;
		gap: 2px;
		font-size: 14px;
		line-height: 1.4;
	}

	.notification-text strong {
		color: #333;
		font-weight: 600;
	}

	.notification-text span {
		color: #666;
		font-size: 13px;
	}

	.notification-actions {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.reload-button {
		padding: 8px 16px;
		background: #007bff;
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s ease;
		white-space: nowrap;
	}

	.reload-button:hover {
		background: #0056b3;
	}

	.reload-button:active {
		transform: translateY(1px);
	}

	.dismiss-button {
		background: none;
		border: none;
		font-size: 28px;
		line-height: 1;
		color: #999;
		cursor: pointer;
		padding: 0;
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
		transition: all 0.2s ease;
		flex-shrink: 0;
	}

	.dismiss-button:hover {
		background: #f5f5f5;
		color: #333;
	}

	/* Mobile responsive */
	@media (max-width: 480px) {
		.update-notification {
			top: 10px;
			right: 10px;
			left: 10px;
			max-width: none;
		}

		.notification-text span {
			display: none;
		}
	}
</style>
