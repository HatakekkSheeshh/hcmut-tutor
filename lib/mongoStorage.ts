/**
 * MongoDB Storage Adapter
 * Implements the same interface as JSONStorage but uses MongoDB
 */

import { Collection, ObjectId, Filter, UpdateFilter } from 'mongodb';
import { getCollection } from './mongodb.js';

/**
 * MongoDB Storage - Quản lý việc đọc/ghi từ MongoDB
 * Tương thích với interface của JSONStorage
 */
export class MongoStorage {
  /**
   * Map filename (JSON file name) to collection name
   * Converts 'users.json' -> 'users', 'forum-posts.json' -> 'forum_posts'
   */
  private getCollectionName(filename: string): string {
    // Remove .json extension and replace hyphens with underscores
    return filename.replace(/\.json$/, '').replace(/-/g, '_');
  }

  /**
   * Get collection instance
   */
  private async getCollection<T = any>(filename: string): Promise<Collection<T>> {
    const collectionName = this.getCollectionName(filename);
    return await getCollection<T>(collectionName);
  }

  /**
   * Đọc dữ liệu từ MongoDB collection
   */
  async read<T = any>(filename: string): Promise<T[]> {
    try {
      const collection = await this.getCollection<T>(filename);
      const documents = await collection.find({}).toArray();
      
      // Convert _id to id for compatibility
      return documents.map(doc => {
        const { _id, ...rest } = doc as any;
        return { ...rest, id: _id?.toString() || rest.id } as T;
      });
    } catch (error: any) {
      console.error(`Error reading ${filename} from MongoDB:`, error.message || error);
      return [];
    }
  }

  /**
   * Ghi dữ liệu vào MongoDB collection
   */
  async write<T = any>(filename: string, data: T[]): Promise<void> {
    try {
      const collection = await this.getCollection<T>(filename);
      
      // Clear existing data and insert new data
      await collection.deleteMany({});
      
      if (data.length > 0) {
        // Convert id to _id for MongoDB
        const documents = data.map(item => {
          const { id, ...rest } = item as any;
          return {
            ...rest,
            _id: id ? new ObjectId(id) : new ObjectId(),
            id: id || undefined // Keep id field for compatibility
          };
        });
        
        await collection.insertMany(documents as any);
      }
    } catch (error) {
      console.error(`Error writing ${filename} to MongoDB:`, error);
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
    try {
      const collection = await this.getCollection<T>(filename);
      
      // Try to find by _id first (MongoDB native)
      let doc = await collection.findOne({ _id: new ObjectId(id) } as any);
      
      // If not found, try by id field
      if (!doc) {
        doc = await collection.findOne({ id } as any);
      }
      
      if (!doc) {
        return null;
      }
      
      const { _id, ...rest } = doc as any;
      return { ...rest, id: _id?.toString() || rest.id } as T;
    } catch (error: any) {
      console.error(`Error finding ${filename} by id ${id}:`, error.message);
      return null;
    }
  }

  /**
   * Tìm nhiều items theo danh sách IDs
   */
  async findByIds<T extends { id: string }>(
    filename: string,
    ids: string[]
  ): Promise<Map<string, T>> {
    if (ids.length === 0) {
      return new Map();
    }
    
    try {
      const collection = await this.getCollection<T>(filename);
      
      // Convert string IDs to ObjectIds where possible
      const objectIds = ids
        .filter(id => ObjectId.isValid(id))
        .map(id => new ObjectId(id));
      
      const stringIds = ids.filter(id => !ObjectId.isValid(id));
      
      // Build query: match by _id OR id field
      const query: any = {
        $or: []
      };
      
      if (objectIds.length > 0) {
        query.$or.push({ _id: { $in: objectIds } });
      }
      
      if (stringIds.length > 0) {
        query.$or.push({ id: { $in: stringIds } });
      }
      
      if (query.$or.length === 0) {
        return new Map();
      }
      
      const documents = await collection.find(query).toArray();
      const result = new Map<string, T>();
      
      for (const doc of documents) {
        const { _id, ...rest } = doc as any;
        const id = _id?.toString() || rest.id;
        if (id) {
          result.set(id, { ...rest, id } as T);
        }
      }
      
      return result;
    } catch (error: any) {
      console.error(`Error finding ${filename} by ids:`, error.message);
      return new Map();
    }
  }

  /**
   * Tìm nhiều items theo điều kiện
   */
  async find<T = any>(
    filename: string,
    predicate: (item: T) => boolean
  ): Promise<T[]> {
    // For complex predicates, we need to load all and filter in memory
    // MongoDB query builder could be added later for optimization
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
    try {
      const collection = await this.getCollection<T>(filename);
      
      // Check if ID already exists
      const existing = await this.findById<T>(filename, item.id);
      if (existing) {
        throw new Error(`Item with ID ${item.id} already exists`);
      }
      
      // Convert id to _id for MongoDB
      const { id, ...rest } = item as any;
      const document = {
        ...rest,
        _id: id ? new ObjectId(id) : new ObjectId(),
        id: id || undefined
      };
      
      await collection.insertOne(document as any);
      return item;
    } catch (error: any) {
      console.error(`Error creating item in ${filename}:`, error.message);
      throw error;
    }
  }

  /**
   * Thêm nhiều items cùng lúc
   */
  async createMany<T extends { id: string }>(
    filename: string,
    items: T[]
  ): Promise<T[]> {
    if (items.length === 0) {
      return [];
    }

    try {
      const collection = await this.getCollection<T>(filename);
      
      // Check for duplicates
      const ids = items.map(item => item.id);
      const existing = await this.findByIds<T>(filename, ids);
      const duplicateIds = ids.filter(id => existing.has(id));
      
      if (duplicateIds.length > 0) {
        throw new Error(`Items with IDs ${duplicateIds.join(', ')} already exist`);
      }
      
      // Convert items to MongoDB documents
      const documents = items.map(item => {
        const { id, ...rest } = item as any;
        return {
          ...rest,
          _id: id ? new ObjectId(id) : new ObjectId(),
          id: id || undefined
        };
      });
      
      await collection.insertMany(documents as any);
      return items;
    } catch (error: any) {
      console.error(`Error creating many items in ${filename}:`, error.message);
      throw error;
    }
  }

  /**
   * Cập nhật một item theo ID
   */
  async update<T extends { id: string }>(
    filename: string,
    id: string,
    updates: Partial<T>
  ): Promise<T | null> {
    try {
      const collection = await this.getCollection<T>(filename);
      
      // Build update filter (exclude id from updates)
      const { id: _, ...updateFields } = updates as any;
      const updateDoc: UpdateFilter<T> = { $set: updateFields as any };
      
      // Try to find and update by _id first
      let result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) } as any,
        updateDoc,
        { returnDocument: 'after' }
      );
      
      // If not found, try by id field
      if (!result) {
        result = await collection.findOneAndUpdate(
          { id } as any,
          updateDoc,
          { returnDocument: 'after' }
        );
      }
      
      if (!result) {
        return null;
      }
      
      const { _id, ...rest } = result as any;
      return { ...rest, id: _id?.toString() || rest.id } as T;
    } catch (error: any) {
      console.error(`Error updating ${filename} id ${id}:`, error.message);
      return null;
    }
  }

  /**
   * Xóa một item theo ID
   */
  async delete<T extends { id: string }>(
    filename: string,
    id: string
  ): Promise<boolean> {
    try {
      const collection = await this.getCollection<T>(filename);
      
      // Try to delete by _id first
      let result = await collection.deleteOne({ _id: new ObjectId(id) } as any);
      
      // If not found, try by id field
      if (result.deletedCount === 0) {
        result = await collection.deleteOne({ id } as any);
      }
      
      return result.deletedCount > 0;
    } catch (error: any) {
      console.error(`Error deleting ${filename} id ${id}:`, error.message);
      return false;
    }
  }

  /**
   * Xóa nhiều items theo điều kiện
   */
  async deleteMany<T = any>(
    filename: string,
    predicate: (item: T) => boolean
  ): Promise<number> {
    // For complex predicates, load all and filter
    const data = await this.read<T>(filename);
    const toDelete = data.filter(predicate);
    
    if (toDelete.length === 0) {
      return 0;
    }
    
    const ids = toDelete.map((item: any) => item.id);
    const collection = await this.getCollection<T>(filename);
    
    // Delete by _id or id field
    const objectIds = ids.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id));
    const stringIds = ids.filter(id => !ObjectId.isValid(id));
    
    let deletedCount = 0;
    
    if (objectIds.length > 0) {
      const result = await collection.deleteMany({ _id: { $in: objectIds } } as any);
      deletedCount += result.deletedCount;
    }
    
    if (stringIds.length > 0) {
      const result = await collection.deleteMany({ id: { $in: stringIds } } as any);
      deletedCount += result.deletedCount;
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
    if (!predicate) {
      const collection = await this.getCollection<T>(filename);
      return await collection.countDocuments({});
    }
    
    // For predicates, load and filter
    const data = await this.read<T>(filename);
    return data.filter(predicate).length;
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

  /**
   * List all collections (for compatibility)
   */
  async listFiles(): Promise<string[]> {
    try {
      const db = await getCollection('_temp').then(c => c.db);
      const collections = await db.listCollections().toArray();
      return collections
        .map(c => c.name)
        .filter(name => !name.startsWith('_'))
        .map(name => name.replace(/_/g, '-') + '.json');
    } catch (error) {
      console.error('Error listing collections:', error);
      return [];
    }
  }

  /**
   * Delete a collection completely
   */
  async deleteFile(filename: string): Promise<void> {
    try {
      const collection = await this.getCollection(filename);
      await collection.drop();
    } catch (error) {
      console.error(`Error deleting collection ${filename}:`, error);
      throw error;
    }
  }
}

