package com.evenly.controller;

import com.evenly.dto.MemberAddDTO;
import com.evenly.dto.UserProfileDTO;
import com.evenly.entity.Group;
import com.evenly.entity.GroupMember;
import com.evenly.entity.UserInfo;
import com.evenly.service.GroupMemberService;
import com.evenly.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.Date;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/group-member")
public class GroupMemberController {

    @Autowired
    private GroupMemberService groupMemberService;

    @Autowired
    private JwtService jwtService;

    @PostMapping
    public ResponseEntity<String> addMember(@RequestHeader("Authorization") String accessToken, @RequestBody MemberAddDTO newMemberDto) {
        String userId = jwtService.extractUsername(accessToken.substring(7));

        GroupMember newMember = new GroupMember();
        newMember.setUserId(newMemberDto.getUserId());
        newMember.setGroupId(newMemberDto.getGroupId());
        newMember.setAddedByUserId(userId);
        newMember.setAddDate(Date.valueOf(LocalDateTime.now().toLocalDate()));

        groupMemberService.addMember(newMember);
        return ResponseEntity.ok("Member added successfully.");
    }

    @GetMapping
    public ResponseEntity<List<UserProfileDTO>> getGroupMembers(@RequestParam("groupId") String groupId) {
        return ResponseEntity.ok(groupMemberService.getMembers(groupId));
    }

}
