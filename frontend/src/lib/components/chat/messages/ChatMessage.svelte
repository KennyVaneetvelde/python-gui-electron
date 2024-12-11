<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { createEventDispatcher } from 'svelte';
	import { marked } from 'marked';
	import DOMPurify from 'dompurify';
	import { fade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	const dispatch = createEventDispatcher();

	export let message: {
		role: 'user' | 'assistant';
		content: string;
		id: string;
		suggested_questions?: string[];
	};

	function handleQuestionClick(question: string) {
		dispatch('questionClick', question);
	}

	$: renderedContent = DOMPurify.sanitize(marked.parse(message.content));
</script>

<div
	class="message {message.role} flex gap-4 rounded-lg p-4 {message.role === 'assistant'
		? 'bg-card'
		: 'bg-[#2196f3]/20'}"
>
	<div
		class="avatar flex h-8 min-w-8 select-none items-center justify-center rounded-full {message.role ===
		'assistant'
			? 'bg-[#2196f3]/50 text-white'
			: 'bg-[#2196f3]/50 text-white'}"
	>
		{#if message.role === 'user'}
			👤
		{:else}
			🤖
		{/if}
	</div>
	<div class="content flex-1">
		{@html renderedContent}
		{#if message.suggested_questions && message.suggested_questions.length > 0}
			<div class="suggested-questions mt-6" transition:fade={{ duration: 400, easing: quintOut }}>
				<h4 class="mb-3 text-sm font-medium text-muted-foreground">Suggested questions:</h4>
				<div class="flex flex-wrap gap-2">
					{#each message.suggested_questions as question}
						<Button
							size="sm"
							class="bg-[#2196f3]/50 hover:bg-[#2196f3]/70 text-white border-none"
							on:click={() => handleQuestionClick(question)}>{question}</Button
						>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.message {
		animation: fadeIn 0.3s ease-out;
	}

	.content :global(pre) {
		@apply my-4 overflow-x-auto rounded-lg bg-card p-4 text-sm;
	}

	.content :global(p) {
		@apply mb-3 leading-7;
	}

	.content :global(p:last-child) {
		@apply mb-0;
	}

	.content :global(code) {
		@apply rounded bg-card px-[0.3em] py-[0.2em] font-mono text-sm;
	}

	.content :global(pre code) {
		@apply bg-transparent p-0;
	}

	.content :global(ul),
	.content :global(ol) {
		@apply my-4 pl-6;
	}

	.content :global(li) {
		@apply mb-2;
	}

	.content :global(blockquote) {
		@apply border-l-4 border-[#2196f3]/50 pl-4 italic text-muted-foreground;
	}

	.content :global(a) {
		@apply text-[#2196f3]/80 underline-offset-4 hover:underline;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
