package com.shop.dto;

import java.time.Instant;
import java.util.Map;

/** Uniform error body. {@code errors} maps field name -> message for validation failures. */
public record ApiError(int status, String message, Map<String, String> errors, Instant timestamp) {
    public static ApiError of(int status, String message) {
        return new ApiError(status, message, Map.of(), Instant.now());
    }

    public static ApiError of(int status, String message, Map<String, String> errors) {
        return new ApiError(status, message, errors, Instant.now());
    }
}
