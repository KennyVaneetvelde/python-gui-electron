<script lang="ts">
	import { wsStatus } from '$lib/services/websocket';
</script>

{#if $wsStatus !== 'connected'}
	<div class="shrink-0 bg-destructive text-destructive-foreground">
		<div class="container py-2 text-sm">
			{$wsStatus === 'connecting'
				? 'Connecting to server...'
				: 'Disconnected from server. Attempting to reconnect...'}
		</div>
	</div>
{/if}

<style>
	.container {
		@apply mx-auto w-full max-w-[1200px] px-4;
	}
</style>
