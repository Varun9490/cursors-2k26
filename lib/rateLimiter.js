/**
 * In-memory rate limiter using a Map.
 * Note: In production, use Redis for distributed systems.
 */
const requestMap = new Map();
const LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5; // requests per minute

export function rateLimit(identifier) {
    const now = Date.now();
    const userRequests = requestMap.get(identifier) || [];

    // Filter out old requests
    const recentRequests = userRequests.filter(timestamp => now - timestamp < LIMIT_WINDOW_MS);

    // Check limit
    if (recentRequests.length >= MAX_REQUESTS) {
        return {
            success: false,
            remaining: 0,
            reset: recentRequests[0] + LIMIT_WINDOW_MS
        };
    }

    // Add new request
    recentRequests.push(now);
    requestMap.set(identifier, recentRequests);

    // Cleanup old entries periodically (could be optimized)
    if (requestMap.size > 1000) {
        for (const [key, timestamps] of requestMap.entries()) {
            if (timestamps.length === 0 || now - timestamps[timestamps.length - 1] > LIMIT_WINDOW_MS) {
                requestMap.delete(key);
            }
        }
    }

    return {
        success: true,
        remaining: MAX_REQUESTS - recentRequests.length,
        reset: now + LIMIT_WINDOW_MS
    };
}
