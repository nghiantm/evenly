package com.evenly.service;

import com.evenly.entity.Balance;
import com.evenly.repository.BalanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
public class BalanceService {

    @Autowired
    BalanceRepository balanceRepository;

    public void save(Map<String, BigDecimal> dividedAmounts, String ownedTo, String groupId) {
        for (String key : dividedAmounts.keySet()) {
            if (key.equals(ownedTo)) {
                continue;
            }

            Balance balance;

            if (!balanceRepository.existsByGroupIdAndUserIdAndOwnedTo(groupId, key, ownedTo)) {
                if (!balanceRepository.existsByGroupIdAndUserIdAndOwnedTo(groupId, ownedTo, key)) {
                    // balance doesn't exist -> create new balance
                    balance = new Balance();
                    balance.setGroupId(groupId);
                    balance.setUserId(key);
                    balance.setOwnedTo(ownedTo);
                    balance.setAmount(dividedAmounts.get(key));
                } else {
                    // balance exists in opposite direction -> subtract update
                    balance = balanceRepository.findByGroupIdAndUserIdAndOwnedTo(groupId, ownedTo, key);
                    BigDecimal subtractResult = balance.getAmount().subtract(dividedAmounts.get(key));
                    if (subtractResult.compareTo(BigDecimal.ZERO) < 0) {
                        balanceRepository.deleteByGroupIdAndUserIdAndOwnedTo(groupId, ownedTo, key);
                        balance = new Balance();
                        balance.setGroupId(groupId);
                        balance.setUserId(key);
                        balance.setOwnedTo(ownedTo);
                        balance.setAmount(subtractResult.abs());
                    } else if (subtractResult.compareTo(BigDecimal.ZERO) > 0) {
                        balance.setAmount(balance.getAmount().subtract(dividedAmounts.get(key)));
                    } else {
                        balanceRepository.deleteByGroupIdAndUserIdAndOwnedTo(groupId, ownedTo, key);
                    }
                }
            } else {
                // balance exist -> update
                balance = balanceRepository.findByGroupIdAndUserIdAndOwnedTo(groupId, key, ownedTo);
                balance.setAmount(balance.getAmount().add(dividedAmounts.get(key)));
            }

            balanceRepository.save(balance);
        }
    }

    public List<Balance> getBalance(String groupId) {
        return balanceRepository.findAllByGroupId(groupId);
    }
}
