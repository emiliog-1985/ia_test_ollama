import { useState, useCallback } from 'react';
import { OllamaService, type ChatMessage } from '../services/ollama';
import { KnowledgeService } from '../services/knowledge';

const getSystemPrompt = (): ChatMessage => ({
    role: 'system',
    content: `Eres un asistente inteligente oficial de DISAM (Dirección de Salud Municipal de Arica).

${KnowledgeService.generateContext()}

---
INSTRUCCIONES:
- Responde siempre en español, de manera amable, profesional y útil.
- Proporciona información precisa basándote en la base de conocimientos.
- Si no tienes la información específica, sugiere contactar directamente a DISAM al (56-58) 2206004.
- Cuando te pregunten por horarios de atención, menciona que pueden variar y recomienda confirmar por teléfono.
- Web oficial: https://apsmuniarica.cl/web/`
});

export function useChat(initialMessages?: ChatMessage[]) {
    const [messages, setMessages] = useState<ChatMessage[]>(
        initialMessages || [getSystemPrompt()]
    );
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sendMessage = useCallback(async (content: string, model: string) => {
        setIsLoading(true);
        setError(null);

        const userMessage: ChatMessage = { role: 'user', content };

        // Optimistically add user message
        setMessages(prev => [...prev, userMessage]);

        // Create a placeholder for the assistant response
        const assistantMessage: ChatMessage = { role: 'assistant', content: '' };
        setMessages(prev => [...prev, assistantMessage]);

        try {
            const messageHistory = [...messages, userMessage];

            let currentResponse = '';

            await OllamaService.chat(model, messageHistory, (chunk) => {
                currentResponse += chunk;
                setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMsg = newMessages[newMessages.length - 1];
                    if (lastMsg.role === 'assistant') {
                        lastMsg.content = currentResponse;
                    }
                    return newMessages;
                });
            });

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setIsLoading(false);
        }
    }, [messages]);

    const resetChat = useCallback((newMessages?: ChatMessage[]) => {
        // Regenerate system prompt to include latest knowledge
        setMessages(newMessages || [getSystemPrompt()]);
        setError(null);
    }, []);

    const refreshKnowledge = useCallback(() => {
        // Update system prompt with latest knowledge
        setMessages(prev => {
            const newMessages = [...prev];
            if (newMessages.length > 0 && newMessages[0].role === 'system') {
                newMessages[0] = getSystemPrompt();
            }
            return newMessages;
        });
    }, []);

    const getMessagesForSave = useCallback(() => {
        return messages.filter(m => m.role !== 'system');
    }, [messages]);

    return {
        messages,
        isLoading,
        error,
        sendMessage,
        resetChat,
        refreshKnowledge,
        getMessagesForSave
    };
}
