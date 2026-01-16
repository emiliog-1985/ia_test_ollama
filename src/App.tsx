import { useState, useEffect } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { Sidebar } from './components/Sidebar';
import { KnowledgeManager } from './components/KnowledgeManager';
import { useChat } from './hooks/useChat';
import { OllamaService, type OllamaModel } from './services/ollama';
import { ConversationService, type Conversation } from './services/conversations';
import { Moon, Sun, BookOpen } from 'lucide-react';

function App() {
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showKnowledgeManager, setShowKnowledgeManager] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const { messages, isLoading, sendMessage, error, resetChat, refreshKnowledge, getMessagesForSave } = useChat();

  // Apply theme on mount and change
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Load models on mount
  useEffect(() => {
    OllamaService.getTags().then(fetchedModels => {
      setModels(fetchedModels);
      if (fetchedModels.length > 0) {
        setSelectedModel(fetchedModels[0].name);
      }
    }).catch(err => {
      console.error("Failed to load models", err);
    });
  }, []);

  // Load conversations on mount
  useEffect(() => {
    const savedConversations = ConversationService.getAll();
    setConversations(savedConversations);
  }, []);

  // Save messages when they change
  useEffect(() => {
    if (currentConversationId && messages.length > 1) {
      const messagesToSave = getMessagesForSave();
      const firstUserMessage = messagesToSave.find(m => m.role === 'user');
      ConversationService.update(
        currentConversationId,
        messagesToSave,
        firstUserMessage?.content
      );
      setConversations(ConversationService.getAll());
    }
  }, [messages, currentConversationId, getMessagesForSave]);

  const handleNewChat = () => {
    const newConv = ConversationService.create();
    setConversations(ConversationService.getAll());
    setCurrentConversationId(newConv.id);
    resetChat();
  };

  const handleSelectConversation = (id: string) => {
    const conv = ConversationService.getById(id);
    if (conv) {
      setCurrentConversationId(id);
      // Restore messages (add system prompt back)
      const restoredMessages = conv.messages.map(m => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content
      }));
      resetChat(restoredMessages.length > 0 ? restoredMessages : undefined);
    }
  };

  const handleDeleteConversation = (id: string) => {
    ConversationService.delete(id);
    setConversations(ConversationService.getAll());
    if (currentConversationId === id) {
      setCurrentConversationId(null);
      resetChat();
    }
  };

  const handleSendMessage = (content: string) => {
    if (!selectedModel) {
      alert("Por favor selecciona un modelo primero");
      return;
    }

    // Create conversation if none exists
    if (!currentConversationId) {
      const newConv = ConversationService.create(content);
      setCurrentConversationId(newConv.id);
      setConversations(ConversationService.getAll());
    }

    sendMessage(content, selectedModel);
  };

  return (
    <div className="app-wallpaper d-flex align-items-center justify-content-center">
      <div className="app-overlay"></div>

      <main className="glass-window d-flex" style={{ flexDirection: 'row' }}>
        {/* Sidebar Overlay (mobile) */}
        {showSidebar && (
          <div
            className="sidebar-overlay show d-md-none"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`d-md-block ${showSidebar ? '' : 'd-none'}`}>
          <Sidebar
            conversations={conversations}
            currentConversationId={currentConversationId}
            onNewChat={handleNewChat}
            onSelectConversation={(id) => {
              handleSelectConversation(id);
              // Auto-close on mobile
              if (window.innerWidth < 768) setShowSidebar(false);
            }}
            onDeleteConversation={handleDeleteConversation}
          />
        </div>

        {/* Main Chat Area */}
        <div className="flex-grow-1 d-flex flex-column h-100">
          {/* Title Bar */}
          <div className="window-header d-flex align-items-center justify-content-between px-3">
            <button
              className="btn btn-sm btn-link text-secondary p-0"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              ☰
            </button>
            <div className="text-secondary small fw-bold">disam_ia</div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-link text-secondary p-0"
                onClick={() => setShowKnowledgeManager(true)}
                title="Base de Conocimientos"
              >
                <BookOpen size={18} />
              </button>
              <button
                className="btn btn-sm btn-link text-secondary p-0"
                onClick={() => setIsDarkMode(!isDarkMode)}
                title={isDarkMode ? 'Modo claro' : 'Modo oscuro'}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-grow-1 position-relative overflow-hidden">
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              models={models}
              selectedModel={selectedModel}
              onSelectModel={setSelectedModel}
            />
            {error && (
              <div className="position-absolute top-0 start-50 translate-middle-x mt-3 alert alert-danger z-3 py-2 px-3 small shadow-sm fade-in">
                Error: {error}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Knowledge Manager Modal */}
      {showKnowledgeManager && (
        <KnowledgeManager
          onClose={() => {
            setShowKnowledgeManager(false);
            refreshKnowledge(); // Update system prompt with new knowledge
          }}
        />
      )}
    </div>
  );
}

export default App;
