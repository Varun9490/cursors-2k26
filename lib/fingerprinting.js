/**
 * Document Fingerprinting for Internal Plagiarism Detection
 * Uses n-gram shingles and hashing for efficient similarity detection
 */

import crypto from 'crypto';
import { normalizeText } from './plagiarismUtils';

/**
 * Generate SHA-256 hash of text
 */
export function hashText(text) {
    return crypto.createHash('sha256').update(text).digest('hex');
}

/**
 * Generate content hash for document (used for exact duplicate detection)
 */
export function generateContentHash(text) {
    const normalized = normalizeText(text);
    return hashText(normalized);
}

/**
 * Generate n-gram shingles from text
 * @param {string} text - Text to process
 * @param {number} n - Size of each shingle (default 5 words)
 * @returns {Array<{shingle: string, hash: string, position: number}>}
 */
export function generateShingles(text, n = 5) {
    const normalized = normalizeText(text);
    const words = normalized.split(' ').filter(w => w.length > 0);
    const shingles = [];

    for (let i = 0; i <= words.length - n; i++) {
        const shingle = words.slice(i, i + n).join(' ');
        shingles.push({
            shingle,
            hash: hashText(shingle),
            position: i
        });
    }

    return shingles;
}

/**
 * Calculate Jaccard similarity between two sets of fingerprints
 * @param {Set<string>} set1 - First set of fingerprint hashes
 * @param {Set<string>} set2 - Second set of fingerprint hashes
 * @returns {number} - Similarity score (0-100)
 */
export function calculateJaccardSimilarity(set1, set2) {
    if (set1.size === 0 && set2.size === 0) return 100;
    if (set1.size === 0 || set2.size === 0) return 0;

    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return (intersection.size / union.size) * 100;
}

/**
 * Find matching fingerprints between a new document and existing documents
 * @param {Array<string>} newFingerprints - Fingerprints of new document
 * @param {Array<{documentId: string, fingerprint: string}>} existingFingerprints - Existing fingerprints from DB
 * @returns {Object} - Map of documentId -> { matchCount, similarity }
 */
export function findMatchingDocuments(newFingerprints, existingFingerprints) {
    const newSet = new Set(newFingerprints);
    const documentMatches = {};

    // Group existing fingerprints by document
    const docFingerprints = {};
    for (const { documentId, fingerprint } of existingFingerprints) {
        if (!docFingerprints[documentId]) {
            docFingerprints[documentId] = new Set();
        }
        docFingerprints[documentId].add(fingerprint);
    }

    // Calculate similarity for each document
    for (const [docId, fingerprintSet] of Object.entries(docFingerprints)) {
        const matchCount = [...newSet].filter(fp => fingerprintSet.has(fp)).length;
        const similarity = calculateJaccardSimilarity(newSet, fingerprintSet);

        if (matchCount > 0) {
            documentMatches[docId] = {
                matchCount,
                similarity: Math.round(similarity * 100) / 100,
                totalFingerprints: fingerprintSet.size
            };
        }
    }

    return documentMatches;
}

/**
 * Determine match type based on similarity score
 */
export function getMatchType(similarity) {
    if (similarity >= 90) return 'EXACT';
    if (similarity >= 70) return 'NEAR_DUPLICATE';
    if (similarity >= 30) return 'PARTIAL';
    return 'LOW';
}

/**
 * MinHash implementation for large-scale similarity detection
 * Uses k hash functions to create signature
 */
export function generateMinHashSignature(shingles, k = 100) {
    const signature = [];

    for (let i = 0; i < k; i++) {
        let minHash = Infinity;
        for (const shingle of shingles) {
            // Create different hash by appending seed
            const hash = parseInt(hashText(shingle + i.toString()).substring(0, 8), 16);
            if (hash < minHash) {
                minHash = hash;
            }
        }
        signature.push(minHash);
    }

    return signature;
}

/**
 * Estimate similarity using MinHash signatures
 * @param {Array<number>} sig1 - First signature
 * @param {Array<number>} sig2 - Second signature
 * @returns {number} - Estimated Jaccard similarity (0-1)
 */
export function estimateSimilarityFromMinHash(sig1, sig2) {
    if (sig1.length !== sig2.length) return 0;

    let matches = 0;
    for (let i = 0; i < sig1.length; i++) {
        if (sig1[i] === sig2[i]) matches++;
    }

    return matches / sig1.length;
}

/**
 * Process a document and return all fingerprinting data
 */
export async function processDocumentForFingerprinting(text) {
    const normalizedText = normalizeText(text);
    const words = normalizedText.split(' ').filter(w => w.length > 0);

    return {
        contentHash: generateContentHash(text),
        wordCount: words.length,
        shingles: generateShingles(text, 5),
        // MinHash signature for quick comparison
        minHashSignature: generateMinHashSignature(
            generateShingles(text, 5).map(s => s.shingle),
            100
        )
    };
}
