package com.evenly.securiy.service;

import com.evenly.Utility.SecurityUtility;
import com.evenly.service.GroupMemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class GroupAuthService {

    @Autowired
    private GroupMemberService groupMemberService;

    /**
     * Checks if the current authenticated user is a member of the specified group.
     *
     * @param groupId The ID of the group.
     * @return true if the authenticated user is a member of the group, false otherwise.
     */
    public boolean isMemberOfGroup(String groupId) {
        return groupMemberService.isMember(groupId, SecurityUtility.getUserId());
    }

    /**
     * Checks if all users in the given list of user IDs are members of the specified group.
     *
     * @param groupId The ID of the group to check membership against.
     * @param userIds A list of user IDs to verify membership.
     * @return true if all users in the list are members of the group, false if at least one user is not a member.
     *
     * Example Usage:
     * - If groupId is "group123" and userIds are ["user1", "user2"]:
     *   - Returns true if both user1 and user2 belong to group123.
     *   - Returns false if either user1 or user2 is not a member of group123.
     */
    public boolean areMembersOfGroup(String groupId, List<String> userIds) {
        for (String userId : userIds) {
            if (!groupMemberService.isMember(groupId, userId)) {
                return false;
            }
        }
        return true;
    }
}
