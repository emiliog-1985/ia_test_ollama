// Knowledge Base Service - Allows dynamic knowledge management

export interface KnowledgeEntry {
    id: string;
    title: string;
    content: string;
    category: string;
    createdAt: number;
    updatedAt: number;
}

const STORAGE_KEY = 'disam_ia_knowledge';

// Default knowledge entries
const DEFAULT_KNOWLEDGE: KnowledgeEntry[] = [
    {
        id: 'disam_general',
        title: 'DISAM - Información General',
        content: `DISAM (Dirección de Salud Municipal de Arica)
- Directora: Sra. Claudia Villegas Cortés
- Dirección: Patricio Lynch #228, Arica
- Teléfono General: (56-58) 2206004
- Secretaría: Sra. Angélica Muena Páez - secretaria.desamu@sermusarica.cl - Tel: 233250101
- Oficina de Partes: Sr. Marco Murillo Muñoz - oficina.partes@sermusarica.cl - Tel: 233250102`,
        category: 'Institucional',
        createdAt: Date.now(),
        updatedAt: Date.now()
    },
    {
        id: 'mision_vision',
        title: 'Misión y Visión',
        content: `MISIÓN: Otorgar atención de salud integral centrada en las personas, en base al modelo de salud familiar y comunitario con énfasis en las acciones de promoción, prevención y participación social, desde una perspectiva de equidad, pertinencia territorial y trabajo en equipo.

VISIÓN: Ser una institución de salud referente, confiable y reconocida por la comunidad, por su cercanía, compromiso y calidad en el cuidado de las personas y sus familias.`,
        category: 'Institucional',
        createdAt: Date.now(),
        updatedAt: Date.now()
    },
    {
        id: 'cesfams',
        title: 'Centros de Salud (CESFAM)',
        content: `1. CESFAM Matrona Rosa Vascopé Zarzola - Directora: Sra. Carmen Chandia Ibáñez - Dirección: Volcán Guallatire #1070 - Tel: 233250281
2. CESFAM Sr. Eugenio Petruccelli Astudillo
3. CESFAM Dr. Remigio Sapunar Marín
4. CESFAM Dr. Victor Bertin Soto
5. CESFAM Enfermera Iris Véliz Hume
6. CESFAM Dr. Amador Neghme Rodríguez`,
        category: 'Centros de Salud',
        createdAt: Date.now(),
        updatedAt: Date.now()
    },
    {
        id: 'farmacia',
        title: 'Farmacia Municipal',
        content: `- Director Técnico: Qf. Bonny Colque Paucara
- Dirección: 18 de Septiembre #453
- Teléfono: 233250264
- Horario: Lunes a Jueves 09:00-17:00, Viernes 09:00-16:00
- Requisitos: Cédula de Identidad + Comprobante de domicilio de la comuna`,
        category: 'Servicios',
        createdAt: Date.now(),
        updatedAt: Date.now()
    },
    {
        id: 'urgencias',
        title: 'Servicios de Urgencia',
        content: `SAPU (Servicio de Atención Primaria de Urgencia):
- SAPU E.U. Marco Carvajal Moreno
- SAPU Matrona Rosa Vascopé Zarzola

SAR (Servicio de Alta Resolutividad):
- SAR Iris Véliz Hume`,
        category: 'Urgencias',
        createdAt: Date.now(),
        updatedAt: Date.now()
    }
];

export const KnowledgeService = {
    // Initialize with default knowledge if empty
    initialize(): void {
        const existing = localStorage.getItem(STORAGE_KEY);
        if (!existing) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_KNOWLEDGE));
        }
    },

    // Get all knowledge entries
    getAll(): KnowledgeEntry[] {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : DEFAULT_KNOWLEDGE;
    },

    // Get by ID
    getById(id: string): KnowledgeEntry | undefined {
        return this.getAll().find(k => k.id === id);
    },

    // Get by category
    getByCategory(category: string): KnowledgeEntry[] {
        return this.getAll().filter(k => k.category === category);
    },

    // Get all categories
    getCategories(): string[] {
        const entries = this.getAll();
        return [...new Set(entries.map(e => e.category))];
    },

    // Add new entry
    add(entry: Omit<KnowledgeEntry, 'id' | 'createdAt' | 'updatedAt'>): KnowledgeEntry {
        const newEntry: KnowledgeEntry = {
            ...entry,
            id: `kb_${Date.now()}`,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        const entries = this.getAll();
        entries.push(newEntry);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));

        return newEntry;
    },

    // Update entry
    update(id: string, updates: Partial<Omit<KnowledgeEntry, 'id' | 'createdAt'>>): void {
        const entries = this.getAll();
        const index = entries.findIndex(e => e.id === id);

        if (index !== -1) {
            entries[index] = {
                ...entries[index],
                ...updates,
                updatedAt: Date.now()
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
        }
    },

    // Delete entry
    delete(id: string): void {
        const entries = this.getAll().filter(e => e.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    },

    // Reset to defaults
    reset(): void {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_KNOWLEDGE));
    },

    // Generate context string for AI
    generateContext(): string {
        const entries = this.getAll();
        const categories = this.getCategories();

        let context = '## BASE DE CONOCIMIENTOS DISAM\n\n';

        for (const category of categories) {
            context += `### ${category}\n`;
            const categoryEntries = entries.filter(e => e.category === category);

            for (const entry of categoryEntries) {
                context += `\n**${entry.title}**\n${entry.content}\n`;
            }
            context += '\n';
        }

        return context;
    }
};

// Initialize on module load
KnowledgeService.initialize();
