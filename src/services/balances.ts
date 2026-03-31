import { apiClient } from '@/lib/apiClient';
import type { GroupBalances, DashboardBalance } from '@/types';

export const balancesService = {
  async getGroupBalances(groupId: string): Promise<GroupBalances> {
    const { data } = await apiClient.get<GroupBalances>(`/groups/${groupId}/balances`);
    return data;
  },

  /** Rebuilds all GroupTransfer rows from scratch. Requires OWNER or ADMIN. Returns 204. */
  async recalculate(groupId: string): Promise<void> {
    await apiClient.get(`/groups/${groupId}/balances/recalculate`);
  },

  async getMyBalances(): Promise<DashboardBalance> {
    const { data } = await apiClient.get<DashboardBalance>('/users/me/balances');
    return data;
  },
};
