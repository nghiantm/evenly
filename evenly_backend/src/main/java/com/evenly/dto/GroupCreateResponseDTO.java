package com.evenly.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GroupCreateResponseDTO {
    private String id;
    private String name;
    private String description;
    private String imageUrl;
    private Date createdDate;
    private String creatorId;
}
