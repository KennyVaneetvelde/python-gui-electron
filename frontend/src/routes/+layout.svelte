<script lang="ts">
	import '../app.pcss';
	import { ModeWatcher } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button';
	import Sun from 'lucide-svelte/icons/sun';
	import Moon from 'lucide-svelte/icons/moon';
	import { toggleMode } from 'mode-watcher';
	import Chat from '$lib/components/Chat.svelte';
</script>

<ModeWatcher />

<div class="flex h-screen flex-col bg-background font-sans antialiased">
	<!-- Header -->
	<header class="shrink-0 border-b border-[#1a1a1a] bg-background">
		<div class="container h-14 flex items-center justify-between">
			<h1 class="text-xl font-semibold">Svelte Chat Demo</h1>
			<Button variant="ghost" size="icon" on:click={toggleMode}>
				<Sun class="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
				<Moon
					class="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
				/>
				<span class="sr-only">Toggle theme</span>
			</Button>
		</div>
	</header>

	<!-- Main content area with sidebar -->
	<div class="flex flex-1 min-h-0">
		<!-- Main content -->
		<main class="flex-1 min-w-0 border-r border-[#1a1a1a]">
			<slot />
		</main>

		<!-- Chat sidebar -->
		<aside class="w-[500px] shrink-0">
			<Chat />
		</aside>
	</div>
</div>

<style>
	.container {
		@apply mx-auto w-full max-w-[1200px] px-4;
	}
</style>
