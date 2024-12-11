<script lang="ts">
	import MarkdownEditor from '$lib/components/editor/markdown/MarkdownEditor.svelte';
	import { markdownContent } from '$lib/stores/markdown';
</script>

<div class="flex h-full flex-col overflow-hidden">
	<div class="flex-1 min-h-0">
		<MarkdownEditor value={$markdownContent} on:change={(e) => ($markdownContent = e.detail)} />
	</div>
</div>

<style lang="postcss">
	:global(.container) {
		@apply mx-auto w-full max-w-[800px] px-4;
	}
</style>
