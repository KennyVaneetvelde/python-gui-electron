<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card } from '$lib/components/ui/card';
	import Edit from 'lucide-svelte/icons/edit';
	import Eye from 'lucide-svelte/icons/eye';
	import { fade } from 'svelte/transition';
	import { createEventDispatcher } from 'svelte';
	import CodeMirrorEditor from '../code/CodeMirrorEditor.svelte';
	import MarkdownRenderer from './MarkdownRenderer.svelte';

	const dispatch = createEventDispatcher<{
		change: string;
	}>();

	export let value = '';
	export let readonly = false;

	let isEditing = false;

	$: if (isEditing && readonly) {
		isEditing = false;
	}
</script>

<div class="container h-full py-6">
	<Card class="flex h-full flex-col border-none bg-transparent shadow-none">
		{#if !readonly}
			<div class="mb-4 flex justify-end">
				<Button
					variant="ghost"
					size="icon"
					on:click={() => (isEditing = !isEditing)}
					aria-label={isEditing ? 'Switch to preview mode' : 'Switch to edit mode'}
				>
					{#if isEditing}
						<Eye class="h-5 w-5" />
					{:else}
						<Edit class="h-5 w-5" />
					{/if}
				</Button>
			</div>
		{/if}

		{#if isEditing}
			<div class="flex-1 min-h-0 overflow-hidden" transition:fade|local={{ duration: 150 }}>
				<CodeMirrorEditor {value} {readonly} on:change={(e) => dispatch('change', e.detail)} />
			</div>
		{:else}
			<div class="flex-1 min-h-0 overflow-y-auto" transition:fade|local={{ duration: 150 }}>
				<MarkdownRenderer content={value} />
			</div>
		{/if}
	</Card>
</div>

<style lang="postcss">
	:global(.prose pre) {
		@apply my-4 overflow-x-auto rounded-lg bg-card p-4 text-sm;
	}

	:global(.prose code) {
		@apply rounded bg-card px-[0.3em] py-[0.2em] font-mono text-sm;
	}

	:global(.prose pre code) {
		@apply bg-transparent p-0;
	}

	textarea {
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
			'Courier New', monospace;
	}
</style>
