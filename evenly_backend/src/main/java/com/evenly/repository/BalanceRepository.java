package com.evenly.repository;

import com.evenly.entity.Balance;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BalanceRepository extends JpaRepository<Balance, Long> {
    boolean existsByGroupIdAndUserIdAndOwnedTo(String groupId, String userId, String ownedTo);
}
