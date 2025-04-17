package com.evenly.controller;

import com.evenly.Utility.DivideUtility;
import com.evenly.dto.EqualExpenseCreateRequestDTO;
import com.evenly.dto.ExpenseCreateResponseDTO;
import com.evenly.entity.Expense;
import com.evenly.exception.InvalidCredentialException;
import com.evenly.service.ExpenseService;
import com.evenly.service.ExpenseShareService;
import com.evenly.service.GroupMemberService;
import com.evenly.service.JwtService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@Transactional
@RequestMapping("/expense")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    @Autowired
    private ExpenseShareService expenseShareService;

    @Autowired
    private GroupMemberService groupMemberService;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/equal")
    @Operation(
            summary = "Create an expense for an user in a group"
    )
    public ResponseEntity<ExpenseCreateResponseDTO> addExpenseEqual(@RequestHeader("Authorization") String authorizationHeader, @RequestBody EqualExpenseCreateRequestDTO expense) {
        String userId = jwtService.extractUsername(authorizationHeader.substring(7));
        if (!groupMemberService.isMember(expense.getGroupId(), userId)) {
            throw new InvalidCredentialException("Invalid credential.");
        }

        Expense createdExpense = expenseService.addExpense(expense);
        ExpenseCreateResponseDTO responseDTO = new ExpenseCreateResponseDTO();
        responseDTO.setId(createdExpense.getId());
        responseDTO.setPaidBy(createdExpense.getPaidBy());
        responseDTO.setGroupId(createdExpense.getGroupId());
        responseDTO.setAmount(createdExpense.getAmount());
        responseDTO.setDescription(createdExpense.getDescription());
        responseDTO.setCreatedDate(createdExpense.getCreatedDate());

        Map<String, BigDecimal> dividedAmounts = DivideUtility.equalDivide(expense.getUserIds(), expense.getAmount());
        expenseShareService.save(dividedAmounts, createdExpense.getId());

        return new ResponseEntity<>(
                responseDTO,
                HttpStatus.CREATED
        );
    }

    @DeleteMapping
    public ResponseEntity<HttpStatus> deleteExpense(@RequestHeader("Authorization") String authorizationHeader, @RequestParam("expenseId") String expenseId) {
        String userId = jwtService.extractUsername(authorizationHeader.substring(7));
        Expense expenseToBeDeleted = expenseService.getExpense(expenseId);
        if (expenseToBeDeleted == null || !groupMemberService.isMember(expenseToBeDeleted.getGroupId(), userId)) {
            throw new InvalidCredentialException("Invalid credential.");
        }

        expenseService.deleteExpense(expenseId);
        expenseShareService.delete(expenseId);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
