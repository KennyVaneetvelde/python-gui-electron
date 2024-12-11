<script lang="ts">
	import { onMount } from 'svelte';
	import ChatMessage from './ChatMessage.svelte';
	import ChatInput from './ChatInput.svelte';
	import { setupWebSocket, wsStore, wsStatus } from '$lib/stores';

	let messages: Array<{
		role: 'user' | 'assistant';
		content: string;
		id: string;
		suggested_questions?: string[];
	}> = [];
	let chatContainer: HTMLElement;
	let messageCounter = 0;
	let isScrollLocked = true;
	let scrollTimeout: NodeJS.Timeout;

	const getWsUrl = () => {
		const api = (window as any).electronAPI?.getApiUrl();
		return api?.ws || 'ws://127.0.0.1:8000/ws';
	};

	function handleMessage(event: CustomEvent<string>) {
		const ws = $wsStore;
		if (!ws) {
			console.error('WebSocket not connected');
			return;
		}

		const messageId = `msg_${Date.now()}_${messageCounter++}`;
		try {
			ws.send(
				JSON.stringify({
					type: 'message',
					content: event.detail,
					message_id: messageId
				})
			);
		} catch (error) {
			console.error('Error sending message:', error);
		}
	}

	function handleScroll() {
		if (!chatContainer) return;

		// Clear any pending scroll checks
		if (scrollTimeout) clearTimeout(scrollTimeout);

		// Set a debounced scroll check
		scrollTimeout = setTimeout(() => {
			const threshold = 100; // pixels from bottom
			const isNearBottom =
				chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight <
				threshold;
			isScrollLocked = isNearBottom;
		}, 100);
	}

	function scrollToBottom(force = false) {
		if (!chatContainer || (!isScrollLocked && !force)) return;

		// Use requestAnimationFrame for smoother scrolling
		requestAnimationFrame(() => {
			const duration = force ? 'auto' : 'smooth';
			const targetScroll = chatContainer.scrollHeight;

			// If suggestions are appearing, use a longer smooth scroll
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

	// Watch for changes in messages, including suggested questions
	$: {
		if (messages.length) {
			const lastMessage = messages[messages.length - 1];
			if (lastMessage.suggested_questions?.length) {
				scrollToBottom(true); // Force scroll when suggestions appear
			}
		}
	}

	onMount(() => {
		const wsUrl = getWsUrl();
		console.log('Connecting to WebSocket at:', wsUrl);
		const ws = setupWebSocket(wsUrl);

		// Add scroll event listener
		chatContainer?.addEventListener('scroll', handleScroll);

		ws.onmessage = (event) => {
			const data = JSON.parse(event.data);

			if (data.type === 'message') {
				const messageId = data.message_id || `msg_${Date.now()}_${messageCounter++}`;
				messages = [
					...messages,
					{
						role: data.role,
						content: data.content,
						id: messageId,
						suggested_questions: data.suggested_questions
					}
				];
				scrollToBottom(true); // Force scroll for new messages
			} else if (data.type === 'stream') {
				const existingMessageIndex = messages.findIndex((m) => m.id === data.message_id);

				if (existingMessageIndex === -1) {
					messages = [
						...messages,
						{
							role: 'assistant',
							content: data.content,
							id: data.message_id,
							suggested_questions: data.suggested_questions
						}
					];
					scrollToBottom(true); // Force scroll for new stream
				} else {
					const updatedMessages = [...messages];
					updatedMessages[existingMessageIndex] = {
						...updatedMessages[existingMessageIndex],
						content: data.content,
						suggested_questions: data.is_complete ? data.suggested_questions : undefined
					};
					messages = updatedMessages;
					scrollToBottom(); // Smooth scroll during streaming
				}
			}
		};

		return () => {
			if ($wsStore) {
				$wsStore.close();
			}
			chatContainer?.removeEventListener('scroll', handleScroll);
			if (scrollTimeout) clearTimeout(scrollTimeout);
		};
	});
</script>

<div class="flex h-full flex-col">
	<!-- Connection status -->
	{#if $wsStatus !== 'connected'}
		<div class="shrink-0 bg-destructive text-destructive-foreground">
			<div class="container py-2 text-sm">
				{$wsStatus === 'connecting'
					? 'Connecting to server...'
					: 'Disconnected from server. Attempting to reconnect...'}
			</div>
		</div>
	{/if}

	<!-- Chat area -->
	<main bind:this={chatContainer} class="flex-1 min-h-0 overflow-y-auto">
		<div class="container py-6">
			<div class="space-y-4">
				{#each messages as message (message.id)}
					<ChatMessage {message} on:questionClick={(event) => handleMessage(event)} />
				{/each}
			</div>
		</div>
	</main>

	<!-- Input area -->
	<footer class="shrink-0 border-t border-[#1a1a1a] bg-background">
		<div class="container py-4">
			<ChatInput on:message={handleMessage} disabled={$wsStatus !== 'connected'} />
		</div>
	</footer>
</div>

<style>
	.container {
		@apply mx-auto w-full max-w-[1200px] px-4;
	}
</style>
