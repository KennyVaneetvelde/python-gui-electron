<script lang="ts">
	import { unified } from 'unified';
	import remarkParse from 'remark-parse';
	import remarkGfm from 'remark-gfm';
	import remarkMath from 'remark-math';
	import remarkRehype from 'remark-rehype';
	import rehypeKatex from 'rehype-katex';
	import rehypeStringify from 'rehype-stringify';
	import { fade } from 'svelte/transition';

	export let content = '';

	let html = '';

	$: {
		unified()
			.use(remarkParse)
			.use(remarkGfm)
			.use(remarkMath)
			.use(remarkRehype)
			.use(rehypeKatex)
			.use(rehypeStringify)
			.process(content)
			.then((file) => {
				html = String(file);
			});
	}
</script>

<div class="prose prose-invert max-w-none" transition:fade|local={{ duration: 150 }}>
	{@html html}
</div>

<style lang="postcss">
	:global(.prose) {
		@apply text-base leading-7;
	}

	:global(.prose h1) {
		@apply text-4xl font-bold mb-6 mt-8 text-[#2196f3];
	}

	:global(.prose h2) {
		@apply text-3xl font-bold mb-4 mt-8 text-[#2196f3];
	}

	:global(.prose h3) {
		@apply text-2xl font-bold mb-4 mt-6 text-[#2196f3];
	}

	:global(.prose h4) {
		@apply text-xl font-bold mb-4 mt-6 text-[#2196f3];
	}

	:global(.prose h5) {
		@apply text-lg font-bold mb-4 mt-6 text-[#2196f3];
	}

	:global(.prose h6) {
		@apply text-base font-bold mb-4 mt-6 text-[#2196f3];
	}

	:global(.prose p) {
		@apply mb-4 leading-7;
	}

	:global(.prose ul) {
		@apply mb-4 list-disc pl-5 space-y-2;
	}

	:global(.prose ol) {
		@apply mb-4 list-decimal pl-5 space-y-2;
	}

	:global(.prose li) {
		@apply mb-1;
	}

	:global(.prose pre) {
		@apply my-4 overflow-x-auto rounded-lg bg-card p-4 text-sm;
	}

	:global(.prose code) {
		@apply rounded bg-card px-[0.3em] py-[0.2em] font-mono text-sm text-[#FF5722];
	}

	:global(.prose pre code) {
		@apply bg-transparent p-0;
	}

	:global(.prose table) {
		@apply my-6 w-full overflow-hidden rounded-lg border border-[#1a1a1a];
	}

	:global(.prose thead) {
		@apply bg-card;
	}

	:global(.prose th) {
		@apply border-b border-[#1a1a1a] px-4 py-2 text-left;
	}

	:global(.prose td) {
		@apply border-t border-[#1a1a1a] px-4 py-2;
	}

	:global(.prose blockquote) {
		@apply border-l-4 border-[#2196f3] bg-card/50 p-4 my-4 italic;
	}

	:global(.prose hr) {
		@apply border-[#1a1a1a] my-8;
	}

	:global(.prose a) {
		@apply text-[#2196f3] no-underline hover:underline;
	}

	:global(.prose img) {
		@apply rounded-lg my-4;
	}

	:global(.prose .contains-task-list) {
		@apply list-none pl-0;
	}

	:global(.prose .task-list-item) {
		@apply flex items-start gap-2;
	}

	:global(.prose .task-list-item input[type='checkbox']) {
		@apply mt-1.5;
	}

	:global(.prose strong) {
		@apply text-[#2196f3] font-bold;
	}

	:global(.prose em) {
		@apply text-[#2196f3] italic;
	}
</style>
