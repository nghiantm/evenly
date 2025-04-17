package com.evenly.service;

import com.evenly.dto.ExpenseShareCreateRequestDTO;
import com.evenly.entity.ExpenseShare;
import com.evenly.repository.ExpenseShareRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExpenseShareService {

    @Autowired
    ExpenseShareRepository expenseShareRepository;

    public void save(List<ExpenseShareCreateRequestDTO> shareList) {
        for (ExpenseShareCreateRequestDTO share : shareList) {
            ExpenseShare expenseShare = new ExpenseShare();
            expenseShare.setExpenseId(share.getExpenseId());
            expenseShare.setUserId(share.getUserId());
            expenseShare.setAmount(share.getAmount());
            expenseShareRepository.save(expenseShare);
        }
    }

    public void delete(String expenseId) {
        expenseShareRepository.deleteAllByExpenseId(expenseId);
    }
}
