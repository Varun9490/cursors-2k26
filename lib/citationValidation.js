import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Validates a Digital Object Identifier (DOI) via CrossRef
 */
export async function validateDOI(doi) {
    try {
        if (!doi) return { valid: false, reason: 'No DOI found' };

        // Clean DOI
        const cleanDoi = doi.replace(/https?:\/\/(doi\.org\/)?/, '');

        const response = await axios.get(`https://api.crossref.org/works/${cleanDoi}`, {
            headers: {
                'User-Agent': `PlagDetect/1.0 (mailto:${process.env.CROSSREF_API_EMAIL || 'test@example.com'})`
            },
            timeout: 5000
        });

        if (response.status === 200) {
            const data = response.data.message;
            return {
                valid: true,
                metadata: {
                    title: data.title?.[0],
                    author: data.author?.map(a => `${a.given} ${a.family}`),
                    year: data.created?.['date-parts']?.[0]?.[0]
                }
            };
        }
    } catch (e) {
        return { valid: false, reason: 'DOI Lookup Failed' };
    }
    return { valid: false, reason: 'DOI not found in registry' };
}

/**
 * Checks if a URL is live
 */
export async function checkURL(url) {
    try {
        const response = await axios.head(url, {
            timeout: 5000,
            maxRedirects: 3,
            validateStatus: (status) => status < 400
        });
        return { valid: true, status: response.status };
    } catch (e) {
        return { valid: false, status: e.response?.status || 0, error: e.message };
    }
}

/**
 * Detects AI hallucinations using Gemini (or mock if no key)
 */
export async function detectAIHallucination(citationText, genAI) {
    if (!genAI) {
        // Mock Logic: If citation looks very generic or has "Lorem", flag it
        if (citationText.includes("Lorem") || citationText.includes("Example") || citationText.length < 20) {
            return { likelyFake: true, confidence: 0.9, reasons: ["Generic placeholder text"] };
        }
        return { likelyFake: false, confidence: 0.8, reasons: ["Looks plausible structure"] };
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `You are a citation verification expert. Analyze if this academic reference is likely a hallucination or fake. 

Citation to analyze:
"${citationText}"

Return ONLY valid JSON in this format (no markdown):
{"likelyFake": true/false, "confidence": 0.0-1.0, "reasons": ["reason1", "reason2"]}`;

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        // Clean response (remove markdown if present)
        const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        return JSON.parse(cleanedResponse);
    } catch (e) {
        console.error("Gemini AI Check Error:", e.message);
        return { likelyFake: false, confidence: 0.0, error: "AI Check Failed" };
    }
}
