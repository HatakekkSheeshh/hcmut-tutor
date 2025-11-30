/**
 * Script to fix PDF IDs in library materials
 * This script will:
 * 1. Find all materials with pdfFileId
 * 2. Check if the PDF exists in GridFS
 * 3. If not found, try to find the correct PDF by filename
 * 4. Update the material with the correct pdfFileId
 */

import { connectMongo, closeMongo, getDb } from '../lib/mongodb.js'
import { GridFSBucket, ObjectId } from 'mongodb'
import { MongoStorage } from '../lib/mongoStorage.js'
import { config } from '../lib/config.js'

const MATERIALS_FILE = 'library-materials.json'
const BUCKET_NAME = 'pdfs'

async function fixPDFIds() {
  if (!config.mongodb.enabled) {
    console.log('❌ MongoDB is not enabled. This script requires MongoDB.')
    return
  }

  try {
    await connectMongo()
    console.log('✅ Connected to MongoDB\n')

    const storage = new MongoStorage()
    const db = await getDb()
    const bucket = new GridFSBucket(db, { bucketName: BUCKET_NAME })

    // Get all materials
    const materials = await storage.read(MATERIALS_FILE)
    console.log(`📚 Found ${materials.length} materials\n`)

    let fixed = 0
    let notFound = 0
    let alreadyCorrect = 0

    for (const material of materials) {
      if (!material.pdfFileId && !material.url?.includes('/preview/')) {
        continue // Skip materials without PDF
      }

      const pdfId = material.pdfFileId || material.url?.split('/preview/')[1]?.split('?')[0]
      
      if (!pdfId) {
        continue
      }

      console.log(`\n🔍 Checking material: ${material.title}`)
      console.log(`   Current pdfFileId: ${pdfId}`)

      // Check if PDF exists
      if (!ObjectId.isValid(pdfId)) {
        console.log(`   ❌ Invalid ObjectId format: ${pdfId}`)
        notFound++
        continue
      }

      const files = await bucket.find({ _id: new ObjectId(pdfId) }).toArray()
      
      if (files.length > 0) {
        console.log(`   ✅ PDF found in GridFS`)
        alreadyCorrect++
        continue
      }

      // PDF not found, try to find by filename
      console.log(`   ⚠️  PDF not found, searching by filename...`)
      
      // Try to extract filename from URL or use title
      const searchFilename = material.url?.includes('/preview/') 
        ? null 
        : (material.title ? `${material.title}.pdf` : null)

      if (!searchFilename) {
        // Try to find any PDF uploaded around the same time
        const allFiles = await bucket.find({}).sort({ uploadDate: -1 }).limit(10).toArray()
        console.log(`   📄 Found ${allFiles.length} recent PDFs in GridFS`)
        
        if (allFiles.length > 0) {
          // Use the most recent PDF as a potential match
          const mostRecent = allFiles[0]
          console.log(`   💡 Suggesting to use PDF ID: ${mostRecent._id.toString()}`)
          console.log(`      Filename: ${mostRecent.filename}`)
          console.log(`      Uploaded: ${mostRecent.uploadDate}`)
          
          // Ask user or auto-fix (for now, just log)
          // You can uncomment the following to auto-fix:
          /*
          material.pdfFileId = mostRecent._id.toString()
          material.url = `/api/library/preview/${mostRecent._id.toString()}`
          await storage.update(MATERIALS_FILE, material.id, material)
          console.log(`   ✅ Updated material with correct PDF ID`)
          fixed++
          */
        } else {
          console.log(`   ❌ No PDFs found in GridFS`)
          notFound++
        }
      } else {
        // Search by filename
        const filesByFilename = await bucket.find({ filename: searchFilename }).toArray()
        if (filesByFilename.length > 0) {
          const correctFile = filesByFilename[0]
          material.pdfFileId = correctFile._id.toString()
          material.url = `/api/library/preview/${correctFile._id.toString()}`
          await storage.update(MATERIALS_FILE, material.id, material)
          console.log(`   ✅ Fixed! Updated to PDF ID: ${correctFile._id.toString()}`)
          fixed++
        } else {
          console.log(`   ❌ No PDF found with filename: ${searchFilename}`)
          notFound++
        }
      }
    }

    console.log(`\n\n📊 Summary:`)
    console.log(`   ✅ Already correct: ${alreadyCorrect}`)
    console.log(`   🔧 Fixed: ${fixed}`)
    console.log(`   ❌ Not found: ${notFound}`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await closeMongo()
  }
}

fixPDFIds().catch(console.error)

