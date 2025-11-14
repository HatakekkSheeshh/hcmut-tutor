/**
 * Migration Script: JSON Files to MongoDB
 * 
 * This script migrates all data from JSON files to MongoDB collections.
 * Run this after setting up MongoDB connection.
 * 
 * Usage:
 *   MONGODB_URI="mongodb://..." npm run migrate:mongodb
 */

import { readFile } from 'fs/promises';
import { join } from 'path';
import { readdir } from 'fs/promises';
import { connectMongo, closeMongo, getDb } from '../lib/mongodb.js';
import { MongoStorage } from '../lib/mongoStorage.js';

const DATA_DIR = join(process.cwd(), 'data');

/**
 * Get collection name from filename
 */
function getCollectionName(filename: string): string {
  return filename.replace(/\.json$/, '').replace(/-/g, '_');
}

/**
 * Migrate a single JSON file to MongoDB
 */
async function migrateFile(filename: string, mongoStorage: MongoStorage): Promise<void> {
  try {
    const filepath = join(DATA_DIR, filename);
    const content = await readFile(filepath, 'utf-8');
    
    if (!content || content.trim() === '') {
      console.log(`⏭️  Skipping empty file: ${filename}`);
      return;
    }
    
    const data = JSON.parse(content);
    
    if (!Array.isArray(data)) {
      console.log(`⚠️  Skipping ${filename}: not an array`);
      return;
    }
    
    if (data.length === 0) {
      console.log(`⏭️  Skipping empty array: ${filename}`);
      return;
    }
    
    // Check if collection already has data
    const existing = await mongoStorage.read(filename);
    if (existing.length > 0) {
      console.log(`⚠️  Collection ${getCollectionName(filename)} already has ${existing.length} documents. Skipping...`);
      console.log(`   Use --force to overwrite or manually clear the collection first.`);
      return;
    }
    
    // Migrate data
    console.log(`📦 Migrating ${filename} (${data.length} items)...`);
    
    if (data.length > 1000) {
      // Batch insert for large files
      const batchSize = 1000;
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        await mongoStorage.createMany(filename, batch);
        console.log(`   ✓ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(data.length / batchSize)}`);
      }
    } else {
      await mongoStorage.createMany(filename, data);
    }
    
    // Verify migration
    const migrated = await mongoStorage.read(filename);
    if (migrated.length === data.length) {
      console.log(`✅ Successfully migrated ${filename}: ${migrated.length} items`);
    } else {
      console.log(`⚠️  Warning: ${filename} - expected ${data.length}, got ${migrated.length}`);
    }
  } catch (error: any) {
    console.error(`❌ Error migrating ${filename}:`, error.message);
    throw error;
  }
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('🚀 Starting migration from JSON files to MongoDB...\n');
  
  // Check MongoDB connection
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable is not set!');
    console.error('   Set it before running migration:');
    console.error('   MONGODB_URI="mongodb://..." npm run migrate:mongodb');
    process.exit(1);
  }
  
  try {
    // Connect to MongoDB
    await connectMongo();
    const db = await getDb();
    console.log(`✅ Connected to MongoDB: ${db.databaseName}\n`);
    
    // Get all JSON files
    const files = (await readdir(DATA_DIR))
      .filter(file => file.endsWith('.json'))
      .sort();
    
    if (files.length === 0) {
      console.log('⚠️  No JSON files found in data/ directory');
      return;
    }
    
    console.log(`📁 Found ${files.length} JSON files to migrate:\n`);
    
    const mongoStorage = new MongoStorage();
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    
    // Migrate each file
    for (const file of files) {
      try {
        await migrateFile(file, mongoStorage);
        successCount++;
      } catch (error: any) {
        console.error(`❌ Failed to migrate ${file}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Success: ${successCount} files`);
    console.log(`   ⏭️  Skipped: ${skipCount} files`);
    console.log(`   ❌ Errors: ${errorCount} files`);
    console.log(`   📁 Total: ${files.length} files\n`);
    
    if (errorCount === 0) {
      console.log('🎉 Migration completed successfully!');
      console.log('\n💡 Next steps:');
      console.log('   1. Verify data in MongoDB');
      console.log('   2. Update environment variables to use MONGODB_URI');
      console.log('   3. Restart your application');
    } else {
      console.log('⚠️  Migration completed with errors. Please review the output above.');
    }
  } catch (error: any) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await closeMongo();
  }
}

// Run migration
migrate().catch(console.error);

