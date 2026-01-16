import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock OllamaService
vi.mock('../services/ollama', () => ({
    OllamaService: {
        chat: vi.fn().mockImplementation(async (_model, _messages, onChunk) => {
            onChunk('Hello');
            onChunk(' World');
        })
    }
}));

// Import after mocking
import { useChat } from '../hooks/useChat';

describe('useChat hook', () => {
    it('should initialize with system message', () => {
        const { result } = renderHook(() => useChat());

        expect(result.current.messages).toHaveLength(1);
        expect(result.current.messages[0].role).toBe('system');
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('should add user message when sending', async () => {
        const { result } = renderHook(() => useChat());

        await act(async () => {
            await result.current.sendMessage('Test message', 'test-model');
        });

        // Should have: system + user + assistant
        expect(result.current.messages.length).toBeGreaterThan(1);

        const userMessage = result.current.messages.find(m => m.role === 'user');
        expect(userMessage?.content).toBe('Test message');
    });

    it('should reset chat correctly', () => {
        const { result } = renderHook(() => useChat());

        act(() => {
            result.current.resetChat();
        });

        expect(result.current.messages).toHaveLength(1);
        expect(result.current.messages[0].role).toBe('system');
    });

    it('should filter system messages for save', async () => {
        const { result } = renderHook(() => useChat());

        await act(async () => {
            await result.current.sendMessage('Test', 'model');
        });

        const saveable = result.current.getMessagesForSave();
        expect(saveable.every(m => m.role !== 'system')).toBe(true);
    });
});
