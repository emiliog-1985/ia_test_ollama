// Service to manage conversation history in localStorage

export interface Conversation {
    id: string;
    title: string;
    messages: { role: string; content: string }[];
    createdAt: number;
    updatedAt: number;
}

const STORAGE_KEY = 'disam_ia_conversations';

export const ConversationService = {
    // Get all conversations
    getAll(): Conversation[] {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    // Get a single conversation by ID
    getById(id: string): Conversation | undefined {
        const conversations = this.getAll();
        return conversations.find(c => c.id === id);
    },

    // Create a new conversation
    create(firstMessage?: string): Conversation {
        const id = `conv_${Date.now()}`;
        const conversation: Conversation = {
            id,
            title: firstMessage?.substring(0, 50) || 'Nueva conversación',
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        const conversations = this.getAll();
        conversations.unshift(conversation);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));

        return conversation;
    },

    // Update a conversation
    update(id: string, messages: { role: string; content: string }[], title?: string): void {
        const conversations = this.getAll();
        const index = conversations.findIndex(c => c.id === id);

        if (index !== -1) {
            conversations[index].messages = messages;
            conversations[index].updatedAt = Date.now();
            if (title) {
                conversations[index].title = title.substring(0, 50);
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
        }
    },

    // Delete a conversation
    delete(id: string): void {
        const conversations = this.getAll().filter(c => c.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    },

    // Clear all conversations
    clearAll(): void {
        localStorage.removeItem(STORAGE_KEY);
    }
};
