// Service to extract text from various file types

import mammoth from 'mammoth';

export const extractTextFromFile = async (file: File): Promise<string> => {
    const extension = file.name.split('.').pop()?.toLowerCase();

    switch (extension) {
        case 'txt':
            return await extractFromTxt(file);
        case 'docx':
            return await extractFromDocx(file);
        case 'pdf':
            const { extractTextFromPDF } = await import('./pdf');
            return await extractTextFromPDF(file);
        default:
            throw new Error(`Tipo de archivo no soportado: .${extension}`);
    }
};

const extractFromTxt = async (file: File): Promise<string> => {
    return await file.text();
};

const extractFromDocx = async (file: File): Promise<string> => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
    } catch (error) {
        console.error('Error extracting text from DOCX:', error);
        throw new Error('Error al leer el archivo DOCX');
    }
};

export const getSupportedExtensions = (): string[] => {
    return ['pdf', 'txt', 'docx'];
};

export const getAcceptString = (): string => {
    return '.pdf,.txt,.docx';
};
