<script lang="ts">
	import type { ChatMessage } from '$lib/types/chat';
	import ChatMessageComponent from '../messages/ChatMessage.svelte';
	import { createEventDispatcher } from 'svelte';

	export let messages: ChatMessage[] = [];

	const dispatch = createEventDispatcher<{ questionClick: string }>();
	let chatContainer: HTMLElement;
	let isScrollLocked = true;
	let scrollTimeout: NodeJS.Timeout;

	function handleScroll() {
		if (!chatContainer) return;

		if (scrollTimeout) clearTimeout(scrollTimeout);

		scrollTimeout = setTimeout(() => {
			const threshold = 100;
			const isNearBottom =
				chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight <
				threshold;
			isScrollLocked = isNearBottom;
		}, 100);
	}

	export function scrollToBottom(force = false) {
		if (!chatContainer || (!isScrollLocked && !force)) return;

		requestAnimationFrame(() => {
			const duration = force ? 'auto' : 'smooth';
			const targetScroll = chatContainer.scrollHeight;

			if (force && messages[messages.length - 1]?.suggested_questions?.length) {
				chatContainer.scrollTo({
					top: targetScroll,
					behavior: 'smooth'
				});
			} else {
				chatContainer.scrollTo({
					top: targetScroll,
					behavior: duration
				});
			}
		});
	}

	function handleQuestionClick(event: CustomEvent<string>) {
		dispatch('questionClick', event.detail);
	}

	$: {
		if (messages.length) {
			const lastMessage = messages[messages.length - 1];
			if (lastMessage.suggested_questions?.length) {
				scrollToBottom(true);
			}
		}
	}
</script>

<main bind:this={chatContainer} class="flex-1 min-h-0 overflow-y-auto" on:scroll={handleScroll}>
	<div class="container py-6">
		<div class="space-y-4">
			{#each messages as message (message.id)}
				<ChatMessageComponent {message} on:questionClick={handleQuestionClick} />
			{/each}
		</div>
	</div>
</main>

<style>
	.container {
		@apply mx-auto w-full max-w-[1200px] px-4;
	}
</style>
