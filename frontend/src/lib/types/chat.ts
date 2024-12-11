export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    id: string;
    suggested_questions?: string[];
}

export type WebSocketStatus = 'connected' | 'connecting' | 'disconnected';
