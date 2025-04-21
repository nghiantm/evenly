package com.evenly.service;

import com.evenly.entity.Balance;
import com.evenly.repository.BalanceRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Service class for managing balance operations between users in groups.
 * Handles creation, updating, and retrieval of balance records between users.
 */
@Service
public class BalanceService {

    @Autowired
    BalanceRepository balanceRepository;

    /**
     * Reverses the balance amounts in a group. This is typically used when
     * correcting or canceling a previous transaction.
     *
     * @param dividedAmounts Map of user IDs to their respective amounts
     * @param paidBy ID of the user who originally paid
     * @param groupId ID of the group where the transaction occurred
     */
    @Transactional
    public void reverse(Map<String, BigDecimal> dividedAmounts, String paidBy, String groupId) {
        for (Map.Entry<String, BigDecimal> entry : dividedAmounts.entrySet()) {
            String userId = entry.getKey();
            BigDecimal amount = entry.getValue();

            if (!userId.equals(paidBy)) {
                processBalance(paidBy, userId, groupId, amount);
            }
        }
    }

    /**
     * Saves new balance records for a group transaction.
     * Creates or updates balance records between the payer and other users.
     *
     * @param dividedAmounts Map of user IDs to their respective portions of the expense
     * @param paidBy ID of the user who paid for the expense
     * @param groupId ID of the group where the expense occurred
     */
    @Transactional
    public void save(Map<String, BigDecimal> dividedAmounts, String paidBy, String groupId) {
        for (Map.Entry<String, BigDecimal> entry : dividedAmounts.entrySet()) {
            String userId = entry.getKey();
            BigDecimal amount = entry.getValue();

            if (!userId.equals(paidBy)) {
                processBalance(userId, paidBy, groupId, amount);
            }
        }
    }

    /**
     * Process balance between two users for a specific amount in a group.
     * Handles various scenarios including:
     * - Creating new balance records
     * - Updating existing balances
     * - Handling direction changes in who owes whom
     * - Removing zero balances
     *
     * @param userId User who owes money (debtor)
     * @param paidBy User who is owed money (creditor)
     * @param groupId The group ID
     * @param amount Amount to process (positive means userId owes paidBy)
     */
    public void processBalance(String userId, String paidBy, String groupId, BigDecimal amount) {
        Balance userOwesToPayer = balanceRepository
                .findByGroupIdAndUserIdAndOwnedTo(groupId, userId, paidBy);

        if (userOwesToPayer != null) {
            // User already owes money to payer - just add to it
            userOwesToPayer.setAmount(userOwesToPayer.getAmount().add(amount));
            balanceRepository.save(userOwesToPayer);
            return;
        }

        Balance payerOwesToUser = balanceRepository
                .findByGroupIdAndUserIdAndOwnedTo(groupId, paidBy, userId);

        if (payerOwesToUser != null) {
            // Payer owes user money - need to subtract
            BigDecimal newAmount = payerOwesToUser.getAmount().subtract(amount);

            if (newAmount.compareTo(BigDecimal.ZERO) > 0) {
                // Payer still owes user
                payerOwesToUser.setAmount(newAmount);
                balanceRepository.save(payerOwesToUser);
            } else if (newAmount.compareTo(BigDecimal.ZERO) < 0) {
                // Direction changes - now user owes payer
                balanceRepository.delete(payerOwesToUser);
                createNewBalance(groupId, userId, paidBy, newAmount.abs());
            } else {
                // Balance is zero - remove the record
                balanceRepository.delete(payerOwesToUser);
            }
            return;
        }

        // No existing balance - create new
        createNewBalance(groupId, userId, paidBy, amount);
    }

    /**
     * Creates a new balance record between two users in a group.
     *
     * @param groupId ID of the group where the balance belongs
     * @param userId ID of the user who owes money
     * @param ownedTo ID of the user who is owed money
     * @param amount Amount of money owed (always positive)
     */
    private void createNewBalance(String groupId, String userId, String ownedTo, BigDecimal amount) {
        Balance balance = new Balance();
        balance.setGroupId(groupId);
        balance.setUserId(userId);
        balance.setOwnedTo(ownedTo);
        balance.setAmount(amount);
        balanceRepository.save(balance);
    }

    /**
     * Retrieves all balance records for a specific group.
     *
     * @param groupId ID of the group to get balances for
     * @return List of Balance objects representing all balances in the group
     */
    public List<Balance> getBalance(String groupId) {
        return balanceRepository.findAllByGroupId(groupId);
    }
}
