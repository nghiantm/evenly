package com.evenly.controller;

import com.evenly.dto.ExpenseCreateRequestDTO;
import com.evenly.dto.ExpenseCreateResponseDTO;
import com.evenly.entity.Expense;
import com.evenly.service.ExpenseService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/expense")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    @PostMapping
    @Operation(
            summary = "Create an expense for an user in a group"
    )
    public ResponseEntity<ExpenseCreateResponseDTO> addExpense(@RequestBody ExpenseCreateRequestDTO expense) {
        Expense createdExpense = expenseService.addExpense(expense);
        ExpenseCreateResponseDTO responseDTO = new ExpenseCreateResponseDTO();
        responseDTO.setId(createdExpense.getId());
        responseDTO.setPaidBy(createdExpense.getPaidBy());
        responseDTO.setGroupId(createdExpense.getGroupId());
        responseDTO.setAmount(createdExpense.getAmount());
        responseDTO.setDescription(createdExpense.getDescription());
        responseDTO.setCreatedDate(createdExpense.getCreatedDate());

        return new ResponseEntity<>(
                responseDTO,
                HttpStatus.CREATED
        );
    }

    @DeleteMapping
    public ResponseEntity<HttpStatus> deleteExpense(@RequestParam("expenseId") String expenseId) {
        expenseService.deleteExpense(expenseId);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
