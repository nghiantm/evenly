package com.evenly.repository;

import com.evenly.dto.UserProfileDTO;
import com.evenly.entity.UserInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserInfoRepository extends JpaRepository<UserInfo, Long> {
    boolean existsByEmail(String email);
    Optional<UserInfo> findByEmail(String email);

    @Query("SELECT new com.evenly.dto.UserProfileDTO(u.name, u.email, u.roles, u.imageUrl) FROM UserInfo u WHERE u.email IN :emails")
    List<UserProfileDTO> findUserProfileDtoByEmail(List<String> emails);
}
