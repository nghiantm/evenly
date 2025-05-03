package com.evenly.service;

import com.evenly.entity.ExpenseShare;
import com.evenly.repository.ExpenseShareRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
public class ExpenseShareService {

    @Autowired
    ExpenseShareRepository expenseShareRepository;

    public void save(Map<String, BigDecimal> dividedAmounts, String expenseId) {
        for (String key : dividedAmounts.keySet()) {
            ExpenseShare expenseShare = new ExpenseShare();
            expenseShare.setExpenseId(expenseId);
            expenseShare.setUserId(key);
            expenseShare.setAmount(dividedAmounts.get(key));
            expenseShareRepository.save(expenseShare);
        }
    }

    public List<ExpenseShare> getShares(String expenseId) {
        return expenseShareRepository.getAllByExpenseId(expenseId);
    }

    public void delete(String expenseId) {
        expenseShareRepository.deleteAllByExpenseId(expenseId);
    }
}
