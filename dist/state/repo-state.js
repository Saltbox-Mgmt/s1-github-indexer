// In-memory state store
const stateMap = new Map();
function stateKey(owner, repo, branch) {
    return `${owner}/${repo}:${branch}`;
}
export function getRepoState(owner, repo, branch) {
    return stateMap.get(stateKey(owner, repo, branch));
}
export function setRepoState(state) {
    stateMap.set(stateKey(state.owner, state.repo, state.branch), state);
}
export function updateRepoState(owner, repo, branch, updates) {
    const key = stateKey(owner, repo, branch);
    const existing = stateMap.get(key);
    if (existing) {
        stateMap.set(key, { ...existing, ...updates });
    }
}
export function getAllRepoStates() {
    return Array.from(stateMap.values());
}
// Track processed webhook delivery IDs to avoid duplicates
const processedDeliveries = new Map();
const DELIVERY_TTL_MS = 5 * 60 * 1000; // 5 minutes
export function isDeliveryProcessed(deliveryId) {
    const timestamp = processedDeliveries.get(deliveryId);
    if (!timestamp)
        return false;
    if (Date.now() - timestamp > DELIVERY_TTL_MS) {
        processedDeliveries.delete(deliveryId);
        return false;
    }
    return true;
}
export function markDeliveryProcessed(deliveryId) {
    processedDeliveries.set(deliveryId, Date.now());
    // Cleanup old entries
    const now = Date.now();
    for (const [id, ts] of processedDeliveries) {
        if (now - ts > DELIVERY_TTL_MS) {
            processedDeliveries.delete(id);
        }
    }
}
