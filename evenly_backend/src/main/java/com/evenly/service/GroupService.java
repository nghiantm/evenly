package com.evenly.service;

import com.evenly.dto.GroupCreateRequestDTO;
import com.evenly.entity.Group;
import com.evenly.repository.GroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.time.LocalDateTime;

@Service
public class GroupService {

    @Autowired
    GroupRepository groupRepository;

    public Group addGroup(GroupCreateRequestDTO group) {
        Group newGroup = new Group();
        newGroup.setCreatorId(group.getCreatorId());
        newGroup.setName(group.getName());
        newGroup.setDescription(group.getDescription());
        newGroup.setImageUrl(group.getImageUrl());
        newGroup.setCreatedDate(Date.valueOf(LocalDateTime.now().toLocalDate()));
        return groupRepository.save(newGroup);
    }

    public String deleteGroup(String groupId) {
        groupRepository.deleteById(groupId);
        return "Group Deleted Successfully";
    }
}
