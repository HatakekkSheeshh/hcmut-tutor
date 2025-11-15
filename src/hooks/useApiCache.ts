/**
 * Custom React Query hooks for API caching
 * Provides automatic caching, incremental loading, and smart refetching
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { authAPI, usersAPI, sessionsAPI, enrollmentsAPI, classesAPI, tutorsAPI, studentsAPI, conversationsAPI, forumAPI } from '../lib/api';

// ===== QUERY KEYS =====
// Centralized query keys for easy cache invalidation
export const queryKeys = {
  // Auth
  auth: {
    me: ['auth', 'me'] as const,
  },
  
  // Users
  users: {
    all: ['users'] as const,
    list: (params?: any) => ['users', 'list', params] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
    byIds: (ids: string[]) => ['users', 'byIds', ids.sort().join(',')] as const,
  },
  
  // Sessions
  sessions: {
    all: ['sessions'] as const,
    list: (params?: any) => ['sessions', 'list', params] as const,
    detail: (id: string) => ['sessions', 'detail', id] as const,
    byStudent: (studentId: string, params?: any) => ['sessions', 'student', studentId, params] as const,
    byTutor: (tutorId: string, params?: any) => ['sessions', 'tutor', tutorId, params] as const,
  },
  
  // Enrollments
  enrollments: {
    all: ['enrollments'] as const,
    list: (params?: any) => ['enrollments', 'list', params] as const,
    detail: (id: string) => ['enrollments', 'detail', id] as const,
    byStudent: (studentId: string, params?: any) => ['enrollments', 'student', studentId, params] as const,
  },
  
  // Classes
  classes: {
    all: ['classes'] as const,
    list: (params?: any) => ['classes', 'list', params] as const,
    detail: (id: string) => ['classes', 'detail', id] as const,
    byIds: (ids: string[]) => ['classes', 'byIds', ids.sort().join(',')] as const,
  },
  
  // Conversations
  conversations: {
    all: ['conversations'] as const,
    list: () => ['conversations', 'list'] as const,
    detail: (id: string) => ['conversations', 'detail', id] as const,
    messages: (conversationId: string) => ['conversations', 'messages', conversationId] as const,
  },
  
  // Forum
  forum: {
    posts: {
      all: ['forum', 'posts'] as const,
      list: (params?: any) => ['forum', 'posts', 'list', params] as const,
      detail: (id: string) => ['forum', 'posts', 'detail', id] as const,
    },
    comments: {
      list: (postId: string, params?: any) => ['forum', 'comments', postId, params] as const,
    },
  },
};

// ===== AUTH HOOKS =====

export function useAuthMe(options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: async () => {
      const result = await authAPI.getMe();
      if (!result.success) {
        throw new Error(result.error || 'Failed to get user');
      }
      return result.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - user data doesn't change often
    ...options,
  });
}

// ===== USER HOOKS =====

export function useUsersList(params?: any, options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: async () => {
      const result = await usersAPI.list(params);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch users');
      }
      return Array.isArray(result.data) ? result.data : (result.data?.data || []);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

export function useUser(id: string | null | undefined, options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: queryKeys.users.detail(id || ''),
    queryFn: async () => {
      if (!id) return null;
      const result = await usersAPI.get(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch user');
      }
      return result.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useUsersByIds(ids: string[], options?: Omit<UseQueryOptions<Record<string, any>, Error>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: queryKeys.users.byIds(ids),
    queryFn: async () => {
      if (ids.length === 0) return {};
      
      // Fetch all users and filter
      const result = await usersAPI.list({ limit: 1000 });
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch users');
      }
      
      const allUsers = Array.isArray(result.data) ? result.data : (result.data?.data || []);
      const usersMap: Record<string, any> = {};
      
      ids.forEach(id => {
        const user = allUsers.find((u: any) => u.id === id);
        if (user) {
          usersMap[id] = user;
        }
      });
      
      return usersMap;
    },
    enabled: ids.length > 0,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// ===== SESSION HOOKS =====

export function useSessionsList(params?: any, options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: queryKeys.sessions.list(params),
    queryFn: async () => {
      const result = await sessionsAPI.list(params);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch sessions');
      }
      return result.data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - sessions change more frequently
    ...options,
  });
}

export function useSessionsByStudent(studentId: string | null | undefined, params?: any, options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: queryKeys.sessions.byStudent(studentId || '', params),
    queryFn: async () => {
      if (!studentId) return { data: [], pagination: { total: 0 } };
      const result = await sessionsAPI.list({ ...params, studentId });
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch sessions');
      }
      return result;
    },
    enabled: !!studentId,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

export function useSession(id: string | null | undefined, options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: queryKeys.sessions.detail(id || ''),
    queryFn: async () => {
      if (!id) return null;
      const result = await sessionsAPI.get(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch session');
      }
      return result.data;
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

// ===== ENROLLMENT HOOKS =====

export function useEnrollmentsList(params?: any, options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: queryKeys.enrollments.list(params),
    queryFn: async () => {
      const result = await enrollmentsAPI.list(params);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch enrollments');
      }
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

export function useEnrollmentsByStudent(studentId: string | null | undefined, params?: any, options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: queryKeys.enrollments.byStudent(studentId || '', params),
    queryFn: async () => {
      if (!studentId) return { success: true, data: [], pagination: { total: 0 } };
      const result = await enrollmentsAPI.list({ ...params, studentId });
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch enrollments');
      }
      return result;
    },
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// ===== CLASS HOOKS =====

export function useClass(id: string | null | undefined, options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: queryKeys.classes.detail(id || ''),
    queryFn: async () => {
      if (!id) return null;
      const result = await classesAPI.get(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch class');
      }
      return result.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useClassesByIds(ids: string[], options?: Omit<UseQueryOptions<Record<string, any>, Error>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: queryKeys.classes.byIds(ids),
    queryFn: async () => {
      if (ids.length === 0) return {};
      
      const classesMap: Record<string, any> = {};
      const promises = ids.map(async (id) => {
        try {
          const result = await classesAPI.get(id);
          if (result.success && result.data) {
            classesMap[id] = result.data;
          }
        } catch (error) {
          console.error(`Failed to load class ${id}:`, error);
        }
      });
      
      await Promise.all(promises);
      return classesMap;
    },
    enabled: ids.length > 0,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// ===== CONVERSATION HOOKS =====

export function useConversationsList(options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: queryKeys.conversations.list(),
    queryFn: async () => {
      const result = await conversationsAPI.list();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch conversations');
      }
      return result.data || [];
    },
    staleTime: 1 * 60 * 1000, // 1 minute - conversations change frequently
    ...options,
  });
}

export function useConversationMessages(conversationId: string | null | undefined, options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: queryKeys.conversations.messages(conversationId || ''),
    queryFn: async () => {
      if (!conversationId) return [];
      const result = await conversationsAPI.getMessages(conversationId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch messages');
      }
      return result.data || [];
    },
    enabled: !!conversationId,
    staleTime: 30 * 1000, // 30 seconds - messages change very frequently
    ...options,
  });
}

// ===== FORUM HOOKS =====

export function useForumPosts(params?: any, options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: queryKeys.forum.posts.list(params),
    queryFn: async () => {
      const result = await forumAPI.posts.list(params);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch posts');
      }
      return Array.isArray(result.data) ? result.data : [];
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options,
  });
}

export function useForumComments(postId: string | null, params?: any, options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: queryKeys.forum.comments.list(postId || '', params),
    queryFn: async () => {
      if (!postId) return [];
      const result = await forumAPI.comments.list(postId, params);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch comments');
      }
      return Array.isArray(result.data) ? result.data : [];
    },
    enabled: !!postId,
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
}

// ===== MUTATION HOOKS (with cache invalidation) =====

export function useCreateSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const result = await sessionsAPI.create(data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create session');
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate sessions list cache
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
    },
  });
}

export function useCreateEnrollment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const result = await enrollmentsAPI.create(data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create enrollment');
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollments.all });
    },
  });
}

export function useCreateForumPost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const result = await forumAPI.posts.create(data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create post');
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.forum.posts.all });
    },
  });
}

export function useCreateForumComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ postId, data }: { postId: string; data: any }) => {
      const result = await forumAPI.comments.create(postId, data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create comment');
      }
      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.forum.comments.list(variables.postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.forum.posts.all });
    },
  });
}

// ===== UTILITY HOOKS =====

/**
 * Hook to prefetch data (for faster navigation)
 */
export function usePrefetch() {
  const queryClient = useQueryClient();
  
  return {
    prefetchUser: (id: string) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.users.detail(id),
        queryFn: async () => {
          const result = await usersAPI.get(id);
          return result.success ? result.data : null;
        },
      });
    },
    prefetchSession: (id: string) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.sessions.detail(id),
        queryFn: async () => {
          const result = await sessionsAPI.get(id);
          return result.success ? result.data : null;
        },
      });
    },
  };
}

