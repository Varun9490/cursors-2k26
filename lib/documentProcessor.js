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
