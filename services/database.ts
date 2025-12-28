
import { Report } from '../App';

export class CivicDB {
  private dbName = 'SaafRastaDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('reports')) {
          db.createObjectStore('reports', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'email' });
        }
      };
    });
  }

  // --- User Operations ---
  async saveUser(user: any): Promise<void> {
    return this.performTransaction('users', 'readwrite', (store) => store.put(user));
  }

  async getUserByEmail(email: string): Promise<any> {
    return this.performTransaction('users', 'readonly', (store) => store.get(email.toLowerCase()));
  }

  // --- Report Operations ---
  async getAllReports(): Promise<Report[]> {
    return this.performTransaction('reports', 'readonly', (store) => store.getAll());
  }

  async saveReport(report: Report): Promise<void> {
    return this.performTransaction('reports', 'readwrite', (store) => store.put(report));
  }

  async updateReport(report: Report): Promise<void> {
    return this.performTransaction('reports', 'readwrite', (store) => store.put(report));
  }

  private async performTransaction<T>(
    storeName: string, 
    mode: IDBTransactionMode, 
    action: (store: IDBObjectStore) => IDBRequest
  ): Promise<T> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      const request = action(store);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

export const dbService = new CivicDB();
