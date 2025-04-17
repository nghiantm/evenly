package com.evenly.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseShareCreateRequestDTO {
    private String expenseId;

    private String userId;

    @Digits(integer = 8, fraction = 2)
    @DecimalMin(value = "0.00")
    private BigDecimal amount;
}
