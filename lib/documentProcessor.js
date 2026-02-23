// Polyfill DOMMatrix for Node.js (required by pdfjs-dist used internally by pdf-parse)
if (typeof globalThis.DOMMatrix === 'undefined') {
    class DOMMatrixPolyfill {
        constructor(init) {
            this.m11 = 1; this.m12 = 0; this.m13 = 0; this.m14 = 0;
            this.m21 = 0; this.m22 = 1; this.m23 = 0; this.m24 = 0;
            this.m31 = 0; this.m32 = 0; this.m33 = 1; this.m34 = 0;
            this.m41 = 0; this.m42 = 0; this.m43 = 0; this.m44 = 1;
            this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
            this.is2D = true;
            this.isIdentity = true;
            if (Array.isArray(init) && init.length === 6) {
                this.a = this.m11 = init[0];
                this.b = this.m12 = init[1];
                this.c = this.m21 = init[2];
                this.d = this.m22 = init[3];
                this.e = this.m41 = init[4];
                this.f = this.m42 = init[5];
                this.isIdentity = false;
            }
        }
        inverse() { return new DOMMatrixPolyfill(); }
        multiply() { return new DOMMatrixPolyfill(); }
        translate() { return new DOMMatrixPolyfill(); }
        scale() { return new DOMMatrixPolyfill(); }
        rotate() { return new DOMMatrixPolyfill(); }
        transformPoint(point) { return point || { x: 0, y: 0 }; }
        static fromMatrix() { return new DOMMatrixPolyfill(); }
        static fromFloat32Array() { return new DOMMatrixPolyfill(); }
        static fromFloat64Array() { return new DOMMatrixPolyfill(); }
    }
    globalThis.DOMMatrix = DOMMatrixPolyfill;
    globalThis.DOMMatrixReadOnly = DOMMatrixPolyfill;
}

import mammoth from 'mammoth';
import JSZip from 'jszip';

export async function processDocument(fileBuffer, mimeType) {
    try {
        let extractedText = '';
        let metadata = {
            pageCount: 0,
            wordCount: 0,
            characterCount: 0,
            fileType: mimeType
        };

        if (mimeType === 'application/pdf') {
            // Dynamic import for pdf-parse (CommonJS compatibility)
            const pdfParse = (await import('pdf-parse')).default;
            const data = await pdfParse(fileBuffer);
            extractedText = data.text;
            metadata.pageCount = data.numpages;
            metadata.info = data.info;
        }
        else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const result = await mammoth.extractRawText({ buffer: fileBuffer });
            extractedText = result.value;
        }
        else if (mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
            // PPTX Processing
            extractedText = await processPPTX(fileBuffer);
            metadata.fileType = 'presentation';
        }
        else if (mimeType === 'text/plain') {
            extractedText = fileBuffer.toString('utf-8');
        }
        else {
            throw new Error('Unsupported file type. Supported: PDF, DOCX, PPTX, TXT');
        }

        // Cleanup text
        extractedText = extractedText.replace(/\r\n/g, '\n').trim();

        metadata.characterCount = extractedText.length;
        metadata.wordCount = extractedText.split(/\s+/).filter(w => w.length > 0).length;

        return {
            text: extractedText,
            metadata
        };

    } catch (error) {
        console.error("Document processing error:", error);
        throw error;
    }
}

// Extract text from PowerPoint presentations
async function processPPTX(buffer) {
    try {
        const zip = await JSZip.loadAsync(buffer);
        const slideTexts = [];

        // PPTX files are ZIP archives containing XML files
        // Slides are in ppt/slides/slide*.xml
        const slideFiles = Object.keys(zip.files)
            .filter(name => name.startsWith('ppt/slides/slide') && name.endsWith('.xml'))
            .sort(); // Ensure proper order

        for (const slideFile of slideFiles) {
            const content = await zip.file(slideFile).async('string');
            // Extract text from XML (simple regex approach)
            const textMatches = content.match(/<a:t>([^<]*)<\/a:t>/g) || [];
            const slideText = textMatches
                .map(match => match.replace(/<\/?a:t>/g, ''))
                .join(' ');
            if (slideText.trim()) {
                slideTexts.push(slideText.trim());
            }
        }

        return slideTexts.join('\n\n--- Slide ---\n\n');
    } catch (error) {
        console.error('PPTX processing error:', error);
        throw new Error('Failed to extract text from PowerPoint file');
    }
}
