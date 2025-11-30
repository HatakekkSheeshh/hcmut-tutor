/**
 * PDF Storage Service
 * Handles PDF upload and retrieval using MongoDB GridFS
 */

import { getDb } from '../mongodb.js'
import { GridFSBucket, ObjectId } from 'mongodb'
import { now } from '../utils.js'

const BUCKET_NAME = 'pdfs'

/**
 * Upload PDF to MongoDB GridFS
 */
export async function uploadPDF(
  buffer: Buffer,
  filename: string,
  metadata: {
    title: string
    description?: string
    subject?: string
    tags?: string[]
    author?: string
    uploadedBy?: string
  }
): Promise<{ success: boolean; fileId?: string; error?: string }> {
  try {
    const db = await getDb()
    const bucket = new GridFSBucket(db, { bucketName: BUCKET_NAME })

    // Let GridFS generate the ID automatically to avoid conflicts
    const uploadStream = bucket.openUploadStream(filename, {
      metadata: {
        ...metadata,
        uploadedAt: now(),
        contentType: 'application/pdf'
      }
    })

    return new Promise((resolve, reject) => {
      uploadStream.on('error', (error) => {
        console.error('PDF upload error:', error)
        reject({ success: false, error: error.message })
      })

      uploadStream.on('finish', async () => {
        // Get the actual ID that GridFS assigned to the file
        const actualFileId = uploadStream.id.toString()
        console.log('✅ PDF uploaded successfully:', {
          actualFileId: actualFileId,
          filename,
          metadata
        })
        
        // Verify the file exists with the actual ID by querying GridFS
        try {
          const verifyFiles = await bucket.find({ _id: new ObjectId(actualFileId) }).toArray()
          if (verifyFiles.length === 0) {
            // If not found with actual ID, try to find by filename and metadata
            console.warn('⚠️  File not found with actual ID, searching by filename...')
            const foundFiles = await bucket.find({ 
              filename: filename,
              'metadata.title': metadata.title 
            }).sort({ uploadDate: -1 }).limit(1).toArray()
            
            if (foundFiles.length > 0) {
              const verifiedId = foundFiles[0]._id.toString()
              console.log('✅ Found file by filename, using ID:', verifiedId)
              resolve({
                success: true,
                fileId: verifiedId
              })
              return
            }
            
            console.error('❌ File not found even after searching by filename')
            reject({ success: false, error: 'File uploaded but not found in GridFS' })
            return
          }
          
          console.log('✅ Verified file exists in GridFS with ID:', actualFileId)
          resolve({
            success: true,
            fileId: actualFileId
          })
        } catch (verifyError: any) {
          console.error('❌ Error verifying uploaded file:', verifyError)
          // Still resolve with the ID from stream, as it might work
          resolve({
            success: true,
            fileId: actualFileId
          })
        }
      })

      uploadStream.end(buffer)
    })
  } catch (error: any) {
    console.error('uploadPDF error:', error)
    return { success: false, error: error.message || 'Failed to upload PDF' }
  }
}

/**
 * Get PDF from MongoDB GridFS
 */
export async function getPDF(fileId: string): Promise<{
  success: boolean
  buffer?: Buffer
  metadata?: any
  filename?: string
  error?: string
}> {
  try {
    // Validate ObjectId format
    if (!ObjectId.isValid(fileId)) {
      console.error('Invalid ObjectId format:', fileId)
      return { success: false, error: 'Invalid PDF ID format' }
    }

    const db = await getDb()
    const bucket = new GridFSBucket(db, { bucketName: BUCKET_NAME })

    console.log('🔍 Looking for PDF with ID:', fileId)
    
    // Check if file exists
    const files = await bucket.find({ _id: new ObjectId(fileId) }).toArray()
    console.log('📄 Found files:', files.length)
    
    if (files.length === 0) {
      // Try to find any files to debug
      const allFiles = await bucket.find({}).limit(5).toArray()
      console.log('📚 Sample files in bucket:', allFiles.map(f => ({ id: f._id.toString(), filename: f.filename })))
      return { success: false, error: `PDF not found with ID: ${fileId}` }
    }

    const file = files[0]
    console.log('✅ Found PDF:', { id: file._id.toString(), filename: file.filename, length: file.length })
    
    const downloadStream = bucket.openDownloadStream(new ObjectId(fileId))

    // Read file into buffer
    const chunks: Buffer[] = []
    return new Promise((resolve, reject) => {
      downloadStream.on('data', (chunk) => {
        chunks.push(chunk)
      })

      downloadStream.on('error', (error) => {
        console.error('PDF download error:', error)
        reject({ success: false, error: error.message })
      })

      downloadStream.on('end', () => {
        resolve({
          success: true,
          buffer: Buffer.concat(chunks),
          metadata: file.metadata,
          filename: file.filename
        })
      })
    })
  } catch (error: any) {
    console.error('getPDF error:', error)
    return { success: false, error: error.message || 'Failed to get PDF' }
  }
}

/**
 * Delete PDF from MongoDB GridFS
 */
export async function deletePDF(fileId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await getDb()
    const bucket = new GridFSBucket(db, { bucketName: BUCKET_NAME })

    await bucket.delete(new ObjectId(fileId))
    return { success: true }
  } catch (error: any) {
    console.error('deletePDF error:', error)
    return { success: false, error: error.message || 'Failed to delete PDF' }
  }
}

