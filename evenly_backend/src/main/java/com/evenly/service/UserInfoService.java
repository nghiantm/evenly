package com.evenly.service;

import com.evenly.entity.UserInfo;
import com.evenly.exception.InvalidCredentialException;
import com.evenly.repository.UserInfoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserInfoService implements UserDetailsService {

    @Autowired
    private UserInfoRepository repository;

    @Autowired
    private PasswordEncoder encoder;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<UserInfo> userDetail = repository.findByEmail(username); // Assuming 'email' is used as username

        // Converting UserInfo to UserDetails
        return userDetail.map(UserInfoDetails::new)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    public String register(UserInfo userInfo) {
        if (repository.existsByEmail(userInfo.getEmail())) {
            throw new InvalidCredentialException("Email already exists.");
        }

        // Encode password before saving the user
        UserInfo createdUser = userInfo;
        createdUser.setPassword(encoder.encode(userInfo.getPassword()));

        repository.save(createdUser);
        return "User Added Successfully";
    }

    public UserInfo getProfile(String email) {
        Optional<UserInfo> userDetail = repository.findByEmail(email);
        if (userDetail.isEmpty()) {
            throw new InvalidCredentialException("User not found.");
        }

        return userDetail.get();
    }
}