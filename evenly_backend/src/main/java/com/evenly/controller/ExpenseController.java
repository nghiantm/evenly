package com.evenly.controller;

import com.evenly.Utility.DivideUtility;
import com.evenly.dto.EqualExpenseCreateRequestDTO;
import com.evenly.dto.ExpenseCreateResponseDTO;
import com.evenly.entity.Expense;
import com.evenly.exception.InvalidCredentialException;
import com.evenly.service.*;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
    private BalanceService balanceService;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/equal")
    @PreAuthorize("@groupAuthService.isMemberOfGroup(#expense.groupId) && @groupAuthService.areMembersOfGroup(#expense.groupId, #expense.userIds)")
    @Operation(
            summary = "Create an expense for an user in a group"
    )
    public ResponseEntity<ExpenseCreateResponseDTO> addExpenseEqual(@RequestBody EqualExpenseCreateRequestDTO expense) {
        Expense createdExpense = expenseService.addExpense(expense);

        ExpenseCreateResponseDTO responseDTO = new ExpenseCreateResponseDTO(
                createdExpense.getId(),
                createdExpense.getGroupId(),
                createdExpense.getPaidBy(),
                createdExpense.getAmount(),
                createdExpense.getDescription(),
                createdExpense.getCreatedDate()
        );

        Map<String, BigDecimal> dividedAmounts = DivideUtility.equalDivide(expense.getUserIds(), expense.getAmount());
        expenseShareService.save(dividedAmounts, createdExpense.getId());

        balanceService.save(dividedAmounts, createdExpense.getPaidBy(), expense.getGroupId());

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