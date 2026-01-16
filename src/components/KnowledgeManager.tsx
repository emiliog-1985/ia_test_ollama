import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, X, BookOpen, RefreshCw, Eye, CheckCircle } from 'lucide-react';
import { KnowledgeService, type KnowledgeEntry } from '../services/knowledge';
import { useToast } from './Toast';

interface KnowledgeManagerProps {
    onClose: () => void;
}

export const KnowledgeManager: React.FC<KnowledgeManagerProps> = ({ onClose }) => {
    const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newEntry, setNewEntry] = useState({ title: '', content: '', category: '' });
    const [showAddForm, setShowAddForm] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [recentlyAdded, setRecentlyAdded] = useState<string | null>(null);
    const { showToast } = useToast();

    useEffect(() => {
        setEntries(KnowledgeService.getAll());
    }, []);

    const handleAdd = () => {
        if (!newEntry.title || !newEntry.content || !newEntry.category) {
            showToast('Completa todos los campos', 'warning');
            return;
        }

        const added = KnowledgeService.add(newEntry);
        setEntries(KnowledgeService.getAll());
        setNewEntry({ title: '', content: '', category: '' });
        setShowAddForm(false);
        setRecentlyAdded(added.id);
        showToast(`✅ "${newEntry.title}" agregado a ${newEntry.category}`, 'success');

        // Clear highlight after 3 seconds
        setTimeout(() => setRecentlyAdded(null), 3000);
    };

    const handleUpdate = (id: string, updates: Partial<KnowledgeEntry>) => {
        KnowledgeService.update(id, updates);
        setEntries(KnowledgeService.getAll());
        setEditingId(null);
        showToast('✅ Conocimiento actualizado', 'success');
    };

    const handleDelete = (id: string) => {
        const entry = entries.find(e => e.id === id);
        if (confirm(`¿Eliminar "${entry?.title}"?`)) {
            KnowledgeService.delete(id);
            setEntries(KnowledgeService.getAll());
            showToast(`🗑️ "${entry?.title}" eliminado`, 'info');
        }
    };

    const handleReset = () => {
        if (confirm('¿Restaurar conocimientos por defecto? Se perderán los cambios.')) {
            KnowledgeService.reset();
            setEntries(KnowledgeService.getAll());
            showToast('Conocimientos restaurados', 'success');
        }
    };

    const categories = KnowledgeService.getCategories();
    const totalChars = entries.reduce((acc, e) => acc + e.content.length, 0);

    return (
        <div className="position-fixed inset-0 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center z-3" style={{ top: 0, left: 0, right: 0, bottom: 0 }}>
            <div className="bg-white rounded-4 shadow-lg d-flex flex-column" style={{ width: '90%', maxWidth: '900px', maxHeight: '90vh', overflow: 'hidden' }}>
                {/* Header */}
                <div className="d-flex align-items-center justify-content-between p-3 border-bottom bg-light flex-shrink-0">
                    <div className="d-flex align-items-center gap-2">
                        <BookOpen size={20} className="text-primary" />
                        <h5 className="m-0">Base de Conocimientos</h5>
                        <span className="badge bg-primary">{entries.length} entradas</span>
                        <span className="badge bg-secondary">{Math.round(totalChars / 1000)}k caracteres</span>
                    </div>
                    <div className="d-flex gap-2">
                        <button
                            className={`btn btn-sm ${showPreview ? 'btn-info' : 'btn-outline-info'}`}
                            onClick={() => setShowPreview(!showPreview)}
                            title="Ver contexto generado"
                        >
                            <Eye size={16} /> Vista previa
                        </button>
                        <button className="btn btn-sm btn-outline-secondary" onClick={handleReset} title="Restaurar">
                            <RefreshCw size={16} />
                        </button>
                        <button className="btn btn-sm btn-primary" onClick={() => setShowAddForm(true)}>
                            <Plus size={16} /> Agregar
                        </button>
                        <button className="btn btn-sm btn-link text-muted" onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Preview Panel */}
                {showPreview && (
                    <div className="border-bottom p-3 bg-light flex-shrink-0" style={{ maxHeight: '200px', overflow: 'auto' }}>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="m-0 text-muted">📋 Contexto que recibe el modelo:</h6>
                            <small className="text-muted">Este texto se inyecta automáticamente en cada conversación</small>
                        </div>
                        <pre className="small bg-white p-2 rounded border" style={{ whiteSpace: 'pre-wrap', fontSize: '11px', maxHeight: '120px', overflow: 'auto' }}>
                            {KnowledgeService.generateContext()}
                        </pre>
                    </div>
                )}

                {/* Content */}
                <div className="p-3 overflow-auto flex-grow-1">
                    {/* Add Form */}
                    {showAddForm && (
                        <div className="card mb-3 border-primary shadow-sm">
                            <div className="card-header bg-primary text-white py-2">
                                <strong>➕ Nuevo Conocimiento</strong>
                            </div>
                            <div className="card-body">
                                <div className="row g-2 mb-2">
                                    <div className="col-md-6">
                                        <label className="form-label small mb-1">Título</label>
                                        <input
                                            type="text"
                                            className="form-control form-control-sm"
                                            placeholder="Ej: Horarios de atención"
                                            value={newEntry.title}
                                            onChange={e => setNewEntry({ ...newEntry, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small mb-1">Categoría</label>
                                        <input
                                            type="text"
                                            className="form-control form-control-sm"
                                            placeholder="Ej: Servicios, Urgencias"
                                            value={newEntry.category}
                                            onChange={e => setNewEntry({ ...newEntry, category: e.target.value })}
                                            list="categories"
                                        />
                                        <datalist id="categories">
                                            {categories.map(c => <option key={c} value={c} />)}
                                        </datalist>
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <label className="form-label small mb-1">Contenido</label>
                                    <textarea
                                        className="form-control form-control-sm"
                                        placeholder="Escribe la información que el modelo debe conocer..."
                                        rows={4}
                                        value={newEntry.content}
                                        onChange={e => setNewEntry({ ...newEntry, content: e.target.value })}
                                    />
                                    <small className="text-muted">{newEntry.content.length} caracteres</small>
                                </div>
                                <div className="d-flex gap-2">
                                    <button className="btn btn-sm btn-success" onClick={handleAdd}>
                                        <CheckCircle size={14} /> Guardar Conocimiento
                                    </button>
                                    <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowAddForm(false)}>
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Entries by category */}
                    {categories.map(category => (
                        <div key={category} className="mb-4">
                            <h6 className="text-muted border-bottom pb-2 d-flex justify-content-between">
                                <span>📁 {category}</span>
                                <span className="badge bg-light text-dark">{entries.filter(e => e.category === category).length}</span>
                            </h6>
                            {entries.filter(e => e.category === category).map(entry => (
                                <div
                                    key={entry.id}
                                    className={`card mb-2 ${recentlyAdded === entry.id ? 'border-success bg-success bg-opacity-10' : ''}`}
                                    style={{ transition: 'all 0.3s ease' }}
                                >
                                    <div className="card-body p-2">
                                        {editingId === entry.id ? (
                                            <EditForm
                                                entry={entry}
                                                categories={categories}
                                                onSave={(updates) => handleUpdate(entry.id, updates)}
                                                onCancel={() => setEditingId(null)}
                                            />
                                        ) : (
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div className="flex-grow-1">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <strong className="small">{entry.title}</strong>
                                                        {recentlyAdded === entry.id && (
                                                            <span className="badge bg-success">✓ Agregado</span>
                                                        )}
                                                    </div>
                                                    <p className="small text-muted mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                                                        {entry.content.substring(0, 150)}
                                                        {entry.content.length > 150 && '...'}
                                                    </p>
                                                    <small className="text-muted">{entry.content.length} caracteres</small>
                                                </div>
                                                <div className="d-flex gap-1 ms-2">
                                                    <button
                                                        className="btn btn-sm btn-outline-primary py-0 px-2"
                                                        onClick={() => setEditingId(entry.id)}
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger py-0 px-2"
                                                        onClick={() => handleDelete(entry.id)}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}

                    {entries.length === 0 && (
                        <div className="text-center text-muted py-5">
                            <BookOpen size={48} className="mb-3 opacity-50" />
                            <p>No hay conocimientos. Agrega el primero.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-top p-2 bg-light d-flex justify-content-between align-items-center flex-shrink-0">
                    <small className="text-muted">
                        💡 Los cambios se aplican automáticamente al cerrar
                    </small>
                    <button className="btn btn-sm btn-primary" onClick={onClose}>
                        Cerrar y Aplicar
                    </button>
                </div>
            </div>
        </div>
    );
};

// Edit Form Component
const EditForm: React.FC<{
    entry: KnowledgeEntry;
    categories: string[];
    onSave: (updates: Partial<KnowledgeEntry>) => void;
    onCancel: () => void;
}> = ({ entry, categories, onSave, onCancel }) => {
    const [title, setTitle] = useState(entry.title);
    const [content, setContent] = useState(entry.content);
    const [category, setCategory] = useState(entry.category);

    return (
        <div>
            <div className="row g-2 mb-2">
                <div className="col-md-6">
                    <input
                        type="text"
                        className="form-control form-control-sm"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Título"
                    />
                </div>
                <div className="col-md-6">
                    <input
                        type="text"
                        className="form-control form-control-sm"
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        list="edit-categories"
                        placeholder="Categoría"
                    />
                    <datalist id="edit-categories">
                        {categories.map(c => <option key={c} value={c} />)}
                    </datalist>
                </div>
            </div>
            <textarea
                className="form-control form-control-sm mb-2"
                rows={4}
                value={content}
                onChange={e => setContent(e.target.value)}
            />
            <small className="text-muted d-block mb-2">{content.length} caracteres</small>
            <div className="d-flex gap-2">
                <button className="btn btn-sm btn-success" onClick={() => onSave({ title, content, category })}>
                    <Save size={14} /> Guardar
                </button>
                <button className="btn btn-sm btn-outline-secondary" onClick={onCancel}>
                    Cancelar
                </button>
            </div>
        </div>
    );
};
