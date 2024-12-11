import { writable } from 'svelte/store';

// WebSocket connection store
export const wsStore = writable<WebSocket | null>(null);

// WebSocket connection status
export const wsStatus = writable<'connecting' | 'connected' | 'disconnected'>('disconnected');

// WebSocket connection management
export function setupWebSocket(url: string) {
    console.log('Setting up WebSocket connection to:', url);
    wsStatus.set('connecting');

    const ws = new WebSocket(url);

    ws.onopen = () => {
        console.log('WebSocket connected');
        wsStatus.set('connected');
        wsStore.set(ws);
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

    return ws;
}
