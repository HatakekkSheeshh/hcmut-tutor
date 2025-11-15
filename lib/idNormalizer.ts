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
      const user = await storage.findById('users.json', userId);
      if (user && (user as any).id) {
        // Return custom ID from user document
        return (user as any).id;
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

