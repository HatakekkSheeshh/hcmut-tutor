/**
 * Document Manager Service
 * Handles document management and sharing logic
 */

import { storage } from '../storage.js';
import { config } from '../config.js';
import { 
  Document,
  DocumentPermission,
  DocumentSharing,
  DocumentActivity,
  User
} from '../types.js';
import { now, generateId } from '../utils.js';

/**
 * Validate file type and size
 */
export function validateFile(fileType: string, fileSize: number): { valid: boolean; error?: string } {
  // Check file size
  if (fileSize > config.documents.maxFileSize) {
    return {
      valid: false,
      error: `File size ${(fileSize / 1024 / 1024).toFixed(2)}MB exceeds maximum ${(config.documents.maxFileSize / 1024 / 1024).toFixed(2)}MB`
    };
  }

  // Check file type
  if (!config.documents.allowedTypes.includes(fileType)) {
    return {
      valid: false,
      error: `File type ${fileType} is not allowed. Allowed types: ${config.documents.allowedTypes.join(', ')}`
    };
  }

  return { valid: true };
}

/**
 * Create document
 */
export async function createDocument(
  title: string,
  fileName: string,
  fileUrl: string,
  fileSize: number,
  fileType: string,
  uploadedBy: string,
  options?: {
    description?: string;
    category?: 'academic' | 'administrative' | 'reference' | 'other';
    subject?: string;
    tags?: string[];
    isPublic?: boolean;
    isEncrypted?: boolean;
    accessLevel?: 'public' | 'private' | 'restricted';
    metadata?: {
      author?: string;
      version?: string;
      language?: string;
      pages?: number;
    };
  }
): Promise<Document> {
  // Validate file
  const validation = validateFile(fileType, fileSize);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Create document
  const document: Document = {
    id: generateId('doc'),
    title,
    description: options?.description,
    fileName,
    fileUrl,
    fileSize,
    fileType,
    category: options?.category || 'other',
    subject: options?.subject,
    tags: options?.tags || [],
    uploadedBy,
    uploadedAt: now(),
    updatedAt: now(),
    isPublic: options?.isPublic || false,
    isEncrypted: options?.isEncrypted || config.documents.requireEncryption,
    accessLevel: options?.accessLevel || config.documents.defaultAccessLevel,
    downloadCount: 0,
    viewCount: 0,
    metadata: options?.metadata
  };

  // Save document
  await storage.create<Document>('documents.json', document);

  // Log activity
  await logDocumentActivity(document.id, uploadedBy, 'upload', {
    fileName,
    fileSize,
    fileType
  });

  return document;
}

/**
 * Update document
 */
export async function updateDocument(
  documentId: string,
  updates: {
    title?: string;
    description?: string;
    category?: 'academic' | 'administrative' | 'reference' | 'other';
    subject?: string;
    tags?: string[];
    isPublic?: boolean;
    accessLevel?: 'public' | 'private' | 'restricted';
    metadata?: {
      author?: string;
      version?: string;
      language?: string;
      pages?: number;
    };
  }
): Promise<Document> {
  const document = await storage.findById<Document>('documents.json', documentId);
  if (!document) {
    throw new Error('Document not found');
  }

  // Update document
  const updatedDocument = await storage.update<Document>('documents.json', documentId, {
    ...updates,
    updatedAt: now()
  });

  // Log activity
  await logDocumentActivity(documentId, document.uploadedBy, 'update', updates);

  return updatedDocument;
}

/**
 * Delete document
 */
export async function deleteDocument(documentId: string, userId: string): Promise<void> {
  const document = await storage.findById<Document>('documents.json', documentId);
  if (!document) {
    throw new Error('Document not found');
  }

  // Check permissions
  const hasPermission = await checkDocumentPermission(documentId, userId, 'delete');
  if (!hasPermission) {
    throw new Error('You do not have permission to delete this document');
  }

  // Delete document
  await storage.delete('documents.json', documentId);

  // Delete permissions
  const permissions = await storage.find<DocumentPermission>('document-permissions.json',
    (p) => p.documentId === documentId
  );
  for (const permission of permissions) {
    await storage.delete('document-permissions.json', permission.id);
  }

  // Log activity
  await logDocumentActivity(documentId, userId, 'delete', {
    fileName: document.fileName
  });
}

/**
 * Share document
 */
export async function shareDocument(
  documentId: string,
  sharedBy: string,
  sharedWith: string[],
  options?: {
    message?: string;
    expiresAt?: string;
    accessLevel?: 'read' | 'write' | 'delete';
  }
): Promise<DocumentSharing> {
  const document = await storage.findById<Document>('documents.json', documentId);
  if (!document) {
    throw new Error('Document not found');
  }

  // Check permissions
  const hasPermission = await checkDocumentPermission(documentId, sharedBy, 'share');
  if (!hasPermission) {
    throw new Error('You do not have permission to share this document');
  }

  // Create sharing record
  const sharing: DocumentSharing = {
    id: generateId('share'),
    documentId,
    sharedBy,
    sharedWith,
    sharedAt: now(),
    message: options?.message,
    expiresAt: options?.expiresAt,
    accessLevel: options?.accessLevel || 'read'
  };

  // Save sharing
  await storage.create<DocumentSharing>('document-sharing.json', sharing);

  // Create permissions for each user
  for (const userId of sharedWith) {
    const permission: DocumentPermission = {
      id: generateId('perm'),
      documentId,
      userId,
      permission: options?.accessLevel || 'read',
      grantedBy: sharedBy,
      grantedAt: now(),
      expiresAt: options?.expiresAt,
      isTemporary: !!options?.expiresAt
    };

    await storage.create<DocumentPermission>('document-permissions.json', permission);
  }

  // Log activity
  await logDocumentActivity(documentId, sharedBy, 'share', {
    sharedWith: sharedWith.length,
    accessLevel: options?.accessLevel || 'read'
  });

  return sharing;
}

/**
 * Check document permission
 */
export async function checkDocumentPermission(
  documentId: string,
  userId: string,
  permission: 'read' | 'write' | 'delete' | 'share'
): Promise<boolean> {
  const document = await storage.findById<Document>('documents.json', documentId);
  if (!document) {
    return false;
  }

  // Owner has all permissions
  if (document.uploadedBy === userId) {
    return true;
  }

  // Public documents are readable by all
  if (document.isPublic && permission === 'read') {
    return true;
  }

  // Check explicit permissions
  const permissions = await storage.find<DocumentPermission>('document-permissions.json',
    (p) => p.documentId === documentId && p.userId === userId
  );

  // Check if permission exists and is not expired
  for (const perm of permissions) {
    if (perm.expiresAt && new Date(perm.expiresAt) < new Date()) {
      continue; // Expired
    }

    // Check permission level
    if (permission === 'read' && ['read', 'write', 'delete', 'share'].includes(perm.permission)) {
      return true;
    }
    if (permission === 'write' && ['write', 'delete', 'share'].includes(perm.permission)) {
      return true;
    }
    if (permission === 'delete' && ['delete', 'share'].includes(perm.permission)) {
      return true;
    }
    if (permission === 'share' && perm.permission === 'share') {
      return true;
    }
  }

  return false;
}

/**
 * Get document permissions
 */
export async function getDocumentPermissions(documentId: string): Promise<DocumentPermission[]> {
  const permissions = await storage.find<DocumentPermission>('document-permissions.json',
    (p) => p.documentId === documentId
  );

  // Filter out expired permissions
  return permissions.filter(p => {
    if (p.expiresAt) {
      return new Date(p.expiresAt) >= new Date();
    }
    return true;
  });
}

/**
 * Update document access
 */
export async function updateDocumentAccess(
  documentId: string,
  userId: string,
  permission: 'read' | 'write' | 'delete' | 'share',
  updatedBy: string,
  expiresAt?: string
): Promise<DocumentPermission> {
  const document = await storage.findById<Document>('documents.json', documentId);
  if (!document) {
    throw new Error('Document not found');
  }

  // Check if updater has share permission
  const hasPermission = await checkDocumentPermission(documentId, updatedBy, 'share');
  if (!hasPermission) {
    throw new Error('You do not have permission to update access for this document');
  }

  // Find existing permission
  const existingPermissions = await storage.find<DocumentPermission>('document-permissions.json',
    (p) => p.documentId === documentId && p.userId === userId
  );

  if (existingPermissions.length > 0) {
    // Update existing permission
    const existing = existingPermissions[0];
    const updated = await storage.update<DocumentPermission>('document-permissions.json', existing.id, {
      permission,
      expiresAt,
      isTemporary: !!expiresAt
    });
    return updated;
  } else {
    // Create new permission
    const newPermission: DocumentPermission = {
      id: generateId('perm'),
      documentId,
      userId,
      permission,
      grantedBy: updatedBy,
      grantedAt: now(),
      expiresAt,
      isTemporary: !!expiresAt
    };

    await storage.create<DocumentPermission>('document-permissions.json', newPermission);
    return newPermission;
  }
}

/**
 * Log document activity
 */
async function logDocumentActivity(
  documentId: string,
  userId: string,
  action: 'view' | 'download' | 'upload' | 'update' | 'delete' | 'share' | 'revoke_access',
  metadata?: any
): Promise<void> {
  const activity: DocumentActivity = {
    id: generateId('activity'),
    documentId,
    userId,
    action,
    timestamp: now(),
    metadata
  };

  await storage.create<DocumentActivity>('document-activities.json', activity);
}

/**
 * Record document view
 */
export async function recordDocumentView(documentId: string, userId: string): Promise<void> {
  const document = await storage.findById<Document>('documents.json', documentId);
  if (!document) {
    return;
  }

  // Check permission
  const hasPermission = await checkDocumentPermission(documentId, userId, 'read');
  if (!hasPermission) {
    throw new Error('You do not have permission to view this document');
  }

  // Update view count
  await storage.update<Document>('documents.json', documentId, {
    viewCount: document.viewCount + 1,
    updatedAt: now()
  });

  // Log activity
  await logDocumentActivity(documentId, userId, 'view');
}

/**
 * Record document download
 */
export async function recordDocumentDownload(documentId: string, userId: string): Promise<void> {
  const document = await storage.findById<Document>('documents.json', documentId);
  if (!document) {
    return;
  }

  // Check permission
  const hasPermission = await checkDocumentPermission(documentId, userId, 'read');
  if (!hasPermission) {
    throw new Error('You do not have permission to download this document');
  }

  // Update download count
  await storage.update<Document>('documents.json', documentId, {
    downloadCount: document.downloadCount + 1,
    updatedAt: now()
  });

  // Log activity
  await logDocumentActivity(documentId, userId, 'download');
}

