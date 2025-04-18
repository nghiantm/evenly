package com.evenly.repository;

import com.evenly.entity.Balance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BalanceRepository extends JpaRepository<Balance, Long> {
    boolean existsByGroupIdAndUserIdAndOwnedTo(String groupId, String userId, String ownedTo);
    Balance findByGroupIdAndUserIdAndOwnedTo(String groupId, String userId, String ownedTo);
    void deleteByGroupIdAndUserIdAndOwnedTo(String groupId, String userId, String ownedTo);
    List<Balance> findAllByGroupId(String groupId);
}
