package com.shop.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.util.List;

public record OrderRequest(
        @NotBlank(message = "Full name is required")
        @Size(min = 2, max = 80, message = "Name must be 2-80 characters")
        String customerName,

        @NotBlank(message = "Email is required")
        @Email(message = "Enter a valid email address")
        @Size(max = 120, message = "Email is too long")
        String email,

        @NotBlank(message = "Phone is required")
        @Pattern(regexp = "^[0-9]{10}$", message = "Phone must be exactly 10 digits")
        String phone,

        @NotBlank(message = "Address is required")
        @Size(min = 5, max = 200, message = "Address must be 5-200 characters")
        String address,

        @NotBlank(message = "City is required")
        @Size(min = 2, max = 60, message = "City must be 2-60 characters")
        String city,

        @NotBlank(message = "PIN code is required")
        @Pattern(regexp = "^[0-9]{6}$", message = "PIN code must be 6 digits")
        String postalCode,

        @NotEmpty(message = "Your cart is empty")
        @Size(max = 30, message = "Too many items in one order")
        List<@Valid OrderItemRequest> items
) {
}
