/**
 * ID Normalizer Utility
 * Converts between MongoDB ObjectId and custom ID formats
 * 
 * Problem: Frontend may send ObjectId, but data uses custom IDs
 * Solution: Normalize IDs before querying
 */

import { storage } from './storage.js';
import { ObjectId } from 'mongodb';

/**
 * Normalize an ID to custom format
 * If ID is ObjectId, find user and return custom ID
 * If ID is already custom format, return as is
 */
export async function normalizeUserId(userId: string): Promise<string> {
  // If already custom format (has prefix), return as is
  if (userId.includes('_') && !ObjectId.isValid(userId)) {
    return userId;
  }

  // If ObjectId format, try to find user and get custom ID
  if (ObjectId.isValid(userId) && userId.length === 24) {
    try {
      // Try to find by _id (ObjectId) first
      const user = await storage.findById('users.json', userId);
      if (user) {
        const userAny = user as any;
        // Check if user has custom id field (prefer custom ID)
        if (userAny.id && userAny.id.includes('_')) {
          // Custom ID found (e.g., "stu_xxx")
          return userAny.id;
        }
        // If no custom ID, check if the id field is the ObjectId itself
        // In this case, we need to find the user by _id and check the original id field
        // But since we already found it, let's check if there's a different id in MongoDB
        // Actually, MongoDB stores both _id and id, so we should have the custom id
        // If we don't have it, it means the migration didn't preserve it properly
        console.warn(`[ID Normalizer] User ${userId} found but no custom ID field. Using ObjectId as-is.`);
        return userId;
      }
    } catch (error) {
      console.warn(`[ID Normalizer] Could not find user with ObjectId ${userId}, using as-is`);
    }
  }

  // Fallback: return original ID
  return userId;
}

/**
 * Normalize multiple user IDs
 */
export async function normalizeUserIds(userIds: string[]): Promise<string[]> {
  if (userIds.length === 0) return [];
  
  const normalized = await Promise.all(
    userIds.map(id => normalizeUserId(id))
  );
  
  return normalized;
}

/**
 * Check if an ID is ObjectId format
 */
export function isObjectId(id: string): boolean {
  return ObjectId.isValid(id) && id.length === 24;
}

/**
 * Check if an ID is custom format (has prefix)
 */
export function isCustomId(id: string): boolean {
  return id.includes('_') && !isObjectId(id);
}

