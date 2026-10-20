package com.shop.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

/** Body for creating / updating a product (admin only). */
public record ProductRequest(
        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 120, message = "Name must be 2-120 characters")
        String name,

        @Size(max = 1000, message = "Description can be at most 1000 characters")
        String description,

        @NotNull(message = "Price is required")
        @DecimalMin(value = "1", message = "Price must be at least 1")
        @DecimalMax(value = "9999999", message = "Price is too high")
        @Digits(integer = 7, fraction = 2, message = "Price can have at most 2 decimals")
        BigDecimal price,

        @NotBlank(message = "Category is required")
        @Size(min = 2, max = 60, message = "Category must be 2-60 characters")
        String category,

        @Size(max = 500, message = "Image URL is too long")
        @Pattern(regexp = "^$|^https?://\\S+$", message = "Image must be a full http(s) URL")
        String imageUrl,

        @NotNull(message = "Stock is required")
        @Min(value = 0, message = "Stock cannot be negative")
        @Max(value = 100000, message = "Stock is too high")
        Integer stock,

        @NotNull(message = "Rating is required")
        @DecimalMin(value = "0", message = "Rating must be between 0 and 5")
        @DecimalMax(value = "5", message = "Rating must be between 0 and 5")
        Double rating,

        @NotNull(message = "Featured flag is required")
        Boolean featured,

        @Size(max = 40, message = "Badge can be at most 40 characters")
        String badge
) {
}
