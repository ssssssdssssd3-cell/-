import type { BackupData, StoredBackup } from './types';

const DB_NAME = 'FoodCoreDB';
const STORE_NAME = 'auto_backups';
const DB_VERSION = 1;

let db: IDBDatabase;

const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (db) return resolve(db);

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error("Error opening DB", request.error);
            reject("Error opening DB");
        };
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };
        request.onupgradeneeded = (event) => {
            const dbInstance = (event.target as IDBOpenDBRequest).result;
            if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
                dbInstance.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
    });
};

export const addBackup = async (data: BackupData): Promise<void> => {
    const db = await initDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const backup: StoredBackup = { id: Date.now(), data };
    store.put(backup);
};

export const getAllBackups = async (): Promise<StoredBackup[]> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        request.onerror = () => reject("Error getting backups");
        request.onsuccess = () => resolve(request.result.sort((a, b) => b.id - a.id)); // Newest first
    });
};

export const deleteBackup = async (id: number): Promise<void> => {
    const db = await initDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.delete(id);
};

export const clearOldBackups = async (): Promise<void> => {
    try {
        const db = await initDB();
        const backups = await getAllBackups();
        const twoDaysAgo = Date.now() - (2 * 24 * 60 * 60 * 1000); // 48 hours in ms
        
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        let deletedCount = 0;
        backups.forEach(backup => {
            if (backup.id < twoDaysAgo) {
                store.delete(backup.id);
                deletedCount++;
            }
        });
        if(deletedCount > 0){
            console.log(`Cleared ${deletedCount} old backups.`);
        }
    } catch (error) {
        console.error("Failed to clear old backups:", error);
    }
};