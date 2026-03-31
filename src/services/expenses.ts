import { apiClient } from '@/lib/apiClient';
import type {
  Expense,
  ExpensesPage,
  CreateExpenseRequest,
  UpdateExpenseRequest,
} from '@/types';

export const expensesService = {
  async list(
    groupId: string,
    params: { page?: number; page_size?: number; created_by?: string } = {}
  ): Promise<ExpensesPage> {
    const { data } = await apiClient.get<ExpensesPage>(
      `/groups/${groupId}/expenses`,
      { params: { page: 1, page_size: 20, ...params } }
    );
    return data;
  },

  async create(groupId: string, body: CreateExpenseRequest): Promise<Expense> {
    const { data } = await apiClient.post<Expense>(
      `/groups/${groupId}/expenses`,
      { ...body, groupId }
    );
    return data;
  },

  async getById(groupId: string, expenseId: string): Promise<Expense> {
    const { data } = await apiClient.get<Expense>(
      `/groups/${groupId}/expenses/${expenseId}`
    );
    return data;
  },

  async update(
    groupId: string,
    expenseId: string,
    body: UpdateExpenseRequest
  ): Promise<Expense> {
    const { data } = await apiClient.patch<Expense>(
      `/groups/${groupId}/expenses/${expenseId}`,
      body
    );
    return data;
  },

  /** Soft-delete (sets deleted_at). */
  async delete(groupId: string, expenseId: string): Promise<void> {
    await apiClient.delete(`/groups/${groupId}/expenses/${expenseId}`);
  },
};
