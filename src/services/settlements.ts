import { apiClient } from '@/lib/apiClient';
import type { Settlement, SettlementsResponse, CreateSettlementRequest } from '@/types';

export const settlementsService = {
  async list(groupId: string): Promise<SettlementsResponse> {
    const { data } = await apiClient.get<SettlementsResponse>(
      `/groups/${groupId}/settlements`
    );
    return data;
  },

  async create(groupId: string, body: CreateSettlementRequest): Promise<Settlement> {
    const { data } = await apiClient.post<Settlement>(
      `/groups/${groupId}/settlements`,
      body
    );
    return data;
  },

  async getById(groupId: string, settlementId: string): Promise<Settlement> {
    const { data } = await apiClient.get<Settlement>(
      `/groups/${groupId}/settlements/${settlementId}`
    );
    return data;
  },

  /** Deletes settlement and reverses its GroupTransfer. */
  async delete(groupId: string, settlementId: string): Promise<void> {
    await apiClient.delete(`/groups/${groupId}/settlements/${settlementId}`);
  },
};
