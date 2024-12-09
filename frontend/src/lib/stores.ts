import { writable } from 'svelte/store';

export const signalData = writable<number[]>([]);

// Initialize with a flat line
signalData.set(Array(100).fill(0));

// WebSocket connection store
export const wsStore = writable<WebSocket | null>(null);

// WebSocket connection status
export const wsStatus = writable<'connecting' | 'connected' | 'disconnected'>('disconnected');

// WebSocket connection management
export function setupWebSocket(url: string) {
    console.log('Setting up WebSocket connection to:', url);
    const ws = new WebSocket(url);

    ws.onopen = () => {
        console.log('WebSocket connected');
        wsStatus.set('connected');
        wsStore.set(ws);

        // Generate initial signal
        ws.send(JSON.stringify({
            command: 'generate',
            wave_type: 'sine'
        }));
    };

    ws.onclose = () => {
        console.log('WebSocket disconnected');
        wsStatus.set('disconnected');
        wsStore.set(null);

        // Attempt to reconnect after 2 seconds
        setTimeout(() => {
            if (ws.readyState === WebSocket.CLOSED) {
                setupWebSocket(url);
            }
        }, 2000);
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);

            if (data.error) {
                console.error('Server error:', data.error);
                return;
            }

            if (data.type === 'signal_data' || data.type === 'parameters_updated') {
                signalData.set(data.data.y);
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    };

    return ws;
}
