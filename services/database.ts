import { User, ATSReport } from '../types';

/**
 * MONGODB ATLAS CONFIGURATION
 * Note: If placeholders are left as is, the system automatically uses LocalStorage.
 */
const MONGO_CONFIG = {
  endpoint: 'https://data.mongodb-api.com/app/YOUR_APP_ID/endpoint/data/v1', 
  apiKey: 'YOUR_GENERATED_API_KEY', 
  dataSource: 'Cluster0',
  database: 'ATS_PRO_DB',
};

class MongoDatabaseService {
  private isConfigured(): boolean {
    return MONGO_CONFIG.apiKey !== 'YOUR_GENERATED_API_KEY' && 
           MONGO_CONFIG.endpoint.indexOf('YOUR_APP_ID') === -1;
  }

  private async request(action: string, collection: string, additionalBody: any = {}) {
    // Check if configuration is present
    if (!this.isConfigured()) {
      return this.localStorageFallback(action, collection, additionalBody);
    }

    try {
      const response = await fetch(`${MONGO_CONFIG.endpoint}/action/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': MONGO_CONFIG.apiKey,
        },
        body: JSON.stringify({
          dataSource: MONGO_CONFIG.dataSource,
          database: MONGO_CONFIG.database,
          collection: collection,
          ...additionalBody,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }
      return await response.json();
    } catch (err) {
      console.warn(`[Database] MongoDB request failed, falling back to LocalStorage:`, err);
      return this.localStorageFallback(action, collection, additionalBody);
    }
  }

  private localStorageFallback(action: string, collection: string, additionalBody: any) {
    const localData = localStorage.getItem(`ats_db_${collection}`);
    let documents = localData ? JSON.parse(localData) : [];
    
    if (action === 'find') return { documents };
    
    if (action === 'insertOne') {
      documents.push(additionalBody.document);
      localStorage.setItem(`ats_db_${collection}`, JSON.stringify(documents));
      return { insertedId: 'local-' + Date.now() };
    }
    
    if (action === 'updateOne') {
      const index = documents.findIndex((d: any) => d.id === additionalBody.filter.id);
      if (index !== -1) {
        documents[index] = { ...documents[index], ...additionalBody.update.$set };
      } else if (additionalBody.upsert) {
        documents.push(additionalBody.update.$set);
      }
      localStorage.setItem(`ats_db_${collection}`, JSON.stringify(documents));
      return { modifiedCount: 1 };
    }
    
    return { documents: [] };
  }

  async init(): Promise<void> {
    if (!this.isConfigured()) {
      console.info("ℹ️ LocalStorage Mode Active.");
    }
  }

  async getUsers(): Promise<User[]> {
    const data = await this.request('find', 'users');
    return data.documents || [];
  }

  async saveUser(user: User): Promise<void> {
    await this.request('updateOne', 'users', {
      filter: { id: user.id },
      update: { $set: user },
      upsert: true
    });
  }

  async getReports(): Promise<ATSReport[]> {
    const data = await this.request('find', 'reports');
    const reports = data.documents || [];
    return reports.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async saveReport(report: ATSReport): Promise<void> {
    await this.request('insertOne', 'reports', {
      document: report
    });
  }

  async updateReport(report: ATSReport): Promise<void> {
    await this.request('updateOne', 'reports', {
      filter: { id: report.id },
      update: { $set: report }
    });
  }

  async getStats(): Promise<{ users: number; reports: number }> {
    const users = await this.getUsers();
    const reports = await this.getReports();
    return { users: users.length, reports: reports.length };
  }
}

export const db = new MongoDatabaseService();