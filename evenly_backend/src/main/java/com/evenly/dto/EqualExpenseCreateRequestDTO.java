package com.evenly.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EqualExpenseCreateRequestDTO {
    private String groupId;

    @Digits(integer = 8, fraction = 2)
    @DecimalMin(value = "0.00")
    private BigDecimal amount;

    private String description;

    private List<String> userIds;
}
