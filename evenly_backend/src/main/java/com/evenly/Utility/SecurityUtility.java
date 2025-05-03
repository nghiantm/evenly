package com.evenly.Utility;

import com.evenly.exception.MissingTokenException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtility {
    private SecurityUtility() {
    }

    public static String getUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new MissingTokenException("User is not authenticated");
        }
        return auth.getName();

    }
}
