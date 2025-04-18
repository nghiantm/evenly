package com.evenly.controller;

import com.evenly.dto.BalanceResponseDTO;
import com.evenly.entity.Balance;
import com.evenly.service.BalanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/balance")
public class BalanceController {

    @Autowired
    private BalanceService balanceService;

    @GetMapping
    public ResponseEntity<List<BalanceResponseDTO>> getBalance(@RequestParam String groupId) {
        List<Balance> balances = balanceService.getBalance(groupId);
        List<BalanceResponseDTO> balanceResponse = new ArrayList<>();

        for (Balance balance : balances) {
            BalanceResponseDTO balanceResponseDTO = new BalanceResponseDTO();
            balanceResponseDTO.setGroupId(balance.getGroupId());
            balanceResponseDTO.setAmount(balance.getAmount());
            balanceResponseDTO.setOwnedTo(balance.getOwnedTo());
            balanceResponseDTO.setUserId(balance.getUserId());
            balanceResponse.add(balanceResponseDTO);
        }

        return new ResponseEntity<>(
                balanceResponse,
                HttpStatus.OK
        );
    }

}
