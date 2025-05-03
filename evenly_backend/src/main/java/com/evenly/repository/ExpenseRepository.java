package com.evenly.repository;

import com.evenly.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExpenseRepository extends JpaRepository<Expense, String> {
    void deleteExpenseById(String id);
    Expense getExpenseById(String id);
}
