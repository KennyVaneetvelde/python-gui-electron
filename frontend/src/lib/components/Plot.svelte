<script lang="ts">
	import { onMount } from 'svelte';
	import { signalData } from '$lib/stores';

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let animationFrameId: number;

	const draw = () => {
		if (!ctx || !$signalData.length) return;

		const width = canvas.width;
		const height = canvas.height;

		// Clear canvas
		ctx.clearRect(0, 0, width, height);

		// Draw signal
		ctx.beginPath();
		ctx.strokeStyle = '#2563eb';
		ctx.lineWidth = 2;

		const step = width / ($signalData.length - 1);

		$signalData.forEach((value, index) => {
			const x = index * step;
			const y = height / 2 + (value * height) / 2;

			if (index === 0) {
				ctx.moveTo(x, y);
			} else {
				ctx.lineTo(x, y);
			}
		});

		ctx.stroke();
	};

	onMount(() => {
		ctx = canvas.getContext('2d')!;

		const resizeCanvas = () => {
			canvas.width = canvas.clientWidth;
			canvas.height = canvas.clientHeight;
			draw();
		};

		resizeCanvas();
		window.addEventListener('resize', resizeCanvas);

		const animate = () => {
			draw();
			animationFrameId = requestAnimationFrame(animate);
		};

		animate();

		return () => {
			window.removeEventListener('resize', resizeCanvas);
			cancelAnimationFrame(animationFrameId);
		};
	});
</script>

<canvas bind:this={canvas} class="w-full h-64 bg-gray-100 rounded-lg shadow-inner"></canvas>

<style>
	canvas {
		width: 100%;
		height: 100%;
	}
</style>
