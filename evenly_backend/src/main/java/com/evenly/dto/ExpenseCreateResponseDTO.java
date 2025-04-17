package com.evenly.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.sql.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ExpenseCreateResponseDTO {
    private String id;

    private String groupId;

    private String paidBy;

    private BigDecimal amount;

    private String description;

    private Date createdDate;
}
