/**
 * Community Manager Service
 * Handles community management logic
 */

import { storage } from '../storage.js';
import { config } from '../config.js';
import { 
  ForumPost,
  CommunityResource,
  CommunityEvent,
  CommunityActivity,
  User,
  UserRole
} from '../types.js';
import { now, generateId } from '../utils.js';

/**
 * Pin forum post
 */
export async function pinForumPost(postId: string, pinnedBy: string): Promise<ForumPost> {
  const post = await storage.findById<ForumPost>('forum-posts.json', postId);
  if (!post) {
    throw new Error('Forum post not found');
  }

  const updatedPost = await storage.update<ForumPost>('forum-posts.json', postId, {
    pinned: true,
    updatedAt: now()
  });

  // Log activity
  await logCommunityActivity('forum_post', pinnedBy, postId, 'forum', 'pin', {
    postTitle: post.title
  });

  return updatedPost;
}

/**
 * Unpin forum post
 */
export async function unpinForumPost(postId: string, unpinnedBy: string): Promise<ForumPost> {
  const post = await storage.findById<ForumPost>('forum-posts.json', postId);
  if (!post) {
    throw new Error('Forum post not found');
  }

  const updatedPost = await storage.update<ForumPost>('forum-posts.json', postId, {
    pinned: false,
    updatedAt: now()
  });

  // Log activity
  await logCommunityActivity('forum_post', unpinnedBy, postId, 'forum', 'unpin', {
    postTitle: post.title
  });

  return updatedPost;
}

/**
 * Lock forum post
 */
export async function lockForumPost(postId: string, lockedBy: string): Promise<ForumPost> {
  const post = await storage.findById<ForumPost>('forum-posts.json', postId);
  if (!post) {
    throw new Error('Forum post not found');
  }

  const updatedPost = await storage.update<ForumPost>('forum-posts.json', postId, {
    locked: true,
    updatedAt: now()
  });

  // Log activity
  await logCommunityActivity('forum_post', lockedBy, postId, 'forum', 'lock', {
    postTitle: post.title
  });

  return updatedPost;
}

/**
 * Unlock forum post
 */
export async function unlockForumPost(postId: string, unlockedBy: string): Promise<ForumPost> {
  const post = await storage.findById<ForumPost>('forum-posts.json', postId);
  if (!post) {
    throw new Error('Forum post not found');
  }

  const updatedPost = await storage.update<ForumPost>('forum-posts.json', postId, {
    locked: false,
    updatedAt: now()
  });

  // Log activity
  await logCommunityActivity('forum_post', unlockedBy, postId, 'forum', 'unlock', {
    postTitle: post.title
  });

  return updatedPost;
}

/**
 * Share community resource
 */
export async function shareCommunityResource(
  title: string,
  sharedBy: string,
  options: {
    description?: string;
    type: 'document' | 'link' | 'video' | 'other';
    url?: string;
    fileUrl?: string;
    thumbnail?: string;
    category: 'academic' | 'administrative' | 'reference' | 'event' | 'other';
    subject?: string;
    tags?: string[];
    isPublic?: boolean;
    isEncrypted?: boolean;
    accessLevel?: 'public' | 'private' | 'restricted';
    restrictedTo?: string[];
    metadata?: {
      author?: string;
      duration?: number;
      language?: string;
    };
  }
): Promise<CommunityResource> {
  // Encrypt if sensitive
  const isEncrypted = options.isEncrypted || (options.accessLevel === 'restricted' && config.documents.requireEncryption);

  const resource: CommunityResource = {
    id: generateId('resource'),
    title,
    description: options.description,
    type: options.type,
    url: options.url,
    fileUrl: options.fileUrl,
    thumbnail: options.thumbnail,
    category: options.category,
    subject: options.subject,
    tags: options.tags || [],
    sharedBy,
    sharedAt: now(),
    isPublic: options.isPublic || false,
    isEncrypted,
    accessLevel: options.accessLevel || 'private',
    restrictedTo: options.restrictedTo,
    downloadCount: 0,
    viewCount: 0,
    likes: [],
    metadata: options.metadata,
    createdAt: now(),
    updatedAt: now()
  };

  // Save resource
  await storage.create<CommunityResource>('community-resources.json', resource);

  // Log activity
  await logCommunityActivity('resource_share', sharedBy, resource.id, 'resource', 'share', {
    resourceTitle: resource.title,
    category: resource.category
  });

  return resource;
}

/**
 * Restrict community resource access
 */
export async function restrictCommunityResource(
  resourceId: string,
  restrictedTo: string[],
  accessLevel: 'public' | 'private' | 'restricted',
  restrictedBy: string
): Promise<CommunityResource> {
  const resource = await storage.findById<CommunityResource>('community-resources.json', resourceId);
  if (!resource) {
    throw new Error('Community resource not found');
  }

  // Encrypt if restricting access
  const isEncrypted = accessLevel === 'restricted' && config.documents.requireEncryption
    ? true
    : resource.isEncrypted;

  const updatedResource = await storage.update<CommunityResource>('community-resources.json', resourceId, {
    restrictedTo,
    accessLevel,
    isEncrypted,
    isPublic: accessLevel === 'public',
    updatedAt: now()
  });

  // Log activity
  await logCommunityActivity('resource_share', restrictedBy, resourceId, 'resource', 'restrict', {
    resourceTitle: resource.title,
    accessLevel,
    restrictedTo: restrictedTo.length
  });

  return updatedResource;
}

/**
 * Create community event
 */
export async function createCommunityEvent(
  title: string,
  description: string,
  type: 'webinar' | 'workshop' | 'meeting' | 'seminar' | 'other',
  organizerId: string,
  startTime: string,
  endTime: string,
  options?: {
    location?: string;
    meetingLink?: string;
    isOnline?: boolean;
    maxParticipants?: number;
    category?: string;
    tags?: string[];
    resources?: string[];
    registrationRequired?: boolean;
    registrationDeadline?: string;
    metadata?: {
      agenda?: string;
      speakers?: string[];
      recordingUrl?: string;
    };
  }
): Promise<CommunityEvent> {
  const event: CommunityEvent = {
    id: generateId('event'),
    title,
    description,
    type,
    organizerId,
    startTime,
    endTime,
    location: options?.location,
    meetingLink: options?.meetingLink,
    isOnline: options?.isOnline !== false,
    maxParticipants: options?.maxParticipants,
    participants: [],
    status: 'scheduled',
    category: options?.category || 'other',
    tags: options?.tags || [],
    resources: options?.resources || [],
    registrationRequired: options?.registrationRequired || false,
    registrationDeadline: options?.registrationDeadline,
    metadata: options?.metadata,
    createdAt: now(),
    updatedAt: now()
  };

  // Save event
  await storage.create<CommunityEvent>('community-events.json', event);

  // Log activity
  await logCommunityActivity('event_create', organizerId, event.id, 'event', 'create', {
    eventTitle: event.title,
    eventType: event.type,
    startTime: event.startTime
  });

  return event;
}

/**
 * Check if user can access community resource
 */
export async function canAccessCommunityResource(
  resourceId: string,
  userId: string
): Promise<boolean> {
  const resource = await storage.findById<CommunityResource>('community-resources.json', resourceId);
  if (!resource) {
    return false;
  }

  // Public resources are accessible to all
  if (resource.isPublic && resource.accessLevel === 'public') {
    return true;
  }

  // Owner can access
  if (resource.sharedBy === userId) {
    return true;
  }

  // Check restrictions
  if (resource.accessLevel === 'restricted' && resource.restrictedTo) {
    // Check if user ID is in restricted list
    if (resource.restrictedTo.includes(userId)) {
      return true;
    }

    // Check if user role is in restricted list
    const user = await storage.findById<User>('users.json', userId);
    if (user && resource.restrictedTo.includes(user.role)) {
      return true;
    }
  }

  // Private resources are only accessible to owner
  if (resource.accessLevel === 'private') {
    return resource.sharedBy === userId;
  }

  return false;
}

/**
 * Record resource view
 */
export async function recordResourceView(resourceId: string, userId: string): Promise<void> {
  const resource = await storage.findById<CommunityResource>('community-resources.json', resourceId);
  if (!resource) {
    return;
  }

  // Check access
  const canAccess = await canAccessCommunityResource(resourceId, userId);
  if (!canAccess) {
    throw new Error('You do not have permission to view this resource');
  }

  // Update view count
  await storage.update<CommunityResource>('community-resources.json', resourceId, {
    viewCount: resource.viewCount + 1,
    updatedAt: now()
  });

  // Log activity
  await logCommunityActivity('resource_view', userId, resourceId, 'resource', 'view', {
    resourceTitle: resource.title
  });
}

/**
 * Record resource download
 */
export async function recordResourceDownload(resourceId: string, userId: string): Promise<void> {
  const resource = await storage.findById<CommunityResource>('community-resources.json', resourceId);
  if (!resource) {
    return;
  }

  // Check access
  const canAccess = await canAccessCommunityResource(resourceId, userId);
  if (!canAccess) {
    throw new Error('You do not have permission to download this resource');
  }

  // Update download count
  await storage.update<CommunityResource>('community-resources.json', resourceId, {
    downloadCount: resource.downloadCount + 1,
    updatedAt: now()
  });

  // Log activity
  await logCommunityActivity('resource_download', userId, resourceId, 'resource', 'download', {
    resourceTitle: resource.title
  });
}

/**
 * Log community activity
 */
async function logCommunityActivity(
  type: 'forum_post' | 'forum_comment' | 'resource_share' | 'event_create' | 'event_join' | 'resource_view' | 'resource_download',
  userId: string,
  entityId: string,
  entityType: 'forum' | 'resource' | 'event',
  action: string,
  metadata?: any
): Promise<void> {
  const activity: CommunityActivity = {
    id: generateId('activity'),
    type,
    userId,
    entityId,
    entityType,
    action,
    timestamp: now(),
    metadata
  };

  await storage.create<CommunityActivity>('community-activities.json', activity);
}

/**
 * Get community activities
 */
export async function getCommunityActivities(
  entityType?: 'forum' | 'resource' | 'event',
  entityId?: string,
  page: number = 1,
  limit: number = 20
): Promise<{
  data: CommunityActivity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  let activities = await storage.read<CommunityActivity>('community-activities.json');

  // Filter by entity type
  if (entityType) {
    activities = activities.filter(a => a.entityType === entityType);
  }

  // Filter by entity ID
  if (entityId) {
    activities = activities.filter(a => a.entityId === entityId);
  }

  // Sort by timestamp (newest first)
  activities.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Pagination
  const total = activities.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedData = activities.slice(start, end);

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

