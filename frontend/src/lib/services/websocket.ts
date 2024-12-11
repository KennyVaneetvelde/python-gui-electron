import { writable } from 'svelte/store';
import type { WebSocketStatus } from '$lib/types/chat';

export const wsStore = writable<WebSocket | null>(null);
export const wsStatus = writable<WebSocketStatus>('disconnected');

export function setupWebSocket(url: string): WebSocket {
    const ws = new WebSocket(url);

    ws.onopen = () => {
        wsStatus.set('connected');
        wsStore.set(ws);
    };

    ws.onclose = () => {
        wsStatus.set('disconnected');
        wsStore.set(null);
        setTimeout(() => setupWebSocket(url), 1000);
    };

    ws.onerror = () => {
        wsStatus.set('disconnected');
        ws.close();
    };

    return ws;
}

export function getWsUrl(): string {
    const api = (window as any).electronAPI?.getApiUrl();
    return api?.ws || 'ws://127.0.0.1:8000/ws';
}
