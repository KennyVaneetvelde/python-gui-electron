<script lang="ts">
	import { wsStatus } from '$lib/stores';
	import { onMount } from 'svelte';

	export let generateSignal: (type: string) => Promise<void>;
	export let updateParameters: (params: {
		frequency: number;
		amplitude: number;
		phase: number;
		wave_type: string;
	}) => Promise<void>;

	let frequency = 1.0;
	let amplitude = 1.0;
	let phase = 0.0;
	let waveType = 'sine';
	let isInitialized = false;

	function updateSignal() {
		if (!isInitialized || $wsStatus !== 'connected') return;

		updateParameters({
			frequency,
			amplitude,
			phase,
			wave_type: waveType
		});
	}

	$: {
		if (typeof window !== 'undefined') {
			updateSignal();
		}
	}

	onMount(() => {
		isInitialized = true;
	});
</script>

<div class="space-y-4 p-4 bg-white rounded-lg shadow">
	<div class="space-y-2">
		<label class="block text-sm font-medium text-gray-700">
			Wave Type
			<select
				bind:value={waveType}
				on:change={() => {
					generateSignal(waveType);
					updateSignal();
				}}
				class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
				disabled={$wsStatus !== 'connected'}
			>
				<option value="sine">Sine</option>
				<option value="square">Square</option>
				<option value="sawtooth">Sawtooth</option>
				<option value="noise">Noise</option>
			</select>
		</label>
	</div>

	<div class="space-y-2">
		<label class="block text-sm font-medium text-gray-700">
			Frequency (Hz)
			<input
				type="range"
				min="0.1"
				max="5"
				step="0.1"
				bind:value={frequency}
				on:input={updateSignal}
				class="mt-1 block w-full"
				disabled={$wsStatus !== 'connected'}
			/>
			<span class="text-sm text-gray-500">{frequency.toFixed(1)} Hz</span>
		</label>
	</div>

	<div class="space-y-2">
		<label class="block text-sm font-medium text-gray-700">
			Amplitude
			<input
				type="range"
				min="0.1"
				max="2"
				step="0.1"
				bind:value={amplitude}
				on:input={updateSignal}
				class="mt-1 block w-full"
				disabled={$wsStatus !== 'connected'}
			/>
			<span class="text-sm text-gray-500">{amplitude.toFixed(1)}</span>
		</label>
	</div>

	<div class="space-y-2">
		<label class="block text-sm font-medium text-gray-700">
			Phase
			<input
				type="range"
				min="0"
				max="6.28"
				step="0.1"
				bind:value={phase}
				on:input={updateSignal}
				class="mt-1 block w-full"
				disabled={$wsStatus !== 'connected'}
			/>
			<span class="text-sm text-gray-500">{phase.toFixed(1)}</span>
		</label>
	</div>
</div>
