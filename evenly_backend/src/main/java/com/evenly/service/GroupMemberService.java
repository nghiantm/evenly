package com.evenly.service;

import com.evenly.dto.UserProfileDTO;
import com.evenly.entity.GroupMember;
import com.evenly.repository.GroupMemberRepository;
import com.evenly.repository.UserInfoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Service
public class GroupMemberService {

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    @Autowired
    private UserInfoRepository userInfoRepository;

    public GroupMember addMember(GroupMember groupMember) {
        return groupMemberRepository.save(groupMember);
    }

    public List<UserProfileDTO> getMembers(@RequestParam String groupId) {
        List<GroupMember> groupMembers = groupMemberRepository.findByGroupId(groupId);

        List<String> userIds = groupMembers.stream()
                .map(GroupMember::getUserId)
                .toList();

        return userInfoRepository.findUserProfileDtoByEmail(userIds);
    }

}
