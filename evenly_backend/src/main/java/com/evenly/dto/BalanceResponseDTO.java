package com.evenly.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BalanceResponseDTO {
    private String groupId;

    private String userId;

    private String ownedTo;

    private BigDecimal amount;
}
