import { apiClient } from '@/lib/apiClient';
import type {
  Group,
  GroupDetail,
  GroupMember,
  CreateGroupRequest,
  UpdateGroupRequest,
  AddMemberRequest,
} from '@/types';

export const groupsService = {
  async list(): Promise<Group[]> {
    const { data } = await apiClient.get<Group[]>('/groups');
    return data;
  },

  async create(body: CreateGroupRequest): Promise<Group> {
    const { data } = await apiClient.post<Group>('/groups', body);
    return data;
  },

  async getById(groupId: string): Promise<GroupDetail> {
    const { data } = await apiClient.get<GroupDetail>(`/groups/${groupId}`);
    return data;
  },

  async update(groupId: string, body: UpdateGroupRequest): Promise<Group> {
    const { data } = await apiClient.patch<Group>(`/groups/${groupId}`, body);
    return data;
  },

  /** Archives the group (sets archivedAt). Requires OWNER role. */
  async delete(groupId: string): Promise<void> {
    await apiClient.delete(`/groups/${groupId}`);
  },

  async addMember(groupId: string, body: AddMemberRequest): Promise<GroupMember> {
    const { data } = await apiClient.post<GroupMember>(`/groups/${groupId}/members`, body);
    return data;
  },

  async removeMember(groupId: string, userId: string): Promise<void> {
    await apiClient.delete(`/groups/${groupId}/members/${userId}`);
  },
};
