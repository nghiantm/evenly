package com.evenly.service;

import com.evenly.dto.ExpenseCreateRequestDTO;
import com.evenly.entity.Expense;
import com.evenly.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.time.LocalDateTime;

@Service
public class ExpenseService {

    @Autowired
    ExpenseRepository expenseRepository;

    public Expense addExpense(ExpenseCreateRequestDTO expense) {
        Expense newExpense = new Expense();
        newExpense.setGroupId(expense.getGroupId());
        newExpense.setPaidBy(expense.getPaidBy());
        newExpense.setAmount(expense.getAmount());
        newExpense.setDescription(expense.getDescription());
        newExpense.setCreatedDate(Date.valueOf(LocalDateTime.now().toLocalDate()));
        return expenseRepository.save(newExpense);
    }

    public void deleteExpense(String expenseId) {
        expenseRepository.deleteById(expenseId);
    }
}
