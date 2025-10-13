const API_BASE = 'http://localhost:3000';

export const api = {
  // HCMUT SSO Authentication
  hcmutSSOLogin: async (credentials: { hcmutId: string; password: string }) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/hcmut-sso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  verifyToken: async () => {
    const token = localStorage.getItem('auth-token');
    const response = await fetch(`${API_BASE}/api/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  // Tutor Search
  searchTutors: async (filters: {
    q?: string;
    subject?: string;
    rating?: string;
    availability?: string;
    page?: number;
    limit?: number;
  }) => {
    const token = localStorage.getItem('auth-token');
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value.toString());
    });
    
    const response = await fetch(`${API_BASE}/api/tutors/search?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  getTutor: async (id: string) => {
    const token = localStorage.getItem('auth-token');
    const response = await fetch(`${API_BASE}/api/tutors/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  getSubjects: async () => {
    const response = await fetch(`${API_BASE}/api/subjects`);
    return response.json();
  }
};
