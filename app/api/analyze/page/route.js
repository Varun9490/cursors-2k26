import { NextResponse } from 'next/server';
import { detectAIContent, detectAIGeneratedCode, analyzeSEO } from '@/lib/aiDetection';

export async function POST(req) {
    try {
        const { html, textContent, sourceCode } = await req.json();

        if (!textContent && !html && !sourceCode) {
            return NextResponse.json({ error: 'No content provided' }, { status: 400 });
        }

        const results = {
            timestamp: new Date().toISOString(),
            contentAnalysis: null,
            codeAnalysis: null,
            seoAnalysis: null,
            overallVerdict: 'ORIGINAL',
            overallScore: 100,
            recommendations: []
        };

        // 1. Analyze text content for AI patterns
        if (textContent && textContent.length > 50) {
            results.contentAnalysis = detectAIContent(textContent);

            if (results.contentAnalysis.isLikelyAI) {
                results.overallScore -= results.contentAnalysis.aiScore * 0.5;
                results.recommendations.push('Content shows AI-generated patterns. Consider rewriting for authenticity.');
            }
        }

        // 2. Analyze source code if provided
        if (sourceCode && sourceCode.length > 50) {
            results.codeAnalysis = detectAIGeneratedCode(sourceCode);

            if (results.codeAnalysis.isLikelyAI) {
                results.overallScore -= results.codeAnalysis.aiScore * 0.3;
                results.recommendations.push('Code appears AI-generated. Review for logical errors and missing edge cases.');
            }

            if (results.codeAnalysis.codeQuality < 70) {
                results.recommendations.push('Code quality issues detected. Add proper error handling and remove debug statements.');
            }
        }

        // 3. Analyze SEO (requires HTML)
        if (html && textContent) {
            results.seoAnalysis = analyzeSEO(html, textContent);

            if (results.seoAnalysis.score < 70) {
                results.overallScore -= (100 - results.seoAnalysis.score) * 0.2;
            }

            if (results.seoAnalysis.aiContentPenalty > 0) {
                results.recommendations.push('AI content detected - this may negatively impact search rankings.');
            }

            results.seoAnalysis.issues.forEach(issue => {
                results.recommendations.push(`SEO: ${issue}`);
            });
        }

        // Determine overall verdict
        results.overallScore = Math.max(0, Math.round(results.overallScore));

        if (results.overallScore >= 80) {
            results.overallVerdict = 'ORIGINAL';
        } else if (results.overallScore >= 50) {
            results.overallVerdict = 'MIXED_CONTENT';
        } else {
            results.overallVerdict = 'AI_GENERATED';
        }

        return NextResponse.json(results);

    } catch (error) {
        console.error('Page Analysis Error:', error);
        return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
    }
}
