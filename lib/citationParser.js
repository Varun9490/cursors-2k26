/**
 * Utility to parse raw text into structured citation objects
 * Supports APA, MLA, Chicago, Harvard, IEEE (simplified for demo)
 */

export function parseCitations(text) {
    const citations = [];

    // Patterns for finding citations in a bibliography list
    // This is a complex task; using simplified regex for demonstration
    // Assumes citations are separated by newlines or standard delimiters

    const lines = text.split(/\n+/).filter(line => line.length > 20); // Filter out short headings

    let index = 0;
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // 1. Detect Format & Extract
        let format = 'UNKNOWN';
        let metadata = {};

        // IEEE: [1] Author, ...
        if (/^\[\d+\]/.test(trimmed)) {
            format = 'IEEE';
            metadata = parseIEEE(trimmed);
        }
        // APA: Author, A. A. (Year). Title...
        else if (/^\w+.*\((\d{4})\)\./.test(trimmed)) {
            format = 'APA';
            metadata = parseAPA(trimmed);
        }
        // MLA: Author. "Title." ...
        else if (/\.\s"[^"]+"\s/.test(trimmed)) {
            format = 'MLA';
            metadata = parseMLA(trimmed);
        }
        else {
            // Generic fallback
            metadata = {
                title: trimmed.substring(0, 50) + "...",
                authorNames: ["Unknown"],
                publicationYear: null
            };
        }

        citations.push({
            id: `cit-${index++}`,
            rawText: trimmed,
            format,
            components: metadata,
            position: { startIndex: text.indexOf(trimmed), endIndex: text.indexOf(trimmed) + trimmed.length }
        });
    }

    return citations;
}

function parseAPA(text) {
    // Regex: Author (Year). Title. Source.
    const yearMatch = text.match(/\((\d{4})\)/);
    const titleMatch = text.match(/\)\.\s(.*?)\./); // Very naive

    return {
        publicationYear: yearMatch ? parseInt(yearMatch[1]) : null,
        title: titleMatch ? titleMatch[1] : null,
        authorNames: [text.split('(')[0].trim()]
    };
}

function parseIEEE(text) {
    // [1] Author, "Title," Journal...
    const titleMatch = text.match(/"(.*?)"/);
    const yearMatch = text.match(/\d{4}/);

    return {
        publicationYear: yearMatch ? parseInt(yearMatch[0]) : null,
        title: titleMatch ? titleMatch[1] : null,
        authorNames: [text.substring(text.indexOf(']') + 1, text.indexOf(',')).trim()]
    };
}

function parseMLA(text) {
    // Author. "Title." Source...
    const titleMatch = text.match(/"(.*?)"/);

    return {
        publicationYear: null, // Hard to extract from end often
        title: titleMatch ? titleMatch[1] : null,
        authorNames: [text.split('.')[0].trim()]
    };
}
