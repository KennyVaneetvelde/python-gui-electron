<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';

	export let disabled = false;

	const dispatch = createEventDispatcher();
	let input = '';

	function handleSubmit() {
		if (!input.trim() || disabled) return;
		dispatch('message', input.trim());
		input = '';
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleSubmit();
		}
	}
</script>

<form class="flex items-end gap-2" on:submit|preventDefault={handleSubmit}>
	<Textarea
		bind:value={input}
		on:keydown={handleKeydown}
		placeholder="Type a message..."
		rows={1}
		class="min-h-[60px] resize-none"
		{disabled}
	/>
	<Button
		type="submit"
		{disabled}
		size="icon"
		class="h-[60px] bg-[#2196f3]/50 hover:bg-[#2196f3]/70 border-none text-white"
	>
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4">
			<path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
		</svg>
	</Button>
</form>

<style>
	.input-container {
		display: flex;
		gap: 0.5rem;
		padding: 1rem;
		background: var(--background);
		border-top: 1px solid var(--border);
	}
</style>
