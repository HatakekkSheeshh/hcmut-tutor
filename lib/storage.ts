import { put, list, del } from '@vercel/blob';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

/**
 * JSONStorage - Quản lý việc đọc/ghi JSON files
 * Hỗ trợ cả Vercel Blob Storage và local file system
 */
export class JSONStorage {
  private useBlob: boolean;
  private dataDir: string;

  constructor(useBlob = false) {
    this.useBlob = useBlob && !!process.env.BLOB_READ_WRITE_TOKEN;
    this.dataDir = join(process.cwd(), 'data');
  }

  /**
   * Đọc dữ liệu từ JSON file
   */
  async read<T = any>(filename: string): Promise<T[]> {
    try {
      if (this.useBlob) {
        return await this.readFromBlob(filename);
      } else {
        return await this.readFromLocal(filename);
      }
    } catch (error) {
      console.error(`Error reading ${filename}:`, error);
      return [];
    }
  }

  /**
   * Ghi dữ liệu vào JSON file
   */
  async write<T = any>(filename: string, data: T[]): Promise<void> {
    try {
      if (this.useBlob) {
        await this.writeToBlob(filename, data);
      } else {
        await this.writeToLocal(filename, data);
      }
    } catch (error) {
      console.error(`Error writing ${filename}:`, error);
      throw error;
    }
  }

  /**
   * Tìm một item theo ID
   */
  async findById<T extends { id: string }>(
    filename: string,
    id: string
  ): Promise<T | null> {
    const data = await this.read<T>(filename);
    return data.find((item) => item.id === id) || null;
  }

  /**
   * Tìm nhiều items theo điều kiện
   */
  async find<T = any>(
    filename: string,
    predicate: (item: T) => boolean
  ): Promise<T[]> {
    const data = await this.read<T>(filename);
    return data.filter(predicate);
  }

  /**
   * Thêm một item mới
   */
  async create<T extends { id: string }>(
    filename: string,
    item: T
  ): Promise<T> {
    const data = await this.read<T>(filename);
    
    // Kiểm tra duplicate ID
    if (data.some((existing) => existing.id === item.id)) {
      throw new Error(`Item with ID ${item.id} already exists`);
    }

    data.push(item);
    await this.write(filename, data);
    return item;
  }

  /**
   * Cập nhật một item theo ID
   */
  async update<T extends { id: string }>(
    filename: string,
    id: string,
    updates: Partial<T>
  ): Promise<T | null> {
    const data = await this.read<T>(filename);
    const index = data.findIndex((item) => item.id === id);

    if (index === -1) {
      return null;
    }

    data[index] = { ...data[index], ...updates, id }; // Preserve ID
    await this.write(filename, data);
    return data[index];
  }

  /**
   * Xóa một item theo ID
   */
  async delete<T extends { id: string }>(
    filename: string,
    id: string
  ): Promise<boolean> {
    const data = await this.read<T>(filename);
    const initialLength = data.length;
    const filtered = data.filter((item) => item.id !== id);

    if (filtered.length === initialLength) {
      return false; // Not found
    }

    await this.write(filename, filtered);
    return true;
  }

  /**
   * Xóa nhiều items theo điều kiện
   */
  async deleteMany<T = any>(
    filename: string,
    predicate: (item: T) => boolean
  ): Promise<number> {
    const data = await this.read<T>(filename);
    const initialLength = data.length;
    const filtered = data.filter((item) => !predicate(item));
    const deletedCount = initialLength - filtered.length;

    if (deletedCount > 0) {
      await this.write(filename, filtered);
    }

    return deletedCount;
  }

  /**
   * Đếm số lượng items
   */
  async count<T = any>(
    filename: string,
    predicate?: (item: T) => boolean
  ): Promise<number> {
    const data = await this.read<T>(filename);
    return predicate ? data.filter(predicate).length : data.length;
  }

  /**
   * Phân trang dữ liệu
   */
  async paginate<T = any>(
    filename: string,
    page: number = 1,
    limit: number = 10,
    predicate?: (item: T) => boolean
  ): Promise<{
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    let data = await this.read<T>(filename);
    
    if (predicate) {
      data = data.filter(predicate);
    }

    const total = data.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedData = data.slice(start, end);

    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  }

  // ===== PRIVATE METHODS =====

  private async readFromLocal<T>(filename: string): Promise<T[]> {
    const filepath = join(this.dataDir, filename);
    try {
      const content = await readFile(filepath, 'utf-8');
      return JSON.parse(content);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, return empty array
        return [];
      }
      throw error;
    }
  }

  private async writeToLocal<T>(filename: string, data: T[]): Promise<void> {
    const filepath = join(this.dataDir, filename);
    await writeFile(filepath, JSON.stringify(data, null, 2), 'utf-8');
  }

  private async readFromBlob<T>(filename: string): Promise<T[]> {
    try {
      // Try to find the file with data/ prefix first, then without
      let { blobs } = await list({ prefix: `data/${filename}` });
      if (blobs.length === 0) {
        // Try without prefix if not found in data/
        const { blobs: rootBlobs } = await list({ prefix: filename });
        blobs = rootBlobs;
      }
      
      if (blobs.length === 0) {
        console.warn(`No blobs found for ${filename}`);
        return [];
      }
      
      // Fetch the blob content
      const response = await fetch(blobs[0].url);
      const content = await response.text();
      return JSON.parse(content);
    } catch (error) {
      console.error(`Blob read error for ${filename}:`, error);
      return [];
    }
  }

  private async writeToBlob<T>(filename: string, data: T[]): Promise<void> {
    const content = JSON.stringify(data, null, 2);
    await put(`data/${filename}`, content, {
      access: 'public',
      addRandomSuffix: false
    });
  }

  /**
   * List all JSON files
   */
  async listFiles(): Promise<string[]> {
    if (this.useBlob) {
      const { blobs } = await list({ prefix: 'data/' });
      return blobs.map((blob) => blob.pathname.replace('data/', ''));
    } else {
      // Local file listing would go here
      return [];
    }
  }

  /**
   * Delete a JSON file completely
   */
  async deleteFile(filename: string): Promise<void> {
    if (this.useBlob) {
      await del(`data/${filename}`);
    } else {
      const filepath = join(this.dataDir, filename);
      await writeFile(filepath, '[]', 'utf-8');
    }
  }
}

// Singleton instance - auto-detect if we should use Blob based on environment
export const storage = new JSONStorage(
  process.env.NODE_ENV === 'production' && !!process.env.BLOB_READ_WRITE_TOKEN
);

// Helper functions for common operations
export const createRecord = <T extends { id: string }>(
  filename: string,
  data: T
) => storage.create(filename, data);

export const findRecord = <T extends { id: string }>(
  filename: string,
  id: string
) => storage.findById<T>(filename, id);

export const updateRecord = <T extends { id: string }>(
  filename: string,
  id: string,
  updates: Partial<T>
) => storage.update(filename, id, updates);

export const deleteRecord = <T extends { id: string }>(
  filename: string,
  id: string
) => storage.delete(filename, id);

export const getAllRecords = <T = any>(filename: string) =>
  storage.read<T>(filename);

export const queryRecords = <T = any>(
  filename: string,
  predicate: (item: T) => boolean
) => storage.find<T>(filename, predicate);

