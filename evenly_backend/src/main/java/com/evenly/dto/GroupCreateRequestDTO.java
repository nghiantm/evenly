package com.evenly.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupCreateRequestDTO {
    private String name;
    private String description;
    private String imageUrl;
    private String creatorId;
}
