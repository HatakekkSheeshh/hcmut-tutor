/**
 * Export MongoDB collections to JSON files
 * This script exports data from MongoDB back to JSON files for backup/reference
 */

import 'dotenv/config';
import { connectMongo, getDb } from '../lib/mongodb.js';
import { writeFile } from 'fs/promises';
import { join } from 'path';

async function exportCollectionToJSON(collectionName: string, outputFile: string) {
  try {
    const db = await getDb();
    const collection = db.collection(collectionName);
    
    // Get all documents
    const documents = await collection.find({}).toArray();
    
    // Convert MongoDB documents back to JSON format (remove _id, keep id)
    const jsonData = documents.map((doc: any) => {
      const { _id, ...rest } = doc;
      // Keep original id if exists, otherwise use _id as string
      return {
        ...rest,
        id: rest.id || _id?.toString() || _id
      };
    });
    
    // Write to JSON file
    const filepath = join(process.cwd(), 'data', outputFile);
    await writeFile(filepath, JSON.stringify(jsonData, null, 2), 'utf-8');
    
    console.log(`✅ Exported ${jsonData.length} documents from ${collectionName} to ${outputFile}`);
    return jsonData.length;
  } catch (error: any) {
    console.error(`❌ Error exporting ${collectionName}:`, error.message);
    throw error;
  }
}

async function exportAll() {
  try {
    console.log('🚀 Starting MongoDB to JSON export...\n');
    
    // Check MongoDB connection
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI environment variable is not set!');
      process.exit(1);
    }
    
    await connectMongo();
    console.log('✅ Connected to MongoDB\n');
    
    // Export library materials
    const libraryMaterialsCount = await exportCollectionToJSON('library_materials', 'library-materials.json');
    
    console.log(`\n📊 Export Summary:`);
    console.log(`   - library-materials.json: ${libraryMaterialsCount} materials`);
    console.log(`\n✅ Export completed successfully!`);
    
  } catch (error: any) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  }
}

// Run export
exportAll();

