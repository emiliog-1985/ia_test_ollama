export interface OllamaModel {
    name: string;
    modified_at: string;
    size: number;
    digest: string;
    details: {
        format: string;
        family: string;
        families: string[] | null;
        parameter_size: string;
        quantization_level: string;
    };
}

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    images?: string[];
}

const OLLAMA_BASE_URL = 'http://localhost:11434/api';

export const OllamaService = {
    async getTags(): Promise<OllamaModel[]> {
        try {
            const response = await fetch(`${OLLAMA_BASE_URL}/tags`);
            if (!response.ok) {
                throw new Error('Failed to fetch models');
            }
            const data = await response.json();
            return data.models;
        } catch (error) {
            console.error('Error fetching models:', error);
            throw error;
        }
    },

    async chat(model: string, messages: ChatMessage[], onChunk: (chunk: string) => void): Promise<void> {
        try {
            const response = await fetch(`${OLLAMA_BASE_URL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model,
                    messages,
                    stream: true,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error('Response body is null');

            const decoder = new TextDecoder();
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                // Ollama sends JSON objects one per line (NDJSONish) or concatenated
                // We need to handle incomplete chunks potentially, but usually it's fine line by line
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const json = JSON.parse(line);
                        if (json.message?.content) {
                            onChunk(json.message.content);
                        }
                        if (json.done) {
                            return;
                        }
                    } catch (e) {
                        console.warn('Error parsing JSON chunk:', e);
                    }
                }
            }
        } catch (error) {
            console.error('Chat error:', error);
            throw error;
        }
    }
};
