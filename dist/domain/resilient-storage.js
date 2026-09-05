export function createResilientStorage(provider) {
    const memory = new Map();
    const removed = new Set();
    const persistent = () => { try {
        return provider();
    }
    catch {
        return null;
    } };
    return {
        getItem(key) {
            if (removed.has(key))
                return null;
            if (memory.has(key))
                return memory.get(key) ?? null;
            const storage = persistent();
            if (!storage)
                return null;
            try {
                return storage.getItem(key);
            }
            catch {
                return null;
            }
        },
        setItem(key, value) {
            const text = String(value);
            memory.set(key, text);
            removed.delete(key);
            const storage = persistent();
            if (!storage)
                return;
            try {
                storage.setItem(key, text);
            }
            catch { /* session memory preserves latest value */ }
        },
        removeItem(key) {
            memory.delete(key);
            removed.add(key);
            const storage = persistent();
            if (!storage)
                return;
            try {
                storage.removeItem(key);
            }
            catch { /* tombstone prevents stale resurrection */ }
        },
    };
}
export function createBrowserSessionStorage() {
    return createResilientStorage(() => {
        if (typeof window === 'undefined')
            return null;
        try {
            return window.localStorage;
        }
        catch {
            return null;
        }
    });
}
