import { apiClient } from '@/lib/apiClient';
import type { User, UserSearchResult, UpdateUserRequest, HealthResponse } from '@/types';

export const usersService = {
  async getHealth(): Promise<HealthResponse> {
    const { data } = await apiClient.get<HealthResponse>('/healthz');
    return data;
  },

  async getMe(): Promise<User> {
    const { data } = await apiClient.get<User>('/users/me');
    return data;
  },

  async updateMe(body: UpdateUserRequest): Promise<User> {
    const { data } = await apiClient.patch<User>('/users/me', body);
    return data;
  },

  async search(q: string, limit = 10): Promise<UserSearchResult[]> {
    const { data } = await apiClient.get<UserSearchResult[]>('/users/search', {
      params: { q, limit },
    });
    return data;
  },

  async getById(userId: string): Promise<User> {
    const { data } = await apiClient.get<User>(`/users/${userId}`);
    return data;
  },
};
