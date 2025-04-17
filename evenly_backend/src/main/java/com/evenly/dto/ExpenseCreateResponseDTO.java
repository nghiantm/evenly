package com.evenly.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ExpenseCreateResponseDTO {
    private String id;

    private String groupId;

    private String paidBy;

    private String amount;

    private String description;

    private String createdDate;
}
