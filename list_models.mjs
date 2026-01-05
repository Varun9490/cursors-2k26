import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

async function listModels() {
    if (!process.env.GEMINI_API_KEY) {
        console.error('No API Key found in env');
        return;
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        // The SDK doesn't expose listModels directly on the main class easily in all versions,
        // but let's try via the fetch approach or check if the user's specific SDK version supports it.
        // Actually simplest is just a fetch to the endpoint.
        const key = process.env.GEMINI_API_KEY;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();

        console.log('Available Models:');
        if (data.models) {
            data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log('No models found or error:', data);
        }
    } catch (e) {
        console.error('Error listing models:', e);
    }
}

listModels();
