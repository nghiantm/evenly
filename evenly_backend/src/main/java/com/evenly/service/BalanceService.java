package com.evenly.service;

import com.evenly.entity.Balance;
import com.evenly.repository.BalanceRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
public class BalanceService {

    @Autowired
    BalanceRepository balanceRepository;

    @Transactional
    public void save(Map<String, BigDecimal> dividedAmounts, String paidBy, String groupId) {
        saveHelper(dividedAmounts, paidBy, groupId);
    }

    private void saveHelper(Map<String, BigDecimal> dividedAmounts, String paidBy, String groupId) {
        for (Map.Entry<String, BigDecimal> entry : dividedAmounts.entrySet()) {
            String userId = entry.getKey();
            BigDecimal amount = entry.getValue();

            if (userId.equals(paidBy)) {
                continue;
            }

            // Check if there's an existing balance in either direction
            Balance userOwesToPayer = balanceRepository
                    .findByGroupIdAndUserIdAndOwnedTo(groupId, userId, paidBy);

            if (userOwesToPayer != null) {
                // User already owes money to payer - just add to it
                userOwesToPayer.setAmount(userOwesToPayer.getAmount().add(amount));
                balanceRepository.save(userOwesToPayer);
            } else {
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
                } else {
                    // No existing balance - create new
                    createNewBalance(groupId, userId, paidBy, amount);
                }
            }
        }
    }

    private void createNewBalance(String groupId, String userId, String ownedTo, BigDecimal amount) {
        Balance balance = new Balance();
        balance.setGroupId(groupId);
        balance.setUserId(userId);
        balance.setOwnedTo(ownedTo);
        balance.setAmount(amount);
        balanceRepository.save(balance);
    }

    public List<Balance> getBalance(String groupId) {
        return balanceRepository.findAllByGroupId(groupId);
    }
}
