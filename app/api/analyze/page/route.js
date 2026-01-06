import { NextResponse } from 'next/server';
import { detectAIContent, detectAIGeneratedCode, analyzeSEO } from '@/lib/aiDetection';
import { checkPlagiarism } from '@/lib/plagiarismUtils';

export async function POST(req) {
    try {
        const { html, textContent, sourceCode, url } = await req.json();

        if (!textContent && !html && !sourceCode) {
            return NextResponse.json({ error: 'No content provided' }, { status: 400 });
        }

        const results = {
            timestamp: new Date().toISOString(),
            url: url || 'Unknown',
            contentAnalysis: null,
            plagiarismAnalysis: null,
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
                results.overallScore -= results.contentAnalysis.aiScore * 0.4;
                results.recommendations.push('🤖 Content shows AI-generated patterns. Consider rewriting for authenticity.');
            }
        }

        // 2. Check for plagiarism (copied content from other sources)
        if (textContent && textContent.length > 100) {
            try {
                // Extract key sentences for plagiarism check
                const sentences = textContent
                    .split(/[.!?]+/)
                    .filter(s => s.trim().length > 30)
                    .slice(0, 10); // Check first 10 meaningful sentences

                let plagiarismMatches = [];
                let totalPlagiarismScore = 0;

                // Use the plagiarism utility for checking
                const plagiarismResult = await checkPlagiarism(textContent.substring(0, 2000));

                if (plagiarismResult) {
                    results.plagiarismAnalysis = {
                        originalityScore: plagiarismResult.originalityScore || 80,
                        matchCount: plagiarismResult.matches?.length || 0,
                        matches: plagiarismResult.matches || [],
                        verdict: plagiarismResult.verdict || 'ORIGINAL'
                    };

                    // Reduce score based on plagiarism
                    if (results.plagiarismAnalysis.originalityScore < 70) {
                        results.overallScore -= (100 - results.plagiarismAnalysis.originalityScore) * 0.3;
                        results.recommendations.push(`📋 Plagiarism detected: ${results.plagiarismAnalysis.matchCount} matches found. Originality: ${results.plagiarismAnalysis.originalityScore}%`);
                    }
                }
            } catch (plagError) {
                console.error('Plagiarism check error:', plagError);
                // Continue without plagiarism check
                results.plagiarismAnalysis = {
                    originalityScore: 100,
                    matchCount: 0,
                    matches: [],
                    verdict: 'UNCHECKED',
                    error: 'Plagiarism check unavailable'
                };
            }
        }

        // 3. Analyze source code if provided
        if (sourceCode && sourceCode.length > 50) {
            results.codeAnalysis = detectAIGeneratedCode(sourceCode);

            if (results.codeAnalysis.isLikelyAI) {
                results.overallScore -= results.codeAnalysis.aiScore * 0.2;
                results.recommendations.push('💻 Code appears AI-generated. Review for logical errors and missing edge cases.');
            }

            if (results.codeAnalysis.codeQuality < 70) {
                results.recommendations.push('⚠️ Code quality issues detected. Add proper error handling and remove debug statements.');
            }
        }

        // 4. Analyze SEO (requires HTML)
        if (html && textContent) {
            results.seoAnalysis = analyzeSEO(html, textContent);

            if (results.seoAnalysis.score < 70) {
                results.overallScore -= (100 - results.seoAnalysis.score) * 0.1;
            }

            if (results.seoAnalysis.aiContentPenalty > 0) {
                results.recommendations.push('📉 AI content detected - this may negatively impact search rankings.');
            }

            // Add top SEO issues
            results.seoAnalysis.issues.slice(0, 3).forEach(issue => {
                results.recommendations.push(`📊 SEO: ${issue}`);
            });
        }

        // Determine overall verdict
        results.overallScore = Math.max(0, Math.round(results.overallScore));

        if (results.overallScore >= 80) {
            results.overallVerdict = 'ORIGINAL';
        } else if (results.overallScore >= 50) {
            results.overallVerdict = 'MIXED_CONTENT';
        } else if (results.contentAnalysis?.isLikelyAI) {
            results.overallVerdict = 'AI_GENERATED';
        } else {
            results.overallVerdict = 'PLAGIARIZED';
        }

        return NextResponse.json(results);

    } catch (error) {
        console.error('Page Analysis Error:', error);
        return NextResponse.json({ error: 'Analysis failed: ' + error.message }, { status: 500 });
    }
}
