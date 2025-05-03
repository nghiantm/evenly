package com.evenly.controller;

import com.evenly.Utility.ExpenseUtility;
import com.evenly.dto.EqualExpenseCreateRequestDTO;
import com.evenly.dto.ExpenseCreateResponseDTO;
import com.evenly.entity.Expense;
import com.evenly.entity.ExpenseShare;
import com.evenly.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
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
            summary = "Divide amount equally between specified users"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "201",
                    description = "Expense created successfully",
                    content = {
                            @Content(mediaType = "application/json", schema = @Schema(implementation = Expense.class))
                    }
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "One of users isn't in group",
                    content = {
                            @Content(mediaType = "none")
                    }
            )
    })
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

        Map<String, BigDecimal> dividedAmounts = ExpenseUtility.equalDivide(expense.getUserIds(), expense.getAmount());
        expenseShareService.save(dividedAmounts, createdExpense.getId());

        balanceService.save(dividedAmounts, createdExpense.getPaidBy(), expense.getGroupId());

        return new ResponseEntity<>(
                responseDTO,
                HttpStatus.CREATED
        );
    }

    @DeleteMapping
    @PreAuthorize("@groupAuthService.isMemberOfExpenseGroup(#expenseId)")
    public ResponseEntity<HttpStatus> deleteExpense(@RequestParam("expenseId") String expenseId) {
        Expense deletedExpense = expenseService.get(expenseId);
        expenseService.delete(expenseId);

        List<ExpenseShare> deletedShares = expenseShareService.getShares(expenseId);
        expenseShareService.delete(expenseId);
        Map<String, BigDecimal> dividedAmounts = ExpenseUtility.expenseSharesToDividedAmounts(deletedShares);

        balanceService.reverse(dividedAmounts, deletedExpense.getPaidBy(), deletedExpense.getGroupId());
        return new ResponseEntity<>(HttpStatus.OK);
    }
}