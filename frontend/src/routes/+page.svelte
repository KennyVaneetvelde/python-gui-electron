<script lang="ts">
	import { onMount } from 'svelte';
	import Plot from '$lib/components/Plot.svelte';
	import Controls from '$lib/components/Controls.svelte';
	import { signalData, setupWebSocket, wsStore, wsStatus } from '$lib/stores';

	const getWsUrl = () => {
		const api = (window as any).electronAPI?.getApiUrl();
		if (!api) {
			console.error('Failed to get API URL');
			return 'ws://127.0.0.1:8000/ws';
		}
		return api.ws;
	};

	async function generateSignal(type: string) {
		const ws = $wsStore;
		if (!ws) {
			console.error('WebSocket not connected');
			return;
		}

		try {
			ws.send(
				JSON.stringify({
					command: 'generate',
					wave_type: type
				})
			);
		} catch (error) {
			console.error('Error generating signal:', error);
		}
	}

	async function updateParameters(params: {
		frequency: number;
		amplitude: number;
		phase: number;
		wave_type: string;
	}) {
		const ws = $wsStore;
		if (!ws) {
			console.error('WebSocket not connected');
			return;
		}

		try {
			ws.send(
				JSON.stringify({
					command: 'update_parameters',
					parameters: params
				})
			);
		} catch (error) {
			console.error('Error updating parameters:', error);
		}
	}

	onMount(() => {
		// Setup WebSocket connection
		const wsUrl = getWsUrl();
		console.log('Connecting to WebSocket at:', wsUrl);
		setupWebSocket(wsUrl);

		return () => {
			// Cleanup WebSocket connection
			if ($wsStore) {
				$wsStore.close();
			}
		};
	});
</script>

<svelte:head>
	<title>Signal Generator</title>
</svelte:head>

<div class="container">
	<h1>Signal Generator</h1>

	{#if $wsStatus !== 'connected'}
		<div class="status-banner">
			{$wsStatus === 'connecting'
				? 'Connecting to server...'
				: 'Disconnected from server. Attempting to reconnect...'}
		</div>
	{/if}

	<div class="control-group">
		<Plot />
	</div>

	<div class="control-group">
		<Controls {generateSignal} {updateParameters} />
	</div>
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 2rem;
		max-width: 1000px;
		margin: 0 auto;
	}

	h1 {
		color: #2196f3;
		margin-bottom: 2rem;
		text-align: center;
	}

	.control-group {
		background: white;
		padding: 1.5rem;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		margin-bottom: 1.5rem;
		width: 100%;
	}

	.status-banner {
		background-color: #fff3cd;
		color: #856404;
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 1.5rem;
		width: 100%;
		text-align: center;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	:global(body) {
		margin: 0;
		font-family: 'Roboto', sans-serif;
		background-color: #f5f5f5;
		color: #333;
	}
</style>
