import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, ChevronUp } from 'lucide-react';
import { Message } from './Message';
import type { ChatMessage, OllamaModel } from '../services/ollama';
import { useToast } from './Toast';
// Simple Llama SVG Icon replaced by Image
const LlamaIcon = () => (
    <img src="/vickya2.png" alt="Vickya" width="150" height="auto" />
);

interface ChatInterfaceProps {
    messages: ChatMessage[];
    onSendMessage: (content: string) => void;
    isLoading?: boolean;
    models: OllamaModel[];
    selectedModel: string;
    onSelectModel: (model: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading, models, selectedModel, onSelectModel }) => {
    const [input, setInput] = useState('');
    const [showModelMenu, setShowModelMenu] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const endOfMessagesRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const { showToast } = useToast();

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
        }
    }, [input]);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowModelMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSend = () => {
        if (!input.trim() || isLoading) return;
        onSendMessage(input);
        setInput('');
    };

    return (
        <div className="d-flex flex-column h-100 w-100 position-relative">
            {/* Messages Area */}
            <div className="flex-grow-1 overflow-auto px-3" style={{ scrollBehavior: 'smooth', paddingBottom: '240px' }}>
                {messages.length === 0 ? (
                    <div className="h-100 d-flex flex-column align-items-center justify-content-center fade-in pb-5">
                        <div className="mb-4 p-3 bg-white rounded-4 shadow-sm">
                            <LlamaIcon />
                        </div>
                    </div>
                ) : (
                    <div className="container pt-4" style={{ maxWidth: '800px' }}>
                        <div className="d-flex flex-column gap-2">
                            {messages.map((msg, idx) => (
                                msg.role !== 'system' && (
                                    <Message key={idx} role={msg.role as 'user' | 'assistant'} content={msg.content} />
                                )
                            ))}
                            {isLoading && (
                                <div className="d-flex gap-3 py-3 fade-in">
                                    <div className="spinner-grow spinner-grow-sm text-secondary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={endOfMessagesRef} />
                        </div>
                    </div>
                )}
            </div>

            {/* Floating Input Bar */}
            <div className="position-absolute bottom-0 w-100 bg-white pt-4 pb-4 px-3" style={{ background: 'linear-gradient(to top, white 80%, transparent)' }}>
                <div className="container" style={{ maxWidth: '800px' }}>
                    <div className="bg-light rounded-4 p-3 d-flex flex-column gap-2 position-relative shadow-sm border">

                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Envía un mensaje"
                            className="form-control bg-transparent border-0 shadow-none text-dark"
                            style={{ resize: 'none', minHeight: '44px', paddingRight: '120px' }}
                            rows={1}
                        />

                        {/* Controls Group */}
                        <div className="d-flex align-items-center justify-content-between mt-2">
                            <div className="d-flex align-items-center gap-2">
                                <label className="btn btn-light rounded-circle p-0 d-flex align-items-center justify-content-center text-secondary" style={{ width: 32, height: 32, cursor: 'pointer' }}>
                                    <input
                                        type="file"
                                        accept=".pdf,.txt,.docx"
                                        className="d-none"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;

                                            showToast(`Procesando: ${file.name}...`, 'info');

                                            try {
                                                const { extractTextFromFile } = await import('../services/files');
                                                const text = await extractTextFromFile(file);

                                                const prompt = `He subido un documento llamado "${file.name}". Aquí está su contenido:\n\n${text}\n\nPor favor, analízalo y genera un resumen detallado de sus puntos principales.`;
                                                onSendMessage(prompt);
                                                showToast('Archivo procesado correctamente', 'success');
                                            } catch (err: any) {
                                                console.error(err);
                                                showToast(err.message || 'Error al leer el archivo', 'error');
                                            }

                                            e.target.value = '';
                                        }}
                                    />
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
                                </label>
                            </div>

                            <div className="d-flex align-items-center gap-2">
                                {/* Web Toggle */}
                                <button className="btn btn-primary rounded-circle p-0 d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                                    <Globe size={16} />
                                </button>

                                {/* Model Selector */}
                                <div className="position-relative" ref={menuRef}>
                                    <button
                                        onClick={() => setShowModelMenu(!showModelMenu)}
                                        className="btn btn-white bg-white border rounded-pill d-flex align-items-center gap-2 py-1 px-3 shadow-sm"
                                        style={{ fontSize: '0.85rem' }}
                                    >
                                        <span className="text-truncate" style={{ maxWidth: '120px' }}>{selectedModel || 'Seleccionar Modelo'}</span>
                                        <ChevronDown size={14} className="text-secondary" />
                                    </button>

                                    {/* Dropdown */}
                                    {showModelMenu && (
                                        <div className="position-absolute bottom-100 end-0 mb-2 bg-white rounded-3 shadow border overflow-hidden py-1 z-3" style={{ width: '220px' }}>
                                            <div className="px-3 py-2 text-muted fw-bold text-uppercase" style={{ fontSize: '0.65rem' }}>
                                                Modelos Disponibles
                                            </div>
                                            {models.length === 0 ? (
                                                <div className="px-3 py-2 small text-muted">No se encontraron modelos</div>
                                            ) : (
                                                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                                    {models.map(model => (
                                                        <button
                                                            key={model.name}
                                                            onClick={() => {
                                                                onSelectModel(model.name);
                                                                setShowModelMenu(false);
                                                            }}
                                                            className={`dropdown-item px-3 py-2 small text-start w-100 ${selectedModel === model.name ? 'active' : ''}`}
                                                        >
                                                            {model.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Send Button */}
                                <button
                                    onClick={() => handleSend()}
                                    disabled={!input.trim() || isLoading}
                                    className={`btn rounded-circle p-0 d-flex align-items-center justify-content-center ${input.trim() && !isLoading ? 'btn-dark' : 'btn-light text-muted'}`}
                                    style={{ width: 32, height: 32 }}
                                >
                                    <ChevronUp size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="text-center mt-3 text-muted small" style={{ fontSize: '0.75rem' }}>
                    disam_ia puede mostrar información inexacta, por favor verifica sus respuestas.
                </div>
            </div>
        </div>
    );
};
