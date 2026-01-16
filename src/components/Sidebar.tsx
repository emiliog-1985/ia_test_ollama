import React from 'react';
import { MessageSquarePlus, Trash2, MessageCircle } from 'lucide-react';
import type { Conversation } from '../services/conversations';

interface SidebarProps {
    conversations: Conversation[];
    currentConversationId: string | null;
    onNewChat: () => void;
    onSelectConversation: (id: string) => void;
    onDeleteConversation: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    conversations,
    currentConversationId,
    onNewChat,
    onSelectConversation,
    onDeleteConversation,
}) => {
    return (
        <div className="d-flex flex-column h-100 bg-white border-end" style={{ width: '260px' }}>
            {/* Header */}
            <div className="p-3 border-bottom">
                <button
                    onClick={onNewChat}
                    className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
                >
                    <MessageSquarePlus size={18} />
                    Nueva Conversación
                </button>
            </div>

            {/* Conversation List */}
            <div className="flex-grow-1 overflow-auto p-2">
                {conversations.length === 0 ? (
                    <div className="text-center text-muted small py-4">
                        No hay conversaciones
                    </div>
                ) : (
                    <div className="d-flex flex-column gap-1">
                        {conversations.map(conv => (
                            <div
                                key={conv.id}
                                className={`d-flex align-items-center gap-2 p-2 rounded-3 cursor-pointer ${currentConversationId === conv.id ? 'bg-primary bg-opacity-10' : 'hover-bg-light'
                                    }`}
                                style={{ cursor: 'pointer' }}
                                onClick={() => onSelectConversation(conv.id)}
                            >
                                <MessageCircle size={16} className="text-muted flex-shrink-0" />
                                <span className="flex-grow-1 text-truncate small">{conv.title}</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteConversation(conv.id);
                                    }}
                                    className="btn btn-sm btn-link text-muted p-0 opacity-50"
                                    title="Eliminar"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-3 border-top text-center">
                <small className="text-muted">disam_ia v1.0</small>
            </div>
        </div>
    );
};
