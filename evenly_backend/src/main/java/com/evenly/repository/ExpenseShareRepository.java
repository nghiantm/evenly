package com.evenly.repository;

import com.evenly.entity.ExpenseShare;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExpenseShareRepository extends JpaRepository<ExpenseShare, Long> {
    List<ExpenseShare> getAllByExpenseId(String expenseId);
    void deleteAllByExpenseId(String expenseId);
}
