<script lang="ts">
	import { wsStatus } from '$lib/services/websocket';
	import ChatInput from '../input/ChatInput.svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher<{ message: string }>();

	function handleMessage(event: CustomEvent<string>) {
		dispatch('message', event.detail);
	}
</script>

<footer class="shrink-0 border-t border-[#1a1a1a] bg-background">
	<div class="container py-4">
		<ChatInput on:message={handleMessage} disabled={$wsStatus !== 'connected'} />
	</div>
</footer>

<style>
	.container {
		@apply mx-auto w-full max-w-[1200px] px-4;
	}
</style>
