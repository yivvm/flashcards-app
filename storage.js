const STORAGE_KEY = 'flashcards.state';
const STORAGE_VERSION = 1;

function saveState(data) {
    try {
        const payload = { version: STORAGE_VERSION, data };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        return true;
    } catch (err) {
        console.warn('[storage] saveState failed:', err);
        return false;
    }
}

function loadState() {
    let raw;
    try {
        raw = localStorage.getItem(STORAGE_KEY);
    } catch (err) {
        console.warn('[storage] localStorage unavailable:', err);
        return null;
    }
    if (!raw) return null;

    let parsed;
    try {
        parsed = JSON.parse(raw);
    } catch (err) {
        console.warn('[storage] corrupt JSON, discarding:', err);
        try { localStorage.removeItem(STORAGE_KEY); } catch (_) { /* ignore */ }
        return null;
    }

    if (!parsed || typeof parsed !== 'object' || parsed.version !== STORAGE_VERSION) {
        return null;
    }
    return parsed.data ?? null;
}

function clearState() {
    try { localStorage.removeItem(STORAGE_KEY); return true; }
    catch (err) { console.warn('[storage] clearState failed:', err); return false; }
}

window.FlashcardsStorage = { loadState, saveState, clearState, VERSION: STORAGE_VERSION };
