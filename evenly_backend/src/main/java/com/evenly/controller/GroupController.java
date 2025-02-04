package com.evenly.controller;

import com.evenly.dto.GroupCreateRequestDTO;
import com.evenly.dto.GroupCreateResponseDTO;
import com.evenly.entity.Group;
import com.evenly.exception.MissingArgumentException;
import com.evenly.service.GroupService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/group")
public class GroupController {

    @Autowired
    private GroupService groupService;

    @PostMapping
    @Operation(
            summary = "Create a group for an user"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "201",
                    description = "Group created successfully",
                    content = {
                            @Content(mediaType = "application/json", schema = @Schema(implementation = GroupCreateResponseDTO.class))
                    }
            )
    })
    public ResponseEntity<GroupCreateResponseDTO> addGroup(@RequestBody GroupCreateRequestDTO group) {
        // Validate input
        if (group == null || !StringUtils.hasText(group.getCreatorId()) || !StringUtils.hasText(group.getName())) {
            throw new MissingArgumentException("Invalid group details provided.");
        }

        Group createdGroup = groupService.addGroup(group);
        GroupCreateResponseDTO responseDTO = new GroupCreateResponseDTO();
        responseDTO.setId(createdGroup.getId());
        responseDTO.setName(createdGroup.getName());
        responseDTO.setDescription(createdGroup.getDescription());
        responseDTO.setImageUrl(createdGroup.getImageUrl());
        responseDTO.setCreatedDate(createdGroup.getCreatedDate());
        responseDTO.setCreatorId(createdGroup.getCreatorId());

        return new ResponseEntity<>(
                responseDTO,
                HttpStatus.CREATED
        );
    }

    @DeleteMapping
    @Operation(
            summary = "Delete a group for an user"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Group deleted successfully"
            )
    })
    public ResponseEntity<String> deleteGroup(@RequestParam("groupId") String groupId) {
        return new ResponseEntity<>(
                groupService.deleteGroup(groupId),
                HttpStatus.OK
        );
    }
}
