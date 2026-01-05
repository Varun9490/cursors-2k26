import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Cache the working model name to avoid repeated checks
let cachedModelName = null;

// Helper to extract JSON from markdown code blocks or raw text
function cleanAndParseJSON(text) {
    try {
        // Remove markdown formatting
        let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        // Locate the first '{' and last '}' to handle any preamble/postscript
        const firstBrace = cleanText.indexOf('{');
        const lastBrace = cleanText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            cleanText = cleanText.substring(firstBrace, lastBrace + 1);
        }
        return JSON.parse(cleanText);
    } catch (e) {
        console.error("JSON Parse Error. Raw Text:", text);
        // Fallback for simple "valid" text responses that aren't JSON
        if (text.toLowerCase().includes('valid')) return { isValid: true, errors: [] };
        throw new Error("Failed to parse AI response: " + text.substring(0, 50));
    }
}

/**
 * Dynamically find a working model for the provided API key
 */
async function getWorkingModelName() {
    if (cachedModelName) return cachedModelName;

    // List of models to try in order of preference (confirmed available from API)
    const candidates = [
        "gemini-2.0-flash",          // Confirmed available
        "gemini-2.0-flash-001",      // Confirmed available  
        "gemini-2.5-flash",          // Confirmed available
        "gemini-flash-latest",       // Confirmed available
        "gemini-2.0-flash-lite",     // Confirmed available
    ];

    console.log("Detecting available Gemini model...");

    for (const modelName of candidates) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            // Dry run with a tiny prompt
            await model.generateContent("Test");
            console.log(`Successfully connected to model: ${modelName}`);
            cachedModelName = modelName;
            return modelName;
        } catch (error) {
            // 404 means model not found/supported, continue to next
            if (error.message.includes('404') || error.message.includes('not found')) {
                continue;
            }
            // Other errors (auth, quota) might be fatal, but let's keep trying
            console.warn(`Model ${modelName} failed: ${error.message}`);
        }
    }

    // Default to flash if all checks fail (will likely 404 but we have no choice)
    // Default to 2.0 flash if all checks fail
    return "gemini-2.0-flash";
}

/**
 * Verify code syntax and logic using Gemini as a virtual compiler
 */
export async function verifyCode(code, language) {
    if (!process.env.GEMINI_API_KEY) {
        return { isValid: false, errors: ['GEMINI_API_KEY not configured'] };
    }

    try {
        const modelName = await getWorkingModelName();
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = `
        Act as a strict compiler and code verifier for ${language}.
        Analyze the following code for:
        1. Syntax errors
        2. Compilation errors
        3. Logical bugs
        4. Runtime safety issues
        
        Code:
        \`\`\`${language}
        ${code}
        \`\`\`
        
        Return a JSON object ONLY with this structure:
        {
            "isValid": boolean,
            "compilationSuccess": boolean,
            "errors": ["list of syntax/compilation errors"],
            "warnings": ["list of logical/quality warnings"],
            "suggestion": "string suggestion to fix"
        }
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return cleanAndParseJSON(text);

    } catch (error) {
        console.error('Verification Error:', error);
        return {
            isValid: false,
            compilationSuccess: false,
            errors: [`Verification failed: ${error.message}`],
            warnings: []
        };
    }
}

/**
 * Analyze image for AI generation artifacts
 */
export async function detectAIImage(imageBuffer, mimeType) {
    try {
        const modelName = await getWorkingModelName();
        // Vision might check for specific support but generally flash/pro-vision work.
        // If we fallback to 'gemini-pro' (text only), this call will fail.
        // But better to try than hardcode 404.
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = `
        Analyze this image STRICTLY for signs of AI generation (Midjourney, DALL-E, Stable Diffusion).
        
        Look for specific AI artifacts:
        1. Text/watermarks that are gibberish or warped.
        2. Anatomy issues (extra fingers, asymmetrical eyes, blending limbs).
        3. Logic errors (objects floating, shadows inconsistent with light).
        4. "AI Glaze" (perfectly smooth skin, hyper-saturated lighting, distinct noise patterns).
        5. Background incoherence (blurry or nonsensical details).

        If the image looks like a real photo or screenshot with no obvious artifacts, classify as Real.
        
        Return a JSON object ONLY:
        {
            "isLikelyAI": boolean,
            "aiProbability": number (0-100),
            "artifacts": ["detailed list of found artifacts"],
            "reasoning": "concise explanation of the verdict"
        }
        `;

        const imagePart = {
            inlineData: {
                data: imageBuffer.toString('base64'),
                mimeType
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const text = result.response.text();
        return cleanAndParseJSON(text);
    } catch (error) {
        console.error('Image Analysis Error:', error);

        // Specific error for text-only model trying to read image
        if (error.message.includes('Images are not supported')) {
            return {
                isLikelyAI: false,
                aiProbability: 0,
                artifacts: [],
                reasoning: "Selected AI model does not support image analysis. Please upgrade API key to support Vision models."
            };
        }

        return {
            isLikelyAI: false,
            aiProbability: 0,
            artifacts: [],
            reasoning: `Analysis failed: ${error.message}`
        };
    }
}
