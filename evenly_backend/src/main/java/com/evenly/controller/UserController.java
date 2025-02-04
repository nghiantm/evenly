package com.evenly.controller;

import com.evenly.dto.UserProfileDTO;
import com.evenly.entity.UserInfo;
import com.evenly.exception.MissingTokenException;
import com.evenly.service.JwtService;
import com.evenly.service.UserInfoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserInfoService userInfoService;

    @Autowired
    private JwtService jwtService;

    @GetMapping
    public ResponseEntity<UserProfileDTO> getProfile(@RequestHeader("Authorization") String authorizationHeader) {
        UserInfo userInfo = userInfoService.getProfile(jwtService.extractUsername(authorizationHeader.substring(7)));
        UserProfileDTO userProfileDTO = new UserProfileDTO();
        userProfileDTO.setName(userInfo.getName());
        userProfileDTO.setEmail(userInfo.getEmail());
        userProfileDTO.setRoles(userInfo.getRoles());
        userProfileDTO.setImageUrl(userInfo.getImageUrl());

        return ResponseEntity.ok(userProfileDTO);
    }
}
