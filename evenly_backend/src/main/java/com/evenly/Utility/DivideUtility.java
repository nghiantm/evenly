package com.evenly.Utility;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public final class DivideUtility {
    public static Map<String, BigDecimal> equalDivide(List<String> userIds, BigDecimal amount) {
        BigDecimal baseShare = amount.divide(new BigDecimal(userIds.size()), RoundingMode.DOWN);

        Map<String, BigDecimal> map = new HashMap<>();

        for (String userId : userIds) {
            map.put(userId, baseShare);
        }

        BigDecimal remainder = amount.subtract(baseShare.multiply(new BigDecimal(userIds.size())));
        while (remainder.compareTo(BigDecimal.ZERO) > 0) {
            System.out.println(remainder);
            for (String userId : map.keySet()) {
                map.put(userId, map.get(userId).add(new BigDecimal("0.01")));
                remainder = remainder.subtract(new BigDecimal("0.01"));
                if (remainder.compareTo(BigDecimal.ZERO) <= 0) {
                    break;
                }
            }
        }

        return map;
    }
}
