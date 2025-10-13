import fs from 'fs/promises';
import path from 'path';

export class DataManager {
  private dataDir: string;

  constructor(dataDir = './data') {
    this.dataDir = dataDir;
  }

  async readData<T>(filename: string): Promise<T | null> {
    try {
      const filePath = path.join(this.dataDir, filename);
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${filename}:`, error);
      return null;
    }
  }

  async writeData<T>(filename: string, data: T): Promise<boolean> {
    try {
      const filePath = path.join(this.dataDir, filename);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`Error writing ${filename}:`, error);
      return false;
    }
  }

  async addRecord<T extends { id?: string; createdAt?: string }>(
    filename: string, 
    record: Omit<T, 'id' | 'createdAt'>
  ): Promise<boolean> {
    const data = await this.readData<Record<string, T[]>>(filename);
    if (!data) return false;

    const key = Object.keys(data)[0];
    const id = Date.now().toString();
    const newRecord = {
      ...record,
      id,
      createdAt: new Date().toISOString()
    } as T;

    data[key].push(newRecord);
    return await this.writeData(filename, data);
  }

  async updateRecord<T extends { id: string }>(
    filename: string, 
    id: string, 
    updates: Partial<T>
  ): Promise<boolean> {
    const data = await this.readData<Record<string, T[]>>(filename);
    if (!data) return false;

    const key = Object.keys(data)[0];
    const records = data[key];
    const index = records.findIndex(record => record.id === id);
    
    if (index === -1) return false;

    records[index] = { 
      ...records[index], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    } as T;
    
    return await this.writeData(filename, data);
  }

  async deleteRecord<T extends { id: string }>(
    filename: string, 
    id: string
  ): Promise<boolean> {
    const data = await this.readData<Record<string, T[]>>(filename);
    if (!data) return false;

    const key = Object.keys(data)[0];
    data[key] = data[key].filter(record => record.id !== id);
    return await this.writeData(filename, data);
  }
}

export const dataManager = new DataManager();
